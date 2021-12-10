import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import { Application } from '../../../declarations'
import { BadRequest } from '@feathersjs/errors'
import _ from 'lodash'
import Sequelize, { Op } from 'sequelize'
import getLocalServerIp from '../../util/get-local-server-ip'
import logger from '../../logger'
import config from '../../appconfig'

const releaseRegex = /^([a-zA-Z0-9]+)-/

interface Data {}

interface ServiceOptions {}
interface GameserverAddress {
  ipAddress: string | null
  port: string | null
}

const gsNameRegex = /gameserver-([a-zA-Z0-9]{5}-[a-zA-Z0-9]{5})/
const pressureThresholdPercent = 0.8

/**
 * An method which start server for instance
 * @author Vyacheslav Solovjov
 */
export async function getFreeGameserver(
  app: Application,
  iteration: number,
  locationId: string,
  channelId: string
): Promise<any> {
  await app.service('instance').Model.destroy({
    where: {
      assigned: true,
      assignedAt: {
        [Op.lt]: new Date(new Date().getTime() - 30000)
      }
    }
  })
  if (!config.kubernetes.enabled) {
    //Clear any instance assignments older than 30 seconds - those assignments have not been
    //used, so they should be cleared and the GS they were attached to can be used for something else.
    console.log('Local server spinning up new instance')
    const localIp = await getLocalServerIp(channelId != null)
    const stringIp = `${localIp.ipAddress}:${localIp.port}`
    return checkForDuplicatedAssignments(app, stringIp, iteration, locationId, channelId)
  }
  console.log('Getting free gameserver')
  const serverResult = await (app as any).k8AgonesClient.get('gameservers')

  const [dbServerConfig] = await app.service('server-setting').find()
  const serverConfig = dbServerConfig || config.server

  const readyServers = _.filter(serverResult.items, (server: any) => {
    const releaseMatch = releaseRegex.exec(server.metadata.name)
    return server.status.state === 'Ready' && releaseMatch != null && releaseMatch[1] === serverConfig.releaseName
  })
  const ipAddresses = readyServers.map((server) => `${server.status.address}:${server.status.ports[0].port}`)
  const assignedInstances = await app.service('instance').find({
    query: {
      ipAddress: {
        $in: ipAddresses
      },
      ended: false
    }
  })
  const nonAssignedInstances = ipAddresses.filter(
    (ipAddress) => !assignedInstances.data.find((instance) => instance.ipAddress === ipAddress)
  )
  const instanceIpAddress = nonAssignedInstances[Math.floor(Math.random() * nonAssignedInstances.length)]
  if (instanceIpAddress == null) {
    return {
      id: null,
      ipAddress: null,
      port: null
    }
  }
  return checkForDuplicatedAssignments(app, instanceIpAddress, iteration, locationId, channelId)
}

export async function checkForDuplicatedAssignments(
  app: Application,
  ipAddress: string,
  iteration: number,
  locationId: string,
  channelId: string
) {
  //Create an assigned instance at this IP
  const assignResult = await app.service('instance').create({
    ipAddress: ipAddress,
    locationId: locationId,
    channelId: channelId,
    assigned: true,
    assignedAt: new Date()
  })
  //Check to see if there are any other non-ended instances assigned to this IP
  const duplicateAssignment = await app.service('instance').find({
    query: {
      ipAddress: ipAddress,
      assigned: true,
      ended: false
    }
  })

  //If there's more than one instance assigned to this IP, then one of them was made in error, possibly because
  //there were two instance-provision calls at almost the same time.
  if (duplicateAssignment.total > 1) {
    let isFirstAssignment = true
    //Iterate through all of the assignments to this IP address. If this one is later than any other one,
    //then this one needs to find a different GS
    for (let instance of duplicateAssignment.data) {
      if (instance.id !== assignResult.id && instance.assignedAt < assignResult.assignedAt) {
        isFirstAssignment = false
        break
      }
    }
    if (!isFirstAssignment) {
      //If this is not the first assignment to this IP, remove the assigned instance row
      await app.service('instance').remove(assignResult.id)
      //If this is the 10th or more attempt to get a free gameserver, then there probably aren't any free ones,
      //
      if (iteration < 10) {
        return getFreeGameserver(app, iteration + 1, locationId, channelId)
      } else {
        console.log('Made 10 attempts to get free gameserver without success, returning null')
        return {
          id: null,
          ipAddress: null,
          port: null
        }
      }
    }
  }

  const split = ipAddress.split(':')
  return {
    id: assignResult.id,
    ipAddress: split[0],
    port: split[1]
  }
}

/**
 * @class for InstanceProvision service
 *
 * @author Vyacheslav Solovjov
 */
export class InstanceProvision implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any
  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}

  /**
   * A method which get instance of GameServer
   * @param availableLocationInstances for Gameserver
   * @param locationId
   * @param channelId
   * @returns id, ipAddress and port
   * @author Vyacheslav Solovjov
   */

  async getGSInService(availableLocationInstances, locationId: string, channelId: string): Promise<any> {
    await this.app.service('instance').Model.destroy({
      where: {
        assigned: true,
        assignedAt: {
          [Op.lt]: new Date(new Date().getTime() - 30000)
        }
      }
    })
    const instanceModel = (this.app.service('instance') as any).Model
    const instanceUserSort = _.orderBy(availableLocationInstances, ['currentUsers'], ['desc'])
    const nonPressuredInstances = instanceUserSort.filter((instance: typeof instanceModel) => {
      return instance.currentUsers < pressureThresholdPercent * instance.location.maxUsersPerInstance
    })
    const instances = nonPressuredInstances.length > 0 ? nonPressuredInstances : instanceUserSort
    if (!config.kubernetes.enabled) {
      logger.info('Resetting local instance to ' + instances[0].id)
      const localIp = await getLocalServerIp(channelId != null)
      return {
        id: instances[0].id,
        ...localIp
      }
    }
    const gsCleanup = await this.gsCleanup(instances[0])
    if (gsCleanup) {
      logger.info('GS did not exist and was cleaned up')
      if (availableLocationInstances.length > 1)
        return this.getGSInService(availableLocationInstances.slice(1), locationId, channelId)
      else return getFreeGameserver(this.app, 0, locationId, channelId)
    }
    logger.info('GS existed, using it')
    const ipAddressSplit = instances[0].ipAddress.split(':')
    return {
      id: instances[0].id,
      ipAddress: ipAddressSplit[0],
      port: ipAddressSplit[1]
    }
  }
  /**
   * A method which get clean up server
   *
   * @param instance of ipaddress and port
   * @returns {@Boolean}
   * @author Vyacheslav Solovjov
   */

  async gsCleanup(instance): Promise<boolean> {
    const gameservers = await (this.app as any).k8AgonesClient.get('gameservers')
    const gsIds = gameservers.items.map((gs) =>
      gsNameRegex.exec(gs.metadata.name) != null ? gsNameRegex.exec(gs.metadata.name)![1] : null!
    )
    const [ip, port] = instance.ipAddress.split(':')
    const match = gameservers?.items?.find((gs) => {
      const inputPort = gs.status.ports?.find((port) => port.name === 'default')
      return gs.status.address === ip && inputPort?.port?.toString() === port
    })
    if (match == null) {
      await this.app.service('instance').patch(instance.id, {
        ended: true
      })
      await this.app.service('gameserver-subdomain-provision').patch(
        null,
        {
          allocated: false
        },
        {
          query: {
            instanceId: null,
            gs_id: {
              $nin: gsIds
            }
          }
        }
      )
      return true
    }

    await this.app.service('instance').Model.destroy({
      where: {
        assigned: true,
        assignedAt: {
          [Op.lt]: new Date(new Date().getTime() - 30000)
        }
      }
    })
    return false
  }

  /**
   * A method which find running Gameserver
   *
   * @param params of query of locationId and instanceId
   * @returns {@function} getFreeGameserver and getGSInService
   * @author Vyacheslav Solovjov
   */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async find(params: Params): Promise<any> {
    try {
      let userId
      const locationId = params.query!.locationId
      const instanceId = params.query!.instanceId
      const channelId = params.query!.channelId
      const token = params.query!.token
      if (channelId != null) {
        // Check if JWT resolves to a user
        if (token != null) {
          const authResult = await (this.app.service('authentication') as any).strategies.jwt.authenticate(
            { accessToken: token },
            {}
          )
          const identityProvider = authResult['identity-provider']
          if (identityProvider != null) {
            userId = identityProvider.userId
          } else {
            throw new BadRequest('Invalid user credentials')
          }
        }
        const channelInstance = await (this.app.service('instance') as any).Model.findOne({
          where: {
            channelId: channelId,
            ended: false
          }
        })
        if (channelInstance == null) return getFreeGameserver(this.app, 0, null!, channelId)
        else {
          const ipAddressSplit = channelInstance.ipAddress.split(':')
          return {
            id: channelInstance.id,
            ipAddress: ipAddressSplit[0],
            port: ipAddressSplit[1]
          }
        }
      } else {
        if (locationId == null) {
          throw new BadRequest('Missing location ID')
        }
        const location = await this.app.service('location').get(locationId)
        if (location == null) {
          throw new BadRequest('Invalid location ID')
        }
        if (instanceId != null) {
          const instance = await this.app.service('instance').get(instanceId)
          if (instance == null || instance.ended === true) {
            throw new BadRequest('Invalid instance ID')
          }
          if (instance.currentUsers < location.maxUsersPerInstance) {
            const ipAddressSplit = instance.ipAddress.split(':')
            return {
              id: instance.id,
              ipAddress: ipAddressSplit[0],
              port: ipAddressSplit[1]
            }
          }
        }
        // Check if JWT resolves to a user
        if (token != null) {
          const authResult = await (this.app.service('authentication') as any).strategies.jwt.authenticate(
            { accessToken: token },
            {}
          )
          const identityProvider = authResult['identity-provider']
          if (identityProvider != null) {
            userId = identityProvider.userId
          } else {
            throw new BadRequest('Invalid user credentials')
          }
        }
        // const user = await this.app.service('user').get(userId)
        // If the user is in a party, they should be sent to their party's server as long as they are
        // trying to go to the scene their party is in.
        // If the user is going to a different scene, they will be removed from the party and sent to a random instance
        // if (user.partyId) {
        //   const partyOwnerResult = await this.app.service('party-user').find({
        //     query: {
        //       partyId: user.partyId,
        //       isOwner: true
        //     }
        //   });
        //   const partyOwner = (partyOwnerResult as any).data[0];
        //   // Only redirect non-party owners. Party owner will be provisioned below this and will pull the
        //   // other party members with them.
        //   if (partyOwner?.userId !== userId && partyOwner?.user.instanceId) {
        //     const partyInstance = await this.app.service('instance').get(partyOwner.user.instanceId);
        //     // Only provision the party's instance if the non-owner is trying to go to the party's scene.
        //     // If they're not, they'll be removed from the party
        //     if (partyInstance.locationId === locationId) {
        //       if (!config.kubernetes.enabled) {
        //         return getLocalServerIp();
        //       }
        //       const addressSplit = partyInstance.ipAddress.split(':');
        //       return {
        //         ipAddress: addressSplit[0],
        //         port: addressSplit[1]
        //       };
        //     } else {
        //       // Remove the party user for this user, as they're going to a different scene from their party.
        //       const partyUser = await this.app.service('party-user').find({
        //         query: {
        //           userId: user.id,
        //           partyId: user.partyId
        //         }
        //       });
        //       const {query, ...paramsCopy} = params;
        //       paramsCopy.query = {};
        //       await this.app.service('party-user').remove((partyUser as any).data[0].id, paramsCopy);
        //     }
        //   } else if (partyOwner?.userId === userId && partyOwner?.user.instanceId) {
        //     const partyInstance = await this.app.service('instance').get(partyOwner.user.instanceId);
        //     if (partyInstance.locationId === locationId) {
        //       if (!config.kubernetes.enabled) {
        //         return getLocalServerIp();
        //       }
        //       const addressSplit = partyInstance.ipAddress.split(':');
        //       return {
        //         ipAddress: addressSplit[0],
        //         port: addressSplit[1]
        //       };
        //     }
        //   }
        // }
        const friendsAtLocationResult = await (this.app.service('user') as any).Model.findAndCountAll({
          include: [
            {
              model: (this.app.service('user-relationship') as any).Model,
              where: {
                relatedUserId: userId,
                userRelationshipType: 'friend'
              }
            },
            {
              model: (this.app.service('instance') as any).Model,
              where: {
                locationId: locationId,
                ended: false
              }
            }
          ]
        })
        if (friendsAtLocationResult.count > 0) {
          const instances = {}
          friendsAtLocationResult.rows.forEach((friend) => {
            if (instances[friend.instanceId] == null) {
              instances[friend.instanceId] = 1
            } else {
              instances[friend.instanceId]++
            }
          })
          let maxFriends, maxInstanceId
          Object.keys(instances).forEach((key) => {
            if (maxFriends == null) {
              maxFriends = instances[key]
              maxInstanceId = key
            } else {
              if (instances[key] > maxFriends) {
                maxFriends = instances[key]
                maxInstanceId = key
              }
            }
          })
          const maxInstance = await this.app.service('instance').get(maxInstanceId)
          if (!config.kubernetes.enabled) {
            logger.info('Resetting local instance to ' + maxInstanceId)
            const localIp = await getLocalServerIp(false)
            return {
              id: maxInstanceId,
              ...localIp
            }
          }
          const ipAddressSplit = maxInstance.ipAddress.split(':')
          return {
            id: maxInstance.id,
            ipAddress: ipAddressSplit[0],
            port: ipAddressSplit[1]
          }
        }
        const availableLocationInstances = await (this.app.service('instance') as any).Model.findAll({
          where: {
            locationId: location.id,
            ended: false
          },
          include: [
            {
              model: (this.app.service('location') as any).Model,
              where: {
                maxUsersPerInstance: {
                  [Op.gt]: Sequelize.col('instance.currentUsers')
                }
              }
            },
            {
              model: (this.app.service('instance-authorized-user') as any).Model,
              required: false
            }
          ]
        })
        const allowedLocationInstances = availableLocationInstances.filter(
          (instance) =>
            instance.instance_authorized_users.length === 0 ||
            instance.instance_authorized_users.find(
              (instanceAuthorizedUser) => instanceAuthorizedUser.userId === userId
            )
        )
        if (allowedLocationInstances.length === 0) return getFreeGameserver(this.app, 0, locationId, null!)
        else return this.getGSInService(allowedLocationInstances, locationId, channelId)
      }
    } catch (err) {
      logger.error(err)
      throw err
    }
  }

  /**
   * A method which get specific instance
   *
   * @param id of instance
   * @param params
   * @returns id and text
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(id: Id, params: Params): Promise<Data> {
    return {
      id,
      text: `A new message with ID: ${id}!`
    }
  }

  /**
   * A method which is used to create instance
   *
   * @param data which is used to create instance
   * @param params
   * @returns data of instance
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create(data: Data, params: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return Promise.all(data.map((current) => this.create(current, params)))
    }

    return data
  }
  /**
   * A method used to update instance
   *
   * @param id
   * @param data which is used to update instance
   * @param params
   * @returns data of updated instance
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(id: NullableId, data: Data, params: Params): Promise<Data> {
    return data
  }

  /**
   *
   * @param id
   * @param data
   * @param params
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async patch(id: NullableId, data: Data, params: Params): Promise<Data> {
    return data
  }

  /**
   * A method used to remove specific instance
   *
   * @param id of instance
   * @param params
   * @returns id
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove(id: NullableId, params: Params): Promise<Data> {
    return { id }
  }
}
