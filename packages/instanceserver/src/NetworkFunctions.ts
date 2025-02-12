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

import { cloneDeep } from 'lodash'
import { Spark } from 'primus'

import { API } from '@ir-engine/common'
import {
  identityProviderPath,
  InstanceAttendanceData,
  instanceAttendancePath,
  instanceAuthorizedUserPath,
  instancePath,
  InstanceType,
  InviteCode,
  inviteCodeLookupPath,
  locationPath,
  messagePath,
  UserID,
  userKickPath,
  userPath,
  UserType
} from '@ir-engine/common/src/schema.type.module'
import { toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { AuthTask } from '@ir-engine/common/src/world/receiveJoinWorld'
import { Engine, EntityUUID } from '@ir-engine/ecs'
import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { respawnAvatar } from '@ir-engine/engine/src/avatar/functions/respawnAvatar'
import { Action, dispatchAction, getMutableState, getState, PeerID } from '@ir-engine/hyperflux'
import { NetworkActions, NetworkState } from '@ir-engine/network'
import { Application } from '@ir-engine/server-core/declarations'
import config from '@ir-engine/server-core/src/appconfig'
import { config as mediaConfig } from '@ir-engine/server-core/src/config'
import multiLogger from '@ir-engine/server-core/src/ServerLogger'
import { ServerState } from '@ir-engine/server-core/src/ServerState'
import getLocalServerIp from '@ir-engine/server-core/src/util/get-local-server-ip'
import { SpawnPoseState } from '@ir-engine/spatial'
import checkPositionIsValid from '@ir-engine/spatial/src/common/functions/checkPositionIsValid'
import { GroupComponent } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { InstanceServerState } from './InstanceServerState'
import { SocketWebRTCServerNetwork } from './SocketWebRTCServerFunctions'

const logger = multiLogger.child({ component: 'instanceserver:network' })
const isNameRegex = /instanceserver-([a-zA-Z0-9]{5}-[a-zA-Z0-9]{5})/

export const setupIPs = async () => {
  const app = API.instance as Application

  const serverState = getState(ServerState)
  const instanceServerState = getMutableState(InstanceServerState)

  if (config.kubernetes.enabled) {
    await cleanupOldInstanceservers(app)
    instanceServerState.instanceServer.set(await serverState.agonesSDK.getGameServer())
  }

  // Set up our instanceserver according to our current environment
  const announcedIp = config.kubernetes.enabled
    ? instanceServerState.instanceServer.value.status.address
    : await getLocalServerIp()

  // @todo put this in hyperflux state
  mediaConfig.mediasoup.webRtcTransport.listenIps = [
    {
      ip: '0.0.0.0',
      announcedIp
    }
  ]

  mediaConfig.mediasoup.webRtcServerOptions.listenInfos.forEach((listenInfo) => {
    listenInfo.announcedIp = announcedIp
    listenInfo.ip = '0.0.0.0'
  })

  mediaConfig.mediasoup.plainTransport.listenIp = {
    ip: '0.0.0.0',
    announcedIp
  }

  mediaConfig.mediasoup.recording.ip = config.kubernetes.enabled ? '127.0.0.1' : announcedIp
}

export async function cleanupOldInstanceservers(app: Application): Promise<void> {
  const serverState = getState(ServerState)

  const instances = (await app.service(instancePath).find({
    query: {
      ended: false
    },
    paginate: false
  })) as any as InstanceType[]
  const instanceservers = await serverState.k8AgonesClient.listNamespacedCustomObject(
    'agones.dev',
    'v1',
    'default',
    'gameservers'
  )

  await Promise.all(
    instances.map((instance) => {
      if (!instance.ipAddress) return false
      const [ip, port] = instance.ipAddress.split(':')
      const match = (instanceservers?.body! as any).items.find((is) => {
        if (is.status.ports == null || is.status.address === '') return false
        const inputPort = is.status.ports.find((port) => port.name === 'default')
        return is.status.address === ip && inputPort.port.toString() === port
      })
      return match == null
        ? app.service(instancePath).patch(instance.id, {
            ended: true
          })
        : Promise.resolve()
    })
  )

  const isIds = (instanceservers?.body! as any).items.map((is) =>
    isNameRegex.exec(is.metadata.name) != null ? isNameRegex.exec(is.metadata.name)![1] : null
  )
  return
}

/**
 * Returns true if a user has permission to access a specific instance
 * @param app
 * @param instance
 * @param userId
 * @returns
 */
export const authorizeUserToJoinServer = async (app: Application, instance: InstanceType, user: UserType) => {
  const userId = user.id
  // disallow users from joining media servers if they haven't accepted the TOS
  if (instance.channelId && !user.acceptedTOS) return false

  const authorizedUsers = (await app.service(instanceAuthorizedUserPath).find({
    query: {
      instanceId: instance.id,
      $limit: 0
    }
  })) as any
  if (authorizedUsers.total > 0) {
    const thisUserAuthorized = (await app.service(instanceAuthorizedUserPath).find({
      query: {
        instanceId: instance.id,
        userId,
        $limit: 0
      }
    })) as any
    if (thisUserAuthorized.total === 0) {
      logger.info(`User "${userId}" not authorized to be on this server.`)
      return false
    }
  }

  // check if user is not kicked in the instance for a duration
  const currentDate = new Date()
  const userKick = (await app.service(userKickPath).find({
    query: {
      userId,
      instanceId: instance.id,
      duration: {
        $gt: toDateTimeSql(currentDate)
      },
      $limit: 0
    }
  })) as any
  if (userKick.total > 0) {
    logger.info(`User "${userId}" has been kicked from this server for this duration`)
    return false
  }

  return true
}

export function getUserIdFromPeerID(network: SocketWebRTCServerNetwork, peerID: PeerID) {
  const client = Object.values(network.peers).find((c) => c.peerID === peerID)
  return client?.userId
}

function getCachedActionsForPeer(toPeerID: PeerID) {
  // send all cached and outgoing actions to joining user
  const cachedActions = [] as Required<Action>[]
  for (const action of Engine.instance.store.actions.cached) {
    if (action.$peer === toPeerID) continue
    if (action.$to === 'all' || action.$to === toPeerID) cachedActions.push({ ...action, $stack: undefined! })
  }

  return cachedActions
}

export const handleConnectingPeer = async (
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  user: UserType,
  inviteCode?: InviteCode
) => {
  const userId = user.id

  const app = API.instance as Application

  const instanceServerState = getState(InstanceServerState)

  const headers = spark.headers

  const newInstanceAttendance: InstanceAttendanceData = {
    instanceId: instanceServerState.instance.id,
    isChannel: instanceServerState.isMediaInstance,
    userId: userId,
    peerId: peerID
  }
  if (!instanceServerState.isMediaInstance) {
    const location = await app.service(locationPath).get(instanceServerState.instance.locationId!, { headers })
    newInstanceAttendance.sceneId = location.sceneId
  }
  const instanceAttendance = await app.service(instanceAttendancePath).create(newInstanceAttendance)

  dispatchAction(
    NetworkActions.peerJoined({
      $cache: true,
      $network: network.id,
      $topic: network.topic,
      peerID,
      peerIndex: instanceAttendance.peerIndex,
      userID: userId
    })
  )

  const onMessage = (message: any) => {
    network.onMessage(peerID, message)
  }

  spark.on('data', onMessage)

  const message = (data: any) => {
    spark.write(data)
  }

  const networkState = getState(NetworkState).networks[network.id]
  networkState.transports[peerID] = {
    message,
    buffer: () => {
      // Intentional no-op. SocketWebRTCServerFunctions defines an override for network.bufferToPeer and network.bufferToAll
    },
    end: () => {
      spark.end()
    }
  }

  logger.info('Connect to world from ' + userId)

  const cachedActions = getCachedActionsForPeer(peerID).map((action) => {
    return cloneDeep(action)
  })

  if (inviteCode && !instanceServerState.isMediaInstance) getUserSpawnFromInvite(network, user, inviteCode!)

  return {
    routerRtpCapabilities: network.routers[0].rtpCapabilities,
    peerIndex: instanceAttendance.peerIndex,
    cachedActions,
    hostPeerID: network.hostPeerID
  } as Omit<AuthTask, 'status'>
}

const getUserSpawnFromInvite = async (
  network: SocketWebRTCServerNetwork,
  user: UserType,
  inviteCode: InviteCode,
  iteration = 0
) => {
  if (inviteCode) {
    const inviteCodeLookups = await API.instance.service(inviteCodeLookupPath).find({
      query: {
        inviteCode
      }
    })

    if (inviteCodeLookups.length > 0) {
      const inviterUser = inviteCodeLookups[0]
      /** @todo we can probably do this for loop in the query itself */
      const inviterUserInstanceAttendance = inviterUser.instanceAttendance || []
      const userInstanceAttendance = await API.instance.service(instanceAttendancePath).find({
        query: {
          userId: user.id
        }
      })
      let bothOnSameInstance = false
      for (const instanceAttendance of inviterUserInstanceAttendance) {
        if (
          !instanceAttendance.isChannel &&
          userInstanceAttendance.data.find(
            (userAttendance) => !userAttendance.isChannel && userAttendance.id === instanceAttendance.id
          )
        )
          bothOnSameInstance = true
      }
      if (bothOnSameInstance) {
        const selfAvatarEntity = AvatarComponent.getUserAvatarEntity(user.id as UserID)
        if (!selfAvatarEntity) {
          if (iteration >= 100) {
            logger.warn(
              `User ${user.id} did not spawn their avatar within 5 seconds, abandoning attempts to spawn at inviter`
            )
            return
          }
          return setTimeout(() => getUserSpawnFromInvite(network, user, inviteCode, iteration + 1), 50)
        }
        const inviterUserId = inviterUser.id
        const inviterUserAvatarEntity = AvatarComponent.getUserAvatarEntity(inviterUserId as UserID)
        if (!inviterUserAvatarEntity) {
          if (iteration >= 100) {
            logger.warn(
              `inviting user ${inviterUserId} did not have a spawned avatar within 5 seconds, abandoning attempts to spawn at inviter`
            )
            return
          }
          return setTimeout(() => getUserSpawnFromInvite(network, user, inviteCode, iteration + 1), 50)
        }
        const inviterUserTransform = getComponent(inviterUserAvatarEntity, TransformComponent)

        /** @todo find nearest valid spawn position, rather than 2 in front */
        const inviterUserObject3d = getComponent(inviterUserAvatarEntity, GroupComponent)[0]
        // Translate infront of the inviter
        inviterUserObject3d.translateZ(2)

        const physicsWorld = Physics.getWorld(inviterUserAvatarEntity)!
        const validSpawnablePosition = checkPositionIsValid(physicsWorld, inviterUserObject3d.position, false)

        if (validSpawnablePosition) {
          const spawnPose = getState(SpawnPoseState)[user.id as any as EntityUUID]
          spawnPose.spawnPosition.copy(inviterUserObject3d.position)
          spawnPose.spawnRotation.copy(inviterUserTransform.rotation)
          respawnAvatar(selfAvatarEntity)
        }
      } else {
        logger.warn('The user who invited this user in no longer on this instance.')
      }
    }
  }
}

export async function handleDisconnect(network: SocketWebRTCServerNetwork, peerID: PeerID): Promise<any> {
  const userId = getUserIdFromPeerID(network, peerID) as UserID
  const disconnectedClient = network.peers[peerID]
  if (!disconnectedClient) return logger.warn(`Tried to handle disconnect for peer ${peerID} but was not found`)
  // On local, new connections can come in before the old sockets are disconnected.
  // The new connection will overwrite the socketID for the user's client.
  // This will only clear transports if the client's socketId matches the socket that's disconnecting.
  if (peerID === disconnectedClient?.peerID) {
    const instanceServerState = getState(InstanceServerState)
    const app = API.instance as Application

    if (!instanceServerState.isMediaInstance) {
      app
        .service(userPath)
        .get(userId)
        .then((user) => {
          app.service(messagePath).create(
            {
              instanceId: instanceServerState.instance.id,
              text: `${user.name} left`,
              isNotification: true,
              senderId: userId
            },
            {
              [identityProviderPath]: {
                userId: userId
              }
            } as any
          )
        })
        .catch((err) => {
          app.service(messagePath).create(
            {
              instanceId: instanceServerState.instance.id,
              text: `A user left`,
              isNotification: true,
              senderId: undefined
            },
            {
              [identityProviderPath]: {
                userId: userId
              }
            } as any
          )
        })
    }
    dispatchAction(
      NetworkActions.peerLeft({
        $cache: true,
        $network: network.id,
        $topic: network.topic,
        peerID,
        userID: userId
      })
    )
    logger.info(`Disconnecting user ${userId} on spark ${peerID}`)
  } else {
    logger.warn("Spark didn't match for disconnecting client.")
  }
}
