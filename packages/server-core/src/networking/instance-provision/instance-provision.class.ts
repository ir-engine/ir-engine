import { Id } from '@feathersjs/feathers'
/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { BadRequest, NotAuthenticated } from '@feathersjs/errors'
import { NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers'
import https from 'https'
import { Knex } from 'knex'
import _ from 'lodash'
import fetch from 'node-fetch'

import { InstanceServerProvisionResult } from '@etherealengine/common/src/interfaces/InstanceServerProvisionResult'
import { locationPath, LocationType } from '@etherealengine/engine/src/schemas/social/location.schema'
import { getState } from '@etherealengine/hyperflux'

import { ChannelID } from '@etherealengine/common/src/dbmodels/Channel'
import {
  instanceAuthorizedUserPath,
  InstanceAuthorizedUserType
} from '@etherealengine/engine/src/schemas/networking/instance-authorized-user.schema'
import { instancePath, InstanceType } from '@etherealengine/engine/src/schemas/networking/instance.schema'
import { identityProviderPath } from '@etherealengine/engine/src/schemas/user/identity-provider.schema'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { ServerState } from '../../ServerState'
import { toDateTimeSql } from '../../util/datetime-sql'
import getLocalServerIp from '../../util/get-local-server-ip'

const releaseRegex = /^([a-zA-Z0-9]+)-/

const isNameRegex = /instanceserver-([a-zA-Z0-9]{5}-[a-zA-Z0-9]{5})/
const pressureThresholdPercent = 0.8

/**
 * Gets an instanceserver that is not in use or reserved
 */
export async function getFreeInstanceserver({
  app,
  iteration,
  locationId,
  channelId,
  roomCode,
  userId,
  createPrivateRoom
}: {
  app: Application
  iteration: number
  locationId?: string
  channelId?: ChannelID
  roomCode?: string
  userId?: UserID
  createPrivateRoom?: boolean
}): Promise<InstanceServerProvisionResult> {
  await app.service(instancePath)._remove(null, {
    query: {
      assigned: true,
      assignedAt: {
        $lt: toDateTimeSql(new Date(new Date().getTime() - 30000))
      }
    }
  })
  if (!config.kubernetes.enabled) {
    //Clear any instance assignments older than 30 seconds - those assignments have not been
    //used, so they should be cleared and the IS they were attached to can be used for something else.
    logger.info('Local server spinning up new instance')
    const localIp = await getLocalServerIp(channelId != null)
    const stringIp = `${localIp.ipAddress}:${localIp.port}`
    return checkForDuplicatedAssignments({
      app,
      ipAddress: stringIp,
      iteration,
      locationId,
      channelId,
      roomCode,
      userId,
      createPrivateRoom
    })
  }
  logger.info('Getting free instanceserver')
  const k8AgonesClient = getState(ServerState).k8AgonesClient
  const serverResult = await k8AgonesClient.listNamespacedCustomObject('agones.dev', 'v1', 'default', 'gameservers')
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

  return checkForDuplicatedAssignments({
    app,
    ipAddress: instanceIpAddress,
    iteration,
    locationId,
    channelId,
    roomCode,
    userId,
    createPrivateRoom,
    podName: pod.metadata.name
  })
}

export async function checkForDuplicatedAssignments({
  app,
  ipAddress,
  iteration,
  locationId,
  channelId,
  roomCode,
  createPrivateRoom,
  userId,
  podName
}: {
  app: Application
  ipAddress: string
  iteration: number
  locationId?: string
  channelId?: ChannelID
  roomCode?: string | undefined
  createPrivateRoom?: boolean
  userId?: UserID
  podName?: string
}): Promise<InstanceServerProvisionResult> {
  /** since in local dev we can only have one instance server of each type at a time, we must force all old instances of this type to be ended */
  if (!config.kubernetes.enabled) {
    const query = { ended: false } as any
    if (locationId) query.locationId = locationId
    if (channelId) query.channelId = channelId
    await app.service(instancePath)._patch(null, { ended: true }, { query })
  }

  //Create an assigned instance at this IP
  const assignResult: any = (await app.service(instancePath).create({
    ipAddress: ipAddress,
    locationId: locationId,
    podName: podName,
    channelId: channelId,
    assigned: true,
    assignedAt: toDateTimeSql(new Date()),
    roomCode: '',
    currentUsers: 0
  })) as InstanceType
  //Check to see if there are any other non-ended instances assigned to this IP
  const duplicateIPAssignment: any = await app.service(instancePath).find({
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
  const duplicateLocationAssignment: any = await app.service(instancePath).find({
    query: duplicateLocationQuery
  })

  //If there's more than one instance assigned to this IP, then one of them was made in error, possibly because
  //there were two instance-provision calls at almost the same time.
  if (duplicateIPAssignment.total > 1) {
    let isFirstAssignment = true
    //Iterate through all of the assignments to this IP address. If this one is later than any other one,
    //then this one needs to find a different IS
    for (const instance of duplicateIPAssignment.data) {
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
      await app.service(instancePath)._remove(assignResult.id)
      //If this is the 10th or more attempt to get a free instanceserver, then there probably aren't any free ones,
      //
      if (iteration < 10) {
        return getFreeInstanceserver({ app, iteration: iteration + 1, locationId, channelId, roomCode, userId })
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
    for (const instance of duplicateLocationAssignment.data) {
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
      await app.service(instancePath)._remove(assignResult.id)
      return earlierInstance!
    }
  }

  // This is here to handle odd cases with externally unresponsive instanceserver pods.
  // It tries to make a GET request to the pod. If there's an error, or the response takes more than 2 seconds,
  // it assumes the pod is unresponsive. Locally, it just waits half a second and tries again - if the local
  // instanceservers are rebooting after the last person left, we just need to wait a bit for them to start.
  // In production, it attempts to delete that pod via the K8s API client and tries again.
  const responsivenessCheck = await Promise.race([
    new Promise<boolean>((resolve) => {
      setTimeout(() => {
        logger.warn(`Instanceserver at ${ipAddress} too long to respond, assuming it is unresponsive and killing`)
        resolve(false)
      }, config.server.instanceserverUnreachableTimeoutSeconds * 1000) // timeout after 2 seconds
    }),
    new Promise<boolean>((resolve) => {
      const options = {} as any
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
    await app.service(instancePath)._remove(assignResult.id)
    const k8DefaultClient = getState(ServerState).k8DefaultClient
    if (config.kubernetes.enabled)
      try {
        k8DefaultClient.deleteNamespacedPod(assignResult.podName, 'default')
      } catch (err) {
        //
      }
    else await new Promise((resolve) => setTimeout(() => resolve(null), 500))
    return getFreeInstanceserver({
      app,
      iteration: iteration + 1,
      locationId,
      channelId,
      roomCode,
      createPrivateRoom,
      userId
    })
  }

  if (createPrivateRoom && userId)
    await app.service(instanceAuthorizedUserPath).create({
      instanceId: assignResult.id,
      userId
    })

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
   * @param userId
   * @returns id, ipAddress and port
   */

  async getISInService({
    availableLocationInstances,
    locationId,
    channelId,
    roomCode,
    userId
  }: {
    availableLocationInstances: InstanceType[]
    locationId?: string
    channelId?: ChannelID
    roomCode?: undefined | string
    userId?: UserID
  }): Promise<InstanceServerProvisionResult> {
    await this.app.service(instancePath)._remove(null, {
      query: {
        assigned: true,
        assignedAt: {
          $lt: toDateTimeSql(new Date(new Date().getTime() - 30000))
        }
      }
    })
    const instanceUserSort = _.orderBy(availableLocationInstances, ['currentUsers'], ['desc'])
    const nonPressuredInstances = instanceUserSort.filter((instance) => {
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
        return this.getISInService({
          availableLocationInstances: availableLocationInstances.slice(1),
          locationId,
          channelId,
          roomCode
        })
      else return getFreeInstanceserver({ app: this.app, iteration: 0, locationId, channelId, roomCode, userId })
    }
    logger.info('IS existed, using it %o', instance)
    const ipAddressSplit = instance.ipAddress!.split(':')
    return {
      id: instance.id,
      ipAddress: ipAddressSplit[0],
      port: ipAddressSplit[1],
      roomCode: instance.roomCode,
      podName: instance.podName
    }
  }

  /**
   * A method that attempts to clean up an instanceserver that no longer exists
   * Currently-running instanceserver are fetched via Agones client and their IP addresses
   * compared against that of the instance in question. If there's no match, then the instance
   * record is out-of date, it should be set to 'ended'.
   * Returns false if the IS still exists and no cleanup was done, true if the IS does not exist and
   * a cleanup was performed.
   *
   * @param instance of ipaddress and port
   * @returns {@Boolean}
   */

  async isCleanup(instance: InstanceType): Promise<boolean> {
    const k8AgonesClient = getState(ServerState).k8AgonesClient
    const instanceservers = await k8AgonesClient.listNamespacedCustomObject(
      'agones.dev',
      'v1',
      'default',
      'gameservers'
    )
    const isIds = (instanceservers?.body as any)?.items.map((is) =>
      isNameRegex.exec(is.metadata.name) != null ? isNameRegex.exec(is.metadata.name)![1] : null!
    )
    const [ip, port] = instance.ipAddress!.split(':')
    const match = (instanceservers?.body as any)?.items?.find((is) => {
      const inputPort = is.status.ports?.find((port) => port.name === 'default')
      return is.status.address === ip && inputPort?.port?.toString() === port
    })
    if (match == null) {
      const patchInstance: any = {
        ended: true
      }
      await this.app.service(instancePath).patch(instance.id, { ...patchInstance })
      return true
    }

    await this.app.service(instancePath)._remove(null, {
      query: {
        assigned: true,
        assignedAt: {
          $lt: toDateTimeSql(new Date(new Date().getTime() - 30000))
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
      const channelId = params?.query?.channelId as ChannelID | undefined
      const roomCode = params?.query?.roomCode
      const createPrivateRoom = params?.query?.createPrivateRoom
      const token = params?.query?.token
      logger.info('instance-provision find %s %s %s %s', locationId, instanceId, channelId, roomCode)
      if (!token) throw new NotAuthenticated('No token provided')
      // Check if JWT resolves to a user
      const authResult = await (this.app.service('authentication') as any).strategies.jwt.authenticate(
        { accessToken: token },
        {}
      )
      const identityProvider = authResult[identityProviderPath]
      if (identityProvider != null) userId = identityProvider.userId
      else throw new BadRequest('Invalid user credentials')

      if (channelId != null) {
        try {
          await this.app.service('channel').get(channelId)
        } catch (err) {
          throw new BadRequest('Invalid channel ID')
        }
        const channelInstance = (await this.app.service(instancePath)._find({
          query: {
            channelId: channelId,
            ended: false,
            $limit: 1
          }
        })) as Paginated<InstanceType>
        if (channelInstance == null || channelInstance.data.length === 0)
          return getFreeInstanceserver({ app: this.app, iteration: 0, channelId, roomCode, userId })
        else {
          if (config.kubernetes.enabled) {
            const isCleanup = await this.isCleanup(channelInstance.data[0])
            if (isCleanup) return getFreeInstanceserver({ app: this.app, iteration: 0, channelId, roomCode, userId })
          }
          const actualInstance = channelInstance.data[0]
          const ipAddressSplit = actualInstance.ipAddress!.split(':')
          return {
            id: actualInstance.id,
            ipAddress: ipAddressSplit[0],
            port: ipAddressSplit[1],
            roomCode: actualInstance.roomCode
          }
        }
      } else {
        if (locationId == null) throw new BadRequest('Missing location ID')
        const location = await this.app.service(locationPath).get(locationId)
        if (location == null) throw new BadRequest('Invalid location ID')

        let instance: InstanceType | null = null

        if (instanceId != null) {
          instance = await this.app.service('instance').get(instanceId)
        } else if (roomCode != null) {
          const instances = (await this.app.service(instancePath)._find({
            query: {
              roomCode,
              ended: false
            },
            paginate: false
          })) as any as InstanceType[]
          instance = instances.length > 0 ? instances[0] : null
        }

        if ((roomCode && (instance == null || instance.ended === true)) || createPrivateRoom)
          return getFreeInstanceserver({ app: this.app, iteration: 0, locationId, roomCode, userId, createPrivateRoom })

        let isCleanup

        if (instance) {
          if (config.kubernetes.enabled) isCleanup = await this.isCleanup(instance)
          if (
            (!config.kubernetes.enabled || (config.kubernetes.enabled && !isCleanup)) &&
            instance.currentUsers < location.maxUsersPerInstance
          ) {
            if (roomCode && roomCode === instance.roomCode) {
              const existingInstanceAuthorizedUser = (await this.app.service(instanceAuthorizedUserPath).find({
                query: {
                  instanceId: instance.id,
                  userId
                }
              })) as Paginated<InstanceAuthorizedUserType>
              if (existingInstanceAuthorizedUser.total === 0)
                await this.app.service(instanceAuthorizedUserPath).create({
                  instanceId: instance.id,
                  userId
                })
            }
            const ipAddressSplit = instance.ipAddress!.split(':')
            return {
              id: instance.id,
              ipAddress: ipAddressSplit[0],
              port: ipAddressSplit[1],
              roomCode: instance.roomCode
            }
          }
        }
        // const user = await this.app.service(userPath).get(userId)
        // const friendsAtLocationResult = await this.app.service(userPath).Model.findAndCountAll({
        //   include: [
        //     {
        //       model: this.app.service('user-relationship').Model,
        //       where: {
        //         relatedUserId: userId,
        //         userRelationshipType: 'friend'
        //       }
        //     },
        //     {
        //       model: this.app.service('instance').Model,
        //       where: {
        //         locationId: locationId,
        //         ended: false
        //       }
        //     }
        //   ]
        // })
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

        const knexClient: Knex = this.app.get('knexClient')

        const response = await knexClient
          .from('instance')
          .join(locationPath, 'instance.locationId', '=', `${locationPath}.id`)
          .where('instance.locationId', '=', location.id)
          .andWhere('instance.ended', '=', false)
          .andWhere(`${locationPath}.maxUsersPerInstance`, '>', 'instance.currentUsers')
          .select()
          .options({ nestTables: true }) // https://github.com/knex/knex/issues/61#issuecomment-213949230

        const availableLocationInstances = response.map((item) => item.instance)

        const locations = (await this.app.service(locationPath).find({
          query: {
            id: {
              $in: availableLocationInstances.map((instance) => instance.locationId)
            }
          },
          paginate: false
        })) as any as LocationType[]
        const instanceAuthorizedUsers = (await this.app.service(instanceAuthorizedUserPath).find({
          query: {
            instanceId: {
              $in: availableLocationInstances.map((instance) => instance.id)
            }
          },
          paginate: false
        })) as any as InstanceAuthorizedUserType[]

        for (const instance of availableLocationInstances) {
          const location = locations.find((location) => location.id === instance.locationId)
          instance.location = location

          const authorizedUsers = instanceAuthorizedUsers.find((user) => user.instanceId === instance.id) || []
          instance.instance_authorized_users = authorizedUsers
        }

        const allowedLocationInstances = availableLocationInstances.filter(
          (instance) =>
            instance.instance_authorized_users.length === 0 ||
            instance.instance_authorized_users.find(
              (instanceAuthorizedUser) => instanceAuthorizedUser.userId === userId
            )
        )
        if (allowedLocationInstances.length === 0)
          return getFreeInstanceserver({ app: this.app, iteration: 0, locationId, roomCode, userId })
        else
          return this.getISInService({
            availableLocationInstances: allowedLocationInstances,
            locationId,
            channelId,
            roomCode,
            userId
          })
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
