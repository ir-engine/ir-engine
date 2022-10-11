import { BadRequest, NotAuthenticated } from '@feathersjs/errors'
import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import https from 'https'
import _ from 'lodash'
import fetch from 'node-fetch'
import Sequelize, { Op } from 'sequelize'

import { Instance } from '@xrengine/common/src/interfaces/Instance'
import { InstanceServerProvisionResult } from '@xrengine/common/src/interfaces/InstanceServerProvisionResult'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import getLocalServerIp from '../../util/get-local-server-ip'

const releaseRegex = /^([a-zA-Z0-9]+)-/

const isNameRegex = /instanceserver-([a-zA-Z0-9]{5}-[a-zA-Z0-9]{5})/
const pressureThresholdPercent = 0.8

/**
 * An method which start server for instance
 */
export async function getFreeInstanceserver(
  app: Application,
  iteration: number,
  locationId: string,
  channelId: string,
  roomCode = undefined as undefined | string
): Promise<InstanceServerProvisionResult> {
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
    //used, so they should be cleared and the IS they were attached to can be used for something else.
    logger.info('Local server spinning up new instance')
    const localIp = await getLocalServerIp(channelId != null)
    const stringIp = `${localIp.ipAddress}:${localIp.port}`
    return checkForDuplicatedAssignments(app, stringIp, iteration, locationId, channelId, roomCode)
  }
  logger.info('Getting free instanceserver')
  const serverResult = await app.k8AgonesClient.listNamespacedCustomObject('agones.dev', 'v1', 'default', 'gameservers')
  const readyServers = _.filter((serverResult.body as any).items, (server: any) => {
    const releaseMatch = releaseRegex.exec(server.metadata.name)
    return server.status.state === 'Ready' && releaseMatch != null && releaseMatch[1] === config.server.releaseName
  })
  const ipAddresses = readyServers.map((server) => `${server.status.address}:${server.status.ports[0].port}`)
  const assignedInstances: any = await app.service('instance').find({
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
      id: null!,
      ipAddress: null!,
      port: null!,
      podName: null!,
      roomCode: null!
    }
  }
  const split = instanceIpAddress.split(':')
  const pod = readyServers.find(
    (server) => server.status.address === split[0] && server.status.ports[0].port == split[1]
  )

  return checkForDuplicatedAssignments(
    app,
    instanceIpAddress,
    iteration,
    locationId,
    channelId,
    roomCode,
    pod.metadata.name
  )
}

export async function checkForDuplicatedAssignments(
  app: Application,
  ipAddress: string,
  iteration: number,
  locationId: string,
  channelId: string,
  roomCode = undefined as undefined | string,
  podName = undefined as undefined | string
): Promise<InstanceServerProvisionResult> {
  //Create an assigned instance at this IP
  const assignResult: any = await app.service('instance').create({
    ipAddress: ipAddress,
    locationId: locationId,
    podName: podName,
    channelId: channelId,
    assigned: true,
    assignedAt: new Date()
  })
  //Check to see if there are any other non-ended instances assigned to this IP
  const duplicateIPAssignment: any = await app.service('instance').find({
    query: {
      ipAddress: ipAddress,
      assigned: true,
      ended: false
    }
  })

  const duplicateLocationQuery = {
    assigned: true,
    ended: false
  } as any

  if (locationId) duplicateLocationQuery.locationId = locationId
  if (channelId) duplicateLocationQuery.channelId = channelId
  const duplicateLocationAssignment: any = await app.service('instance').find({
    query: duplicateLocationQuery
  })

  //If there's more than one instance assigned to this IP, then one of them was made in error, possibly because
  //there were two instance-provision calls at almost the same time.
  if (duplicateIPAssignment.total > 1) {
    let isFirstAssignment = true
    //Iterate through all of the assignments to this IP address. If this one is later than any other one,
    //then this one needs to find a different IS
    for (let instance of duplicateIPAssignment.data) {
      if (instance.id !== assignResult.id && instance.assignedAt < assignResult.assignedAt) {
        isFirstAssignment = false
        break
      }

      //If this instance was made at the exact same time as another, then randomly decide which one is removed
      //by converting their IDs to integers via base 16 and pick the 'larger' one. This is arbitrary, but
      //otherwise this process can get stuck if two provisions are occurring in lockstep.
      if (instance.id !== assignResult.id && instance.assignedAt.getTime() === assignResult.assignedAt.getTime()) {
        const integerizedInstanceId = parseInt(instance.id.replace(/-/g, ''), 16)
        const integerizedAssignResultId = parseInt(instance.id.replace(/-/g, ''), 16)
        if (integerizedAssignResultId < integerizedInstanceId) {
          isFirstAssignment = false
          break
        }
      }
    }
    if (!isFirstAssignment) {
      //If this is not the first assignment to this IP, remove the assigned instance row
      await app.service('instance').remove(assignResult.id)
      //If this is the 10th or more attempt to get a free instanceserver, then there probably aren't any free ones,
      //
      if (iteration < 10) {
        return getFreeInstanceserver(app, iteration + 1, locationId, channelId, roomCode)
      } else {
        logger.info('Made 10 attempts to get free instanceserver without success, returning null')
        return {
          id: null!,
          ipAddress: null!,
          port: null!,
          podName: null!,
          roomCode: null!
        }
      }
    }
  }

  //If there's more than one instance created for a location/channel, then we need to only return one of them
  //and remove the others, lest two different instanceservers be handling the same 'instance' of a location
  //or the same 'channel'.
  if (duplicateLocationAssignment.total > 1) {
    let earlierInstance: InstanceServerProvisionResult
    let isFirstAssignment = true
    //Iterate through all of the assignments for this location/channel. If this one is later than any other one,
    //then this one needs to find a different IS
    for (let instance of duplicateLocationAssignment.data) {
      if (instance.id !== assignResult.id && instance.assignedAt < assignResult.assignedAt) {
        isFirstAssignment = false
        const ipSplit = instance.ipAddress.split(':')
        earlierInstance = {
          id: instance.id,
          ipAddress: ipSplit[0],
          port: ipSplit[1],
          podName: instance.podName,
          roomCode: instance.roomCode
        }
        break
      }

      //If this instance was made at the exact same time as another, then randomly decide which one is removed
      //by converting their IDs to integers via base 16 and pick the 'larger' one. This is arbitrary, but
      //otherwise this process can get stuck if two provisions are occurring in lockstep.
      if (instance.id !== assignResult.id && instance.assignedAt.getTime() === assignResult.assignedAt.getTime()) {
        const integerizedInstanceId = parseInt(instance.id.replace(/-/g, ''), 16)
        const integerizedAssignResultId = parseInt(instance.id.replace(/-/g, ''), 16)
        if (integerizedAssignResultId < integerizedInstanceId) {
          isFirstAssignment = false
          const ipSplit = instance.ipAddress.split(':')
          earlierInstance = {
            id: instance.id,
            ipAddress: ipSplit[0],
            port: ipSplit[1],
            podName: instance.podName,
            roomCode: instance.roomCode
          }
          break
        }
      }
    }
    if (!isFirstAssignment) {
      //If this is not the first assignment to this IP, remove the assigned instance row
      await app.service('instance').remove(assignResult.id)
      return earlierInstance!
    }
  }

  // This is here to handle odd cases with externally unresponsive instanceserver pods.
  // It tries to make a GET request to the pod. If there's an error, or the response takes more than 2 seconds,
  // it assumes the pod is unresponsive. Locally, it just waits half a second and tries again - if the local
  // instanceservers are rebooting after the last person left, we just need to wait a bit for them to start.
  // In production, it attempts to delete that pod via the K8s API client and tries again.
  let responsivenessCheck: boolean
  responsivenessCheck = await Promise.race([
    new Promise<boolean>((resolve) => {
      setTimeout(() => {
        logger.warn(`Instanceserver at ${ipAddress} too long to respond, assuming it is unresponsive and killing`)
        resolve(false)
      }, config.server.instanceserverUnreachableTimeoutSeconds * 1000) // timeout after 2 seconds
    }),
    new Promise<boolean>((resolve) => {
      let options = {} as any
      let protocol = 'http://'
      if (!config.kubernetes.enabled) {
        protocol = 'https://'
        options.agent = new https.Agent({
          rejectUnauthorized: false
        })
      }

      fetch(protocol + ipAddress, options)
        .then((result) => {
          resolve(true)
        })
        .catch((err) => {
          logger.error(err)
          resolve(false)
        })
    })
  ])
  if (!responsivenessCheck) {
    await app.service('instance').remove(assignResult.id)
    if (config.kubernetes.enabled) app.k8DefaultClient.deleteNamespacedPod(assignResult.podName, 'default')
    else await new Promise((resolve) => setTimeout(() => resolve(null), 500))
    return getFreeInstanceserver(app, iteration + 1, locationId, channelId, roomCode)
  }

  const split = ipAddress.split(':')
  return {
    id: assignResult.id,
    ipAddress: split[0],
    port: split[1],
    podName: assignResult.podName,
    roomCode: assignResult.roomCode
  }
}

/**
 * @class for InstanceProvision service
 */
export class InstanceProvision implements ServiceMethods<any> {
  app: Application
  options: any
  docs: any
  constructor(options = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}

  /**
   * A method which gets and instance of Instanceserver
   * @param availableLocationInstances for Instanceserver
   * @param locationId
   * @param channelId
   * @param roomCode
   * @returns id, ipAddress and port
   */

  async getISInService(
    availableLocationInstances,
    locationId: string,
    channelId: string,
    roomCode = undefined as undefined | string
  ): Promise<InstanceServerProvisionResult> {
    await this.app.service('instance').Model.destroy({
      where: {
        assigned: true,
        assignedAt: {
          [Op.lt]: new Date(new Date().getTime() - 30000)
        }
      }
    })
    const instanceModel = this.app.service('instance').Model
    const instanceUserSort = _.orderBy(availableLocationInstances, ['currentUsers'], ['desc'])
    const nonPressuredInstances = instanceUserSort.filter((instance: typeof instanceModel) => {
      return instance.currentUsers < pressureThresholdPercent * instance.location.maxUsersPerInstance
    })
    const instances = nonPressuredInstances.length > 0 ? nonPressuredInstances : instanceUserSort
    const instance = instances[0]
    if (!config.kubernetes.enabled) {
      logger.info('Resetting local instance to ' + instance.id)
      const localIp = await getLocalServerIp(channelId != null)
      return {
        id: instance.id,
        roomCode: instance.roomCode,
        ...localIp
      }
    }
    const isCleanup = await this.isCleanup(instance)
    if (isCleanup) {
      logger.info('IS did not exist and was cleaned up')
      if (availableLocationInstances.length > 1)
        return this.getISInService(availableLocationInstances.slice(1), locationId, channelId, roomCode)
      else return getFreeInstanceserver(this.app, 0, locationId, channelId, roomCode)
    }
    logger.info('IS existed, using it %o', instance)
    const ipAddressSplit = instance.ipAddress.split(':')
    return {
      id: instance.id,
      ipAddress: ipAddressSplit[0],
      port: ipAddressSplit[1],
      roomCode: instance.roomCode,
      podName: instance.podName
    }
  }

  /**
   * A method that attempts to clean up a instanceserver that no longer exists
   * Currently-running instanceserver are fetched via Agones client and their IP addresses
   * compared against that of the instance in question. If there's no match, then the instance
   * record is out-of date, it should be set to 'ended', and its subdomain provision should be freed.
   * Returns false if the IS still exists and no cleanup was done, true if the IS does not exist and
   * a cleanup was performed.
   *
   * @param instance of ipaddress and port
   * @returns {@Boolean}
   */

  async isCleanup(instance): Promise<boolean> {
    const instanceservers = await this.app.k8AgonesClient.listNamespacedCustomObject(
      'agones.dev',
      'v1',
      'default',
      'gameservers'
    )
    const isIds = (instanceservers?.body as any)?.items.map((is) =>
      isNameRegex.exec(is.metadata.name) != null ? isNameRegex.exec(is.metadata.name)![1] : null!
    )
    const [ip, port] = instance.ipAddress.split(':')
    const match = (instanceservers?.body as any)?.items?.find((is) => {
      const inputPort = is.status.ports?.find((port) => port.name === 'default')
      return is.status.address === ip && inputPort?.port?.toString() === port
    })
    if (match == null) {
      const patchInstance: any = {
        ended: true
      }
      await this.app.service('instance').patch(instance.id, { ...patchInstance })
      await this.app.service('instanceserver-subdomain-provision').patch(
        null,
        {
          allocated: false
        },
        {
          query: {
            instanceId: null,
            is_id: {
              $nin: isIds
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
   * A method which finds a running Instanceserver
   *
   * @param params of query of locationId and instanceId
   * @returns {@function} getFreeInstanceserver and getISInService
   */

  async find(params?: Params): Promise<InstanceServerProvisionResult> {
    try {
      let userId
      const locationId = params?.query?.locationId
      const instanceId = params?.query?.instanceId
      const channelId = params?.query?.channelId
      const roomCode = params?.query?.roomCode
      const createNewRoom = params?.query?.createNewRoom
      const token = params?.query?.token
      logger.info('instance-provision find %s %s %s %s', locationId, instanceId, channelId, roomCode)
      if (!token) throw new NotAuthenticated('No token provided')
      // Check if JWT resolves to a user
      const authResult = await (this.app.service('authentication') as any).strategies.jwt.authenticate(
        { accessToken: token },
        {}
      )
      const identityProvider = authResult['identity-provider']
      if (identityProvider != null) userId = identityProvider.userId
      else throw new BadRequest('Invalid user credentials')

      if (channelId != null) {
        try {
          await this.app.service('channel').get(channelId)
        } catch (err) {
          throw new BadRequest('Invalid channel ID')
        }
        const channelInstance = await this.app.service('instance').Model.findOne({
          where: {
            channelId: channelId,
            ended: false
          }
        })
        if (channelInstance == null) return getFreeInstanceserver(this.app, 0, null!, channelId, roomCode)
        else {
          if (config.kubernetes.enabled) {
            const isCleanup = await this.isCleanup(channelInstance)
            if (isCleanup) return getFreeInstanceserver(this.app, 0, null!, channelId, roomCode)
          }
          const ipAddressSplit = channelInstance.ipAddress.split(':')
          return {
            id: channelInstance.id,
            ipAddress: ipAddressSplit[0],
            port: ipAddressSplit[1],
            roomCode: channelInstance.roomCode
          }
        }
      } else {
        if (locationId == null) throw new BadRequest('Missing location ID')
        const location = await this.app.service('location').get(locationId)
        if (location == null) throw new BadRequest('Invalid location ID')

        let instance: Instance | null = null

        if (instanceId != null) {
          instance = await this.app.service('instance').get(instanceId)
        } else if (roomCode != null) {
          const instances = await this.app.service('instance').Model.findAll({
            where: {
              roomCode,
              ended: false
            }
          })
          instance = instances.length > 0 ? instances[0] : null
        }

        if ((roomCode && (instance == null || instance.ended === true)) || createNewRoom)
          return getFreeInstanceserver(this.app, 0, locationId, null!, roomCode)

        let isCleanup

        if (instance) {
          if (config.kubernetes.enabled) isCleanup = await this.isCleanup(instance)
          if (
            (!config.kubernetes.enabled || (config.kubernetes.enabled && !isCleanup)) &&
            instance.currentUsers < location.maxUsersPerInstance
          ) {
            const ipAddressSplit = instance.ipAddress.split(':')
            return {
              id: instance.id,
              ipAddress: ipAddressSplit[0],
              port: ipAddressSplit[1],
              roomCode: instance.roomCode
            }
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
        const friendsAtLocationResult = await this.app.service('user').Model.findAndCountAll({
          include: [
            {
              model: this.app.service('user-relationship').Model,
              where: {
                relatedUserId: userId,
                userRelationshipType: 'friend'
              }
            },
            {
              model: this.app.service('instance').Model,
              where: {
                locationId: locationId,
                ended: false
              }
            }
          ]
        })
        // if (friendsAtLocationResult.count > 0) {
        //   const instances = {}
        //   friendsAtLocationResult.rows.forEach((friend) => {
        //     if (instances[friend.instanceId] == null) {
        //       instances[friend.instanceId] = 1
        //     } else {
        //       instances[friend.instanceId]++
        //     }
        //   })
        //   let maxFriends, maxInstanceId
        //   Object.keys(instances).forEach((key) => {
        //     if (maxFriends == null) {
        //       maxFriends = instances[key]
        //       maxInstanceId = key
        //     } else {
        //       if (instances[key] > maxFriends) {
        //         maxFriends = instances[key]
        //         maxInstanceId = key
        //       }
        //     }
        //   })
        //   const maxInstance = await this.app.service('instance').get(maxInstanceId)
        //   if (!config.kubernetes.enabled) {
        //     logger.info('Resetting local instance to ' + maxInstanceId)
        //     const localIp = await getLocalServerIp(false)
        //     return {
        //       id: maxInstanceId,
        //       roomCode: instance.roomCode,
        //       ...localIp
        //     }
        //   }
        //   const ipAddressSplit = maxInstance.ipAddress.split(':')
        //   return {
        //     id: maxInstance.id,
        //     ipAddress: ipAddressSplit[0],
        //     port: ipAddressSplit[1],
        //     roomCode: instance.roomCode
        //   }
        // }
        const availableLocationInstances = await this.app.service('instance').Model.findAll({
          where: {
            locationId: location.id,
            ended: false
          },
          include: [
            {
              model: this.app.service('location').Model,
              where: {
                maxUsersPerInstance: {
                  [Op.gt]: Sequelize.col('instance.currentUsers')
                }
              }
            },
            {
              model: this.app.service('instance-authorized-user').Model,
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
        if (allowedLocationInstances.length === 0)
          return getFreeInstanceserver(this.app, 0, locationId, null!, roomCode)
        else return this.getISInService(allowedLocationInstances, locationId, channelId, roomCode)
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
  async get(id: Id, params?: Params): Promise<any> {
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
  async create(data: any, params?: Params): Promise<any> {
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
  async update(id: NullableId, data: any, params?: Params): Promise<any> {
    return data
  }

  /**
   *
   * @param id
   * @param data
   * @param params
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async patch(id: NullableId, data: any, params?: Params): Promise<any> {
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
  async remove(id: NullableId, params?: Params): Promise<any> {
    return { id }
  }
}
