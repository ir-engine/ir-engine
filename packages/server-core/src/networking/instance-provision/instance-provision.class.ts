/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { BadRequest, NotAuthenticated } from '@feathersjs/errors'
import { Paginated, ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'
import https from 'https'
import { Knex } from 'knex'
import _ from 'lodash'
import fetch from 'node-fetch'

import {
  instanceAuthorizedUserPath,
  InstanceAuthorizedUserType
} from '@ir-engine/common/src/schemas/networking/instance-authorized-user.schema'
import { InstanceProvisionType } from '@ir-engine/common/src/schemas/networking/instance-provision.schema'
import { InstanceID, instancePath, InstanceType } from '@ir-engine/common/src/schemas/networking/instance.schema'
import { ChannelID, channelPath } from '@ir-engine/common/src/schemas/social/channel.schema'
import { LocationID, locationPath, LocationType, RoomCode } from '@ir-engine/common/src/schemas/social/location.schema'
import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'
import { toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { getState } from '@ir-engine/hyperflux'

import { instanceAttendancePath, InstanceAttendanceType } from '@ir-engine/common/src/schema.type.module'
import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { ServerState } from '../../ServerState'
import getLocalServerIp from '../../util/get-local-server-ip'
import { InstanceParams } from '../instance/instance.class'

const releaseRegex = /^([a-zA-Z0-9_-]+)-instanceserver/

const isNameRegex = /instanceserver-([a-zA-Z0-9]{5}-[a-zA-Z0-9]{5})/

/**
 * Gets an instanceserver that is not in use or reserved
 */
export async function getFreeInstanceserver({
  app,
  headers,
  iteration,
  locationId,
  channelId,
  roomCode,
  userId,
  createPrivateRoom,
  provisionConstraints
}: {
  app: Application
  headers: object
  iteration: number
  locationId?: LocationID
  channelId?: ChannelID
  roomCode?: RoomCode
  userId?: UserID
  createPrivateRoom?: boolean
  provisionConstraints?: object
}): Promise<InstanceProvisionType> {
  await app.service(instancePath).remove(null, {
    query: {
      assigned: true,
      assignedAt: {
        $lt: toDateTimeSql(new Date(new Date().getTime() - 60000))
      }
    },
    headers
  })
  if (!config.kubernetes.enabled) {
    //Clear any instance assignments older than 30 seconds - those assignments have not been
    //used, so they should be cleared and the IS they were attached to can be used for something else.
    logger.info('Local server spinning up new instance')
    const localIp = await getLocalServerIp()
    const stringIp = `${localIp}:${channelId ? '3032' : '3031'}`
    return checkForDuplicatedAssignments({
      app,
      headers,
      ipAddress: stringIp,
      iteration,
      locationId,
      channelId,
      roomCode,
      userId,
      createPrivateRoom,
      provisionConstraints
    })
  }
  logger.info('Getting free instanceserver')
  const k8AgonesClient = getState(ServerState).k8AgonesClient
  const serverResult = await k8AgonesClient.listNamespacedCustomObject('agones.dev', 'v1', 'default', 'gameservers')
  const readyServers = _.filter((serverResult.body as any).items, (server: any) => {
    const releaseMatch = releaseRegex.exec(server.metadata.name)
    let returned = server.status.state === 'Ready'
    if (returned && !provisionConstraints)
      returned = returned && releaseMatch != null && releaseMatch[1] === config.server.releaseName
    if (returned && provisionConstraints) {
      const keys = Object.keys(provisionConstraints)
      for (const key of keys) {
        const constraint = provisionConstraints[key]
        const provisionFunction = Object.keys(constraint)[0]
        const provisionValue = constraint[provisionFunction]
        const provisionFieldSplit = key.split('.')
        let serverField = server
        for (const item of provisionFieldSplit) {
          serverField = serverField[item]
          if (!serverField) break
        }
        switch (provisionFunction) {
          case 'lte':
            returned = returned && parseFloat(serverField) <= parseFloat(provisionValue)
            break
          case 'lt':
            returned = returned && parseFloat(serverField) < parseFloat(provisionValue)
            break
          case 'gte':
            returned = returned && parseFloat(serverField) >= parseFloat(provisionValue)
            break
          case 'gt':
            returned = returned && parseFloat(serverField) > parseFloat(provisionValue)
            break
          case 'eq':
            returned =
              returned &&
              (parseFloat(provisionValue)
                ? parseFloat(serverField) === parseFloat(provisionValue)
                : serverField === provisionValue)
            break
          default:
            break
        }
      }
    }
    return returned
  })
  const ipAddresses = readyServers.map((server) => `${server.status.address}:${server.status.ports[0].port}`)
  const assignedInstances: any = await app.service(instancePath).find({
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
    headers,
    ipAddress: instanceIpAddress,
    iteration,
    locationId,
    channelId,
    roomCode,
    userId,
    createPrivateRoom,
    podName: pod.metadata.name,
    provisionConstraints
  })
}

export async function checkForDuplicatedAssignments({
  app,
  headers,
  ipAddress,
  iteration,
  locationId,
  channelId,
  roomCode,
  createPrivateRoom,
  userId,
  podName,
  provisionConstraints
}: {
  app: Application
  headers: object
  ipAddress: string
  iteration: number
  locationId?: LocationID
  channelId?: ChannelID
  roomCode?: RoomCode | undefined
  createPrivateRoom?: boolean
  userId?: UserID
  podName?: string
  provisionConstraints?: object
}): Promise<InstanceProvisionType> {
  /** since in local dev we can only have one instance server of each type at a time, we must force all old instances of this type to be ended */
  if (!config.kubernetes.enabled) {
    const query = { ended: false } as any
    if (locationId) query.locationId = locationId
    if (channelId) query.channelId = channelId
    await app.service(instancePath).patch(null, { ended: true }, { query, headers })
  }

  //Create an assigned instance at this IP
  const assignResult: any = (await app.service(instancePath).create(
    {
      ipAddress: ipAddress,
      locationId: locationId as LocationID,
      podName: podName,
      channelId: channelId,
      assigned: true,
      assignedAt: toDateTimeSql(new Date()),
      roomCode: '' as RoomCode
    },
    { headers }
  )) as InstanceType
  await new Promise((resolve) =>
    setTimeout(() => {
      resolve(null)
    }, 100)
  )
  //Check to see if there are any other non-ended instances assigned to this IP
  const duplicateIPAssignment: any = await app.service(instancePath).find({
    query: {
      ipAddress: ipAddress,
      assigned: true,
      ended: false
    },
    headers
  })

  const duplicateLocationQuery = {
    assigned: true,
    ended: false
  } as any

  if (locationId) duplicateLocationQuery.locationId = locationId
  if (channelId) duplicateLocationQuery.channelId = channelId
  const duplicateLocationAssignment: any = await app.service(instancePath).find({
    query: duplicateLocationQuery,
    headers
  })

  //If there's more than one instance assigned to this IP, then one of them was made in error, possibly because
  //there were two instance-provision calls at almost the same time.
  if (duplicateIPAssignment.total > 1) {
    let isFirstAssignment = true
    //Iterate through all of the assignments to this IP address. If this one is later than any other one,
    //then this one needs to find a different IS
    for (const instance of duplicateIPAssignment.data) {
      if (
        instance.id !== assignResult.id &&
        new Date(instance.assignedAt).getTime() < new Date(assignResult.assignedAt).getTime()
      ) {
        isFirstAssignment = false
        break
      }

      //If this instance was made at the exact same time as another, then randomly decide which one is removed
      //by converting their IDs to integers via base 16 and pick the 'larger' one. This is arbitrary, but
      //otherwise this process can get stuck if two provisions are occurring in lockstep.
      if (
        instance.id !== assignResult.id &&
        new Date(instance.assignedAt).getTime() === new Date(assignResult.assignedAt).getTime()
      ) {
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
      await app.service(instancePath).remove(assignResult.id)
      //If this is the 10th or more attempt to get a free instanceserver, then there probably aren't any free ones,
      if (iteration < 10) {
        return getFreeInstanceserver({
          app,
          headers,
          iteration: iteration + 1,
          locationId,
          channelId,
          roomCode,
          userId,
          provisionConstraints
        })
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
    let earlierInstance: InstanceProvisionType
    let isFirstAssignment = true
    //Iterate through all of the assignments for this location/channel. If this one is later than any other one,
    //then this one needs to find a different IS
    for (const instance of duplicateLocationAssignment.data) {
      if (
        instance.id !== assignResult.id &&
        new Date(instance.assignedAt).getTime() < new Date(assignResult.assignedAt).getTime()
      ) {
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
      if (
        instance.id !== assignResult.id &&
        new Date(instance.assignedAt).getTime() === new Date(assignResult.assignedAt).getTime()
      ) {
        const integerizedInstanceId = parseInt(instance.id.replace(/-/g, ''), 16)
        const integerizedAssignResultId = parseInt(assignResult.id.replace(/-/g, ''), 16)
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
      await app.service(instancePath).remove(assignResult.id)
      return earlierInstance!
    }
  }

  // This is here to handle odd cases with externally unresponsive instanceserver pods.
  // It tries to make a GET request to the pod. If there's an error, or the response takes more than 2 seconds,
  // it assumes the pod is unresponsive. Locally, it just waits half a second and tries again - if the local
  // instanceservers are rebooting after the last person left, we just need to wait a bit for them to start.
  // In production, it attempts to delete that pod via the K8s API client and tries again.
  let retry = true
  const responsivenessCheck = await Promise.race([
    new Promise<boolean>((resolve) => {
      setTimeout(() => {
        retry = false
        resolve(false)
      }, config.server.instanceserverUnreachableTimeoutSeconds * 1000) // timeout after 2 seconds
    }),
    new Promise<boolean>(async (resolve) => {
      const options = {} as any
      let protocol = 'http://'
      if (!config.kubernetes.enabled) {
        protocol = 'https://'
        options.agent = new https.Agent({
          rejectUnauthorized: false
        })
      }

      // try fetching several times until it works, or timeout
      while (retry) {
        try {
          await fetch(protocol + ipAddress, options)
          retry = false
          resolve(true)
        } catch (e) {
          // wait and try again
          await new Promise((resolve) => setTimeout(() => resolve(null), 500))
        }
      }
    })
  ])

  if (!responsivenessCheck) {
    logger.warn(`Instanceserver at ${ipAddress} took too long to respond, assuming it is unresponsive and killing`)
    await app.service(instancePath).remove(assignResult.id)
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
      headers,
      iteration: iteration + 1,
      locationId,
      channelId,
      roomCode,
      createPrivateRoom,
      userId,
      provisionConstraints
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

export async function getP2PInstance({
  app,
  headers,
  createPrivateRoom,
  locationId,
  channelId,
  roomCode
}: {
  app: Application
  headers: object
  createPrivateRoom?: boolean
  locationId?: LocationID
  channelId?: ChannelID
  roomCode?: RoomCode
}): Promise<InstanceProvisionType> {
  const query = {
    assigned: true,
    ended: false
  } as any
  if (locationId) query.locationId = locationId
  if (channelId) query.channelId = channelId
  if (!channelId && !locationId) throw new BadRequest('Missing location ID or channel ID')
  /** @todo consider createPrivateRoom */
  const instances = (await app.service(instancePath).find({
    query,
    paginate: false
  })) as any as InstanceType[]

  const activeInstances = instances.filter(
    (instance) => instance.currentUsers < config.instanceserver.p2pMaxConnections
  )
  if (activeInstances.length > 0) {
    // console.log(`\n\n\nProvisioned existing P2P ${activeInstances[0].locationId ? 'world' : 'media'} instance`, activeInstances[0])
    return {
      id: activeInstances[0].id,
      p2p: true,
      roomCode: activeInstances[0].roomCode
    }
  }
  const newInstance = await app.service(instancePath).create(
    {
      locationId,
      channelId,
      assigned: true,
      assignedAt: toDateTimeSql(new Date())
    },
    { headers }
  )
  // console.log(`\n\n\nProvisioned new P2P ${locationId ? 'world' : 'media'} instance`, newInstance)
  return {
    id: newInstance.id,
    p2p: true,
    roomCode: newInstance.roomCode
  }
}

export interface InstanceProvisionParams extends KnexAdapterParams {
  serverSize?: string
}

/**
 * A class for Instance Provision service
 */
export class InstanceProvisionService implements ServiceInterface<InstanceProvisionType, InstanceProvisionParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  /**
   * A method which gets an instance of Instanceserver
   * @param availableLocationInstances for Instanceserver
   * @param headers
   * @param locationId
   * @param channelId
   * @param roomCode
   * @param userId
   * @param provisionConstraints
   * @returns id, ipAddress and port
   */

  async getISInService({
    availableLocationInstances,
    headers,
    locationId,
    channelId,
    roomCode,
    userId,
    provisionConstraints
  }: {
    availableLocationInstances: InstanceType[]
    headers: object
    locationId?: LocationID
    channelId?: ChannelID
    roomCode?: RoomCode
    userId?: UserID
    provisionConstraints?: object
  }): Promise<InstanceProvisionType> {
    await this.app.service(instancePath).remove(null, {
      query: {
        assigned: true,
        assignedAt: {
          $lt: toDateTimeSql(new Date(new Date().getTime() - 60000))
        }
      }
    })
    const nonFullInstances = availableLocationInstances.filter(
      (instance) => instance.currentUsers < instance.location.maxUsersPerInstance
    )
    if (nonFullInstances.length === 0)
      return getFreeInstanceserver({
        app: this.app,
        headers,
        iteration: 0,
        locationId,
        channelId,
        roomCode,
        userId,
        provisionConstraints
      })
    const instanceUserSort = _.orderBy(nonFullInstances, ['currentUsers'], ['desc'])
    const instance = instanceUserSort[0]
    if (!config.kubernetes.enabled) {
      logger.info('Resetting local instance to ' + instance.id)
      const localIp = await getLocalServerIp()
      return {
        id: instance.id,
        roomCode: instance.roomCode,
        ipAddress: localIp,
        port: channelId ? '3032' : '3031'
      }
    }
    const isCleanup = await this.isCleanup(instance)
    if (isCleanup) {
      logger.info('IS did not exist and was cleaned up')
      if (instanceUserSort.length > 1)
        return this.getISInService({
          availableLocationInstances: availableLocationInstances.slice(1),
          headers,
          locationId,
          channelId,
          roomCode,
          provisionConstraints
        })
      else
        return getFreeInstanceserver({
          app: this.app,
          headers,
          iteration: 0,
          locationId,
          channelId,
          roomCode,
          userId,
          provisionConstraints
        })
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
   * @returns {Boolean}
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

    await this.app.service(instancePath).remove(null, {
      query: {
        assigned: true,
        assignedAt: {
          $lt: toDateTimeSql(new Date(new Date().getTime() - 60000))
        }
      }
    })
    return false
  }

  /**
   * A method which finds a running Instanceserver
   *
   * @param params of query of locationId and instanceId
   * @returns {function} getFreeInstanceserver and getISInService
   */

  async find(params: InstanceProvisionParams) {
    try {
      let userId = '' as UserID
      const locationId = params.query?.locationId as LocationID
      const instanceId = params.query?.instanceId as InstanceID
      const channelId = params.query?.channelId as ChannelID | undefined
      const roomCode = params.query?.roomCode as RoomCode
      const createPrivateRoom = params.query?.createPrivateRoom
      const token = params.query?.token
      const provisionConstraints = params.serverSize ? { 'metadata.labels.serverSize': params.serverSize } : undefined
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

      if (channelId) {
        try {
          await this.app.service(channelPath).get(channelId)
        } catch (err) {
          throw new BadRequest(`Invalid channel ID: ${channelId}`)
        }

        if (config.instanceserver.p2pEnabled) {
          return getP2PInstance({
            app: this.app,
            headers: params.headers || {},
            channelId,
            roomCode
          })
        }

        const channelInstance = (await this.app.service(instancePath).find({
          query: {
            channelId: channelId,
            ended: false,
            $limit: 1
          }
        })) as Paginated<InstanceType>
        if (channelInstance == null || channelInstance.data.length === 0) {
          return getFreeInstanceserver({
            app: this.app,
            headers: params.headers || {},
            iteration: 0,
            channelId,
            roomCode,
            userId,
            provisionConstraints
          })
        } else {
          if (config.kubernetes.enabled) {
            const isCleanup = await this.isCleanup(channelInstance.data[0])
            if (isCleanup)
              return getFreeInstanceserver({
                app: this.app,
                headers: params.headers || {},
                iteration: 0,
                channelId,
                roomCode,
                userId,
                provisionConstraints
              })
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
          instance = await this.app.service(instancePath).get(instanceId)
        } else if (roomCode != null) {
          const instanceQuery = {
            query: {
              roomCode,
              ended: false
            },
            paginate: false
          } as InstanceParams

          // ensure that if we switch from p2p to non-p2p, we don't get a p2p instance
          if (!config.instanceserver.p2pEnabled) {
            instanceQuery.query!.ipAddress = {
              $ne: 'null'
            }
          }
          const instances = (await this.app.service(instancePath).find(instanceQuery)) as any as InstanceType[]
          instance = instances.length > 0 ? instances[0] : null
        }

        if ((roomCode && (!instance || instance.ended)) || createPrivateRoom) {
          if (config.instanceserver.p2pEnabled) {
            return getP2PInstance({
              app: this.app,
              headers: params.headers || {},
              channelId,
              roomCode
            })
          }

          return getFreeInstanceserver({
            app: this.app,
            headers: params.headers || {},
            iteration: 0,
            locationId,
            roomCode,
            userId,
            createPrivateRoom,
            provisionConstraints
          })
        }

        let isCleanup

        if (instance) {
          if (config.instanceserver.p2pEnabled) {
            return getP2PInstance({
              app: this.app,
              headers: params.headers || {},
              locationId,
              roomCode
            })
          }

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
        //       model: this.app.service(userRelationshipPath).Model,
        //       where: {
        //         relatedUserId: userId,
        //         userRelationshipType: 'friend'
        //       }
        //     },
        //     {
        //       model: this.app.service(instancePath).Model,
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
        //   const maxInstance = await this.app.service(instancePath).get(maxInstanceId)
        //   if (!config.kubernetes.enabled) {
        //     logger.info('Resetting local instance to ' + maxInstanceId)
        //     const localIp = await getLocalServerIp()
        //     return {
        //       id: maxInstanceId,
        //       roomCode: instance.roomCode,
        //       ipAddress: localIp,
        //       port: 3031
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

        if (config.instanceserver.p2pEnabled) {
          return getP2PInstance({
            app: this.app,
            headers: params.headers || {},
            locationId,
            roomCode
          })
        }

        const knexClient: Knex = this.app.get('knexClient')

        const response = await knexClient
          .from(instancePath)
          .join(locationPath, `${instancePath}.locationId`, '=', `${locationPath}.id`)
          .where(`${instancePath}.locationId`, '=', location.id)
          .andWhere(`${instancePath}.ended`, '=', false)
          .andWhere(`${locationPath}.maxUsersPerInstance`, '>', `${instancePath}.currentUsers`)
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
          instance.location = locations.find((location) => location.id === instance.locationId)

          instance.instance_authorized_users =
            instanceAuthorizedUsers.find((user) => user.instanceId === instance.id) || []

          const peers = (await this.app.service(instanceAttendancePath).find({
            query: {
              instanceId: instance.id,
              ended: false,
              updatedAt: {
                // Only consider instances that have been updated in the last 10 seconds
                $gt: toDateTimeSql(new Date(new Date().getTime() - 10000))
              }
            },
            paginate: false
          })) as any as InstanceAttendanceType[]
          const users = _.uniq(peers.map((peer) => peer.userId))
          instance.currentUsers = users.length
        }

        const allowedLocationInstances = availableLocationInstances.filter(
          (instance) =>
            instance.instance_authorized_users.length === 0 ||
            instance.instance_authorized_users.find(
              (instanceAuthorizedUser) => instanceAuthorizedUser.userId === userId
            )
        )
        if (allowedLocationInstances.length === 0) {
          return getFreeInstanceserver({
            app: this.app,
            headers: params.headers || {},
            iteration: 0,
            locationId,
            roomCode,
            userId,
            provisionConstraints
          })
        } else {
          return this.getISInService({
            availableLocationInstances: allowedLocationInstances,
            headers: params.headers || {},
            locationId,
            roomCode,
            userId,
            provisionConstraints
          })
        }
      }
    } catch (err) {
      logger.error(err)
      throw err
    }
  }
}
