import AWS from 'aws-sdk'
import { DataConsumer, DataProducer } from 'mediasoup/node/lib/types'
import { Socket } from 'socket.io'

import { UserInterface } from '@xrengine/common/src/dbmodels/UserInterface'
import { User } from '@xrengine/common/src/interfaces/User'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { SpawnPoints } from '@xrengine/engine/src/avatar/AvatarSpawnSystem'
import checkPositionIsValid from '@xrengine/engine/src/common/functions/checkPositionIsValid'
import { performance } from '@xrengine/engine/src/common/functions/performance'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { JoinWorldProps } from '@xrengine/engine/src/networking/functions/receiveJoinWorld'
import { WorldNetworkAction } from '@xrengine/engine/src/networking/functions/WorldNetworkAction'
import { AvatarProps } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { dispatchAction } from '@xrengine/hyperflux'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'
import config from '@xrengine/server-core/src/appconfig'
import { localConfig } from '@xrengine/server-core/src/config'
import multiLogger from '@xrengine/server-core/src/logger'
import getLocalServerIp from '@xrengine/server-core/src/util/get-local-server-ip'

import { SocketWebRTCServerNetwork } from './SocketWebRTCServerNetwork'
import { closeTransport } from './WebRTCFunctions'

const logger = multiLogger.child({ component: 'instanceserver:network' })
const isNameRegex = /instanceserver-([a-zA-Z0-9]{5}-[a-zA-Z0-9]{5})/

export const setupSubdomain = async (network: SocketWebRTCServerNetwork) => {
  const app = network.app
  let stringSubdomainNumber: string

  if (config.kubernetes.enabled) {
    await cleanupOldInstanceservers(network)
    app.instanceServer = await app.agonesSDK.getGameServer()

    // We used to provision subdomains for instanceservers, e.g. 00001.instanceserver.domain.com
    // This turned out to be unnecessary, and in fact broke Firefox's ability to connect via
    // UDP, so the following was commented out.
    // const name = app.instanceServer.objectMeta.name
    // const isIdentifier = isNameRegex.exec(name)!
    // stringSubdomainNumber = await getFreeSubdomain(transport, isIdentifier[1], 0)
    // app.isSubdomainNumber = stringSubdomainNumber
    //
    // const Route53 = new AWS.Route53({ ...config.aws.route53.keys })
    // const params = {
    //   ChangeBatch: {
    //     Changes: [
    //       {
    //         Action: 'UPSERT',
    //         ResourceRecordSet: {
    //           Name: `${stringSubdomainNumber}.${config.instanceserver.domain}`,
    //           ResourceRecords: [{ Value: app.instanceserver.status.address }],
    //           TTL: 0,
    //           Type: 'A'
    //         }
    //       }
    //     ]
    //   },
    //   HostedZoneId: config.aws.route53.hostedZoneId
    // }
    // if (config.instanceserver.local !== true) await Route53.changeResourceRecordSets(params as any).promise()
  }

  // Set up our instanceserver according to our current environment
  const localIp = await getLocalServerIp(app.isChannelInstance)
  const announcedIp = config.kubernetes.enabled ? app.instanceServer.status.address : localIp.ipAddress

  localConfig.mediasoup.webRtcTransport.listenIps = [
    {
      ip: '0.0.0.0',
      announcedIp
    }
  ]
}

export async function getFreeSubdomain(
  network: SocketWebRTCServerNetwork,
  isIdentifier: string,
  subdomainNumber: number
): Promise<string> {
  const stringSubdomainNumber = subdomainNumber.toString().padStart(config.instanceserver.identifierDigits, '0')
  const subdomainResult = await network.app.service('instanceserver-subdomain-provision').find({
    query: {
      is_number: stringSubdomainNumber
    }
  })
  if ((subdomainResult as any).total === 0) {
    await network.app.service('instanceserver-subdomain-provision').create({
      allocated: true,
      is_number: stringSubdomainNumber,
      is_id: isIdentifier
    })

    await new Promise((resolve) =>
      setTimeout(async () => {
        resolve(true)
      }, 500)
    )

    const newSubdomainResult = (await network.app.service('instanceserver-subdomain-provision').find({
      query: {
        is_number: stringSubdomainNumber
      }
    })) as any
    if (newSubdomainResult.total > 0 && newSubdomainResult.data[0].gs_id === isIdentifier) return stringSubdomainNumber
    else return getFreeSubdomain(network, isIdentifier, subdomainNumber + 1)
  } else {
    const subdomain = (subdomainResult as any).data[0]
    if (subdomain.allocated === true || subdomain.allocated === 1) {
      return getFreeSubdomain(network, isIdentifier, subdomainNumber + 1)
    }
    await network.app.service('instanceserver-subdomain-provision').patch(subdomain.id, {
      allocated: true,
      is_id: isIdentifier
    })

    await new Promise((resolve) =>
      setTimeout(async () => {
        resolve(true)
      }, 500)
    )

    const newSubdomainResult = (await network.app.service('instanceserver-subdomain-provision').find({
      query: {
        is_number: stringSubdomainNumber
      }
    })) as any
    if (newSubdomainResult.total > 0 && newSubdomainResult.data[0].gs_id === isIdentifier) return stringSubdomainNumber
    else return getFreeSubdomain(network, isIdentifier, subdomainNumber + 1)
  }
}

export async function cleanupOldInstanceservers(network: SocketWebRTCServerNetwork): Promise<void> {
  const instances = await network.app.service('instance').Model.findAndCountAll({
    offset: 0,
    limit: 1000,
    where: {
      ended: false
    }
  })
  const instanceservers = await network.app.k8AgonesClient.listNamespacedCustomObject(
    'agones.dev',
    'v1',
    'default',
    'gameservers'
  )

  await Promise.all(
    instances.rows.map((instance) => {
      if (!instance.ipAddress) return false
      const [ip, port] = instance.ipAddress.split(':')
      const match = (instanceservers?.body! as any).items.find((is) => {
        if (is.status.ports == null || is.status.address === '') return false
        const inputPort = is.status.ports.find((port) => port.name === 'default')
        return is.status.address === ip && inputPort.port.toString() === port
      })
      return match == null
        ? network.app.service('instance').patch(instance.id, {
            ended: true
          })
        : Promise.resolve()
    })
  )

  const isIds = (instanceservers?.body! as any).items.map((is) =>
    isNameRegex.exec(is.metadata.name) != null ? isNameRegex.exec(is.metadata.name)![1] : null
  )

  await network.app.service('instanceserver-subdomain-provision').patch(
    null,
    {
      allocated: false
    },
    {
      query: {
        is_id: {
          $nin: isIds
        }
      }
    }
  )

  return
}

export function getUserIdFromSocketId(socketId: string) {
  const client = Array.from(Engine.instance.currentWorld.clients.values()).find((c) => c.socketId === socketId)
  return client?.userId
}

export async function handleConnectToWorld(
  network: SocketWebRTCServerNetwork,
  socket: Socket,
  data,
  callback,
  userId: UserId,
  user: UserInterface
) {
  logger.info('Connect to world from ' + userId)

  if (disconnectClientIfConnected(network, socket, userId)) return callback(null! as any)

  const avatarDetail = (await network.app.service('avatar').get(user.avatarId)) as AvatarProps

  // Create a new client object
  // and add to the dictionary
  const world = Engine.instance.currentWorld
  const userIndex = world.userIndexCount++
  world.clients.set(userId, {
    userId: userId,
    index: userIndex,
    name: user.name,
    avatarDetail,
    socket: socket,
    socketId: socket.id,
    lastSeenTs: Date.now(),
    joinTs: Date.now(),
    media: {},
    consumerLayers: {},
    stats: {},
    subscribedChatUpdates: [],
    dataConsumers: new Map<string, DataConsumer>(), // Key => id of data producer
    dataProducers: new Map<string, DataProducer>() // Key => label of data channel
  })

  world.userIdToUserIndex.set(userId, userIndex)
  world.userIndexToUserId.set(userIndex, userId)

  // Return initial world state to client to set things up
  callback({
    routerRtpCapabilities: network.routers.instance[0].rtpCapabilities
  })
}

function disconnectClientIfConnected(network: SocketWebRTCServerNetwork, socket: Socket, userId: UserId) {
  // If we are already logged in, kick the other socket
  const world = Engine.instance.currentWorld
  if (world.clients.has(userId) && world.clients.get(userId)!.socketId !== socket.id) {
    // const client = world.clients.get(userId)!
    logger.info('Client already logged in, disallowing new connection')

    // todo: kick old client instead of new one
    // logger.info('Client already exists, kicking the old client and disconnecting')
    // client.socket?.emit(MessageTypes.Kick.toString(), 'You joined this world on another device')
    // client.socket?.disconnect()
    // for (const eid of world.getOwnedNetworkObjects(userId)) {
    //   const { networkId } = getComponent(eid, NetworkObjectComponent)
    //   dispatchFrom(network.hostId, () => WorldNetworkAction.destroyObject({ $from: userId, networkId }))
    // }
    return true
  }
}

export const handleJoinWorld = async (
  network: SocketWebRTCServerNetwork,
  socket: Socket,
  data,
  callback: (args: JoinWorldProps) => void,
  joinedUserId: UserId,
  user
) => {
  logger.info('Join World Request Received: %o', { joinedUserId, data, user })
  if (disconnectClientIfConnected(network, socket, joinedUserId)) return callback(null! as any)

  let spawnPose = SpawnPoints.instance.getRandomSpawnPoint()
  const inviteCode = data['inviteCode']

  if (inviteCode) {
    const result = (await network.app.service('user').find({
      query: {
        action: 'invite-code-lookup',
        inviteCode: inviteCode
      }
    })) as any

    let users = result.data as User[]
    if (users.length > 0) {
      const inviterUser = users[0]
      if (inviterUser.instanceId === user.instanceId) {
        const inviterUserId = inviterUser.id
        const inviterUserAvatarEntity = Engine.instance.currentWorld.getUserAvatarEntity(inviterUserId as UserId)
        const inviterUserTransform = getComponent(inviterUserAvatarEntity, TransformComponent)

        // Translate infront of the inviter
        const inviterUserObject3d = getComponent(inviterUserAvatarEntity, Object3DComponent)
        inviterUserObject3d.value.translateZ(2)

        const validSpawnablePosition = checkPositionIsValid(inviterUserObject3d.value.position, false)

        if (validSpawnablePosition) {
          spawnPose = {
            position: inviterUserObject3d.value.position,
            rotation: inviterUserTransform.rotation
          }
        }
      } else {
        logger.warn('The user who invited this user in no longer on this instance.')
      }
    }
  }

  logger.info('User successfully joined world: %o', { joinedUserId, data, spawnPose })
  const world = Engine.instance.currentWorld
  const client = world.clients.get(joinedUserId)!

  if (!client) return callback(null! as any)

  clearCachedActionsForDisconnectedUsers(network)
  clearCachedActionsForUser(network, joinedUserId)

  // send all client info
  // const clients = [] as Array<{ userId: UserId; name: string; index: number }>
  // for (const [userId, client] of world.clients) {
  //   clients.push({ userId, index: client.userIndex, name: client.name })
  // }

  // send all cached and outgoing actions to joining user
  const cachedActions = [] as Required<Action>[]
  for (const action of Engine.instance.store.actions.cached[network.hostId] as Array<
    ReturnType<typeof WorldNetworkAction.spawnAvatar>
  >) {
    // we may have a need to remove the check for the prefab type to enable this to work for networked objects too
    if (action.type === 'network.SPAWN_OBJECT' && action.prefab === 'avatar') {
      const ownerId = action.$from
      if (ownerId) {
        const entity = world.getNetworkObject(ownerId, action.networkId)
        if (typeof entity !== 'undefined') {
          const transform = getComponent(entity, TransformComponent)
          action.parameters.position = transform.position
          action.parameters.rotation = transform.rotation
        }
      }
    }
    if (action.$to === 'all' || action.$to === joinedUserId) cachedActions.push({ ...action, $stack: undefined! })
  }

  logger.info('Sending cached actions: %o', cachedActions)

  callback({
    highResTimeOrigin: performance.timeOrigin,
    worldStartTime: world.startTime,
    client: { name: client.name, index: client.index },
    cachedActions,
    avatarDetail: client.avatarDetail!,
    avatarSpawnPose: spawnPose
  })
}

export function handleIncomingActions(network: SocketWebRTCServerNetwork, socket: Socket, message) {
  if (!message) return

  const world = Engine.instance.currentWorld
  const userIdMap = {} as { [socketId: string]: UserId }
  for (const [id, client] of world.clients) userIdMap[client.socketId!] = id

  const actions = /*decode(new Uint8Array(*/ message /*))*/ as Required<Action>[]
  for (const a of actions) {
    a['$fromSocketId'] = socket.id
    a.$from = userIdMap[socket.id]
    dispatchAction(a, [network.hostId])
  }
  // logger.info('SERVER INCOMING ACTIONS: %s', JSON.stringify(actions))
}

export async function handleHeartbeat(socket: Socket): Promise<any> {
  const userId = getUserIdFromSocketId(socket.id)!
  // logger.info('Got heartbeat from user ' + userId + ' at ' + Date.now())
  if (Engine.instance.currentWorld.clients.has(userId))
    Engine.instance.currentWorld.clients.get(userId)!.lastSeenTs = Date.now()
}

export async function handleDisconnect(network: SocketWebRTCServerNetwork, socket: Socket): Promise<any> {
  const world = Engine.instance.currentWorld
  const userId = getUserIdFromSocketId(socket.id) as UserId
  const disconnectedClient = world?.clients.get(userId)
  if (!disconnectedClient)
    return logger.warn(
      'Disconnecting client ' + userId + ' was undefined, probably already handled from JoinWorld handshake.'
    )
  // On local, new connections can come in before the old sockets are disconnected.
  // The new connection will overwrite the socketID for the user's client.
  // This will only clear transports if the client's socketId matches the socket that's disconnecting.
  if (socket.id === disconnectedClient?.socketId) {
    dispatchAction(WorldNetworkAction.destroyClient({ $from: userId }), [network.hostId])
    logger.info('Disconnecting clients for user ' + userId)
    if (disconnectedClient?.instanceRecvTransport) disconnectedClient.instanceRecvTransport.close()
    if (disconnectedClient?.instanceSendTransport) disconnectedClient.instanceSendTransport.close()
    if (disconnectedClient?.channelRecvTransport) disconnectedClient.channelRecvTransport.close()
    if (disconnectedClient?.channelSendTransport) disconnectedClient.channelSendTransport.close()
  } else {
    logger.warn("Socket didn't match for disconnecting client.")
  }
}

export async function handleLeaveWorld(
  network: SocketWebRTCServerNetwork,
  socket: Socket,
  data,
  callback
): Promise<any> {
  const world = Engine.instance.currentWorld
  const userId = getUserIdFromSocketId(socket.id)!
  for (const [, transport] of Object.entries(network.mediasoupTransports))
    if ((transport as any).appData.peerId === userId) closeTransport(network, transport)
  if (world.clients.has(userId)) {
    dispatchAction(WorldNetworkAction.destroyClient({ $from: userId }))
  }
  if (callback !== undefined) callback({})
}

export function clearCachedActionsForDisconnectedUsers(network: SocketWebRTCServerNetwork) {
  const cached = Engine.instance.store.actions.cached[network.hostId]
  for (const action of [...cached]) {
    if (!Engine.instance.currentWorld.clients.has(action.$from)) {
      const idx = cached.indexOf(action)
      cached.splice(idx, 1)
    }
  }
}

export function clearCachedActionsForUser(network: SocketWebRTCServerNetwork, user: UserId) {
  const cached = Engine.instance.store.actions.cached[network.hostId]
  for (const action of [...cached]) {
    if (action.$from === user) {
      const idx = cached.indexOf(action)
      cached.splice(idx, 1)
    }
  }
}
