import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { DataConsumer, DataProducer } from 'mediasoup/node/lib/types'
import logger from '@xrengine/server-core/src/logger'
import config from '@xrengine/server-core/src/appconfig'
import { closeTransport } from './WebRTCFunctions'
import { Quaternion, Vector3 } from 'three'
import { SpawnPoints } from '@xrengine/engine/src/avatar/AvatarSpawnSystem'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import { NetworkWorldAction } from '../../engine/src/networking/functions/NetworkWorldAction'
import { XRInputSourceComponent } from '../../engine/src/xr/components/XRInputSourceComponent'
import { Action } from '@xrengine/engine/src/networking/interfaces/Action'
import { dispatchFrom } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { XRHandsInputComponent } from '@xrengine/engine/src/xr/components/XRHandsInputComponent'
import { SocketWebRTCServerTransport } from './SocketWebRTCServerTransport'
import { Application } from '@xrengine/server-core/declarations'

const gsNameRegex = /gameserver-([a-zA-Z0-9]{5}-[a-zA-Z0-9]{5})/

export async function getFreeSubdomain(
  app: Application,
  gsIdentifier: string,
  subdomainNumber: number
): Promise<string> {
  const transport = Network.instance.transport as any
  const stringSubdomainNumber = subdomainNumber.toString().padStart(config.gameserver.identifierDigits, '0')
  const subdomainResult = await transport.app.service('gameserver-subdomain-provision').find({
    query: {
      gs_number: stringSubdomainNumber
    }
  })
  if ((subdomainResult as any).total === 0) {
    await transport.app.service('gameserver-subdomain-provision').create({
      allocated: true,
      gs_number: stringSubdomainNumber,
      gs_id: gsIdentifier
    })

    await new Promise((resolve) =>
      setTimeout(async () => {
        resolve(true)
      }, 500)
    )

    const newSubdomainResult = await transport.app.service('gameserver-subdomain-provision').find({
      query: {
        gs_number: stringSubdomainNumber
      }
    })
    if (newSubdomainResult.total > 0 && newSubdomainResult.data[0].gs_id === gsIdentifier) return stringSubdomainNumber
    else return getFreeSubdomain(app, gsIdentifier, subdomainNumber + 1)
  } else {
    const subdomain = (subdomainResult as any).data[0]
    if (subdomain.allocated === true || subdomain.allocated === 1) {
      return getFreeSubdomain(app, gsIdentifier, subdomainNumber + 1)
    }
    await transport.app.service('gameserver-subdomain-provision').patch(subdomain.id, {
      allocated: true,
      gs_id: gsIdentifier
    })

    await new Promise((resolve) =>
      setTimeout(async () => {
        resolve(true)
      }, 500)
    )

    const newSubdomainResult = await transport.app.service('gameserver-subdomain-provision').find({
      query: {
        gs_number: stringSubdomainNumber
      }
    })
    if (newSubdomainResult.total > 0 && newSubdomainResult.data[0].gs_id === gsIdentifier) return stringSubdomainNumber
    else return getFreeSubdomain(app, gsIdentifier, subdomainNumber + 1)
  }
}

export async function cleanupOldGameservers(): Promise<void> {
  const transport = Network.instance.transport as any
  const instances = await (transport.app.service('instance') as any).Model.findAndCountAll({
    offset: 0,
    limit: 1000,
    where: {
      ended: false
    }
  })
  const gameservers = await transport.app.k8AgonesClient.get('gameservers')
  const gsIds = gameservers.items.map((gs) =>
    gsNameRegex.exec(gs.metadata.name) != null ? gsNameRegex.exec(gs.metadata.name)![1] : null
  )

  await Promise.all(
    instances.rows.map((instance) => {
      const [ip, port] = instance.ipAddress.split(':')
      const match = gameservers.items.find((gs) => {
        if (gs.status.ports == null || gs.status.address === '') return false
        const inputPort = gs.status.ports.find((port) => port.name === 'default')
        return gs.status.address === ip && inputPort.port.toString() === port
      })
      return match == null
        ? transport.app.service('instance').patch(instance.id, {
            ended: true
          })
        : Promise.resolve()
    })
  )

  await transport.app.service('gameserver-subdomain-provision').patch(
    null,
    {
      allocated: false
    },
    {
      query: {
        gs_id: {
          $nin: gsIds
        }
      }
    }
  )

  return
}

export function getUserIdFromSocketId(socketId) {
  const client = Array.from(Engine.currentWorld.clients.values()).find((c) => c.socketId === socketId)
  return client?.userId
}

export async function validateNetworkObjects(): Promise<void> {
  if (!Engine.isInitialized) return
  const world = Engine.currentWorld!
  for (const [userId, client] of world.clients) {
    // Validate that user has phoned home recently
    if (process.env.APP_ENV !== 'development' && Date.now() - client.lastSeenTs > 30000) {
      console.log('Removing client ', userId, ' due to inactivity')
      if (!client) return console.warn('Client is not in client list')

      const disconnectedClient = Object.assign({}, client)

      dispatchFrom(world.hostId, () => NetworkWorldAction.destroyClient({ userId }))

      console.log('Disconnected Client:', disconnectedClient.userId)
      if (disconnectedClient?.instanceRecvTransport) {
        console.log('Closing instanceRecvTransport')
        await disconnectedClient.instanceRecvTransport.close()
        console.log('Closed instanceRecvTransport')
      }
      if (disconnectedClient?.instanceSendTransport) {
        console.log('Closing instanceSendTransport')
        await disconnectedClient.instanceSendTransport.close()
        console.log('Closed instanceSendTransport')
      }
      if (disconnectedClient?.channelRecvTransport) {
        console.log('Closing channelRecvTransport')
        await disconnectedClient.channelRecvTransport.close()
        console.log('Closed channelRecvTransport')
      }
      if (disconnectedClient?.channelSendTransport) {
        console.log('Closing channelSendTransport')
        await disconnectedClient.channelSendTransport.close()
        console.log('Closed channelSendTransport')
      }

      console.log('Removed transports for', userId)

      // Find all network objects that the disconnecting client owns and remove them
      for (const eid of world.getOwnedNetworkObjects(userId)) {
        const { networkId } = getComponent(eid, NetworkObjectComponent)
        dispatchFrom(world.hostId, () => NetworkWorldAction.destroyObject({ networkId }))
      }
      if (world.clients.has(userId)) world.clients.delete(userId)
      console.log('Finished removing inactive client', userId)
    }
  }
  /*
  Object.keys(Network.instance.networkObjects).forEach((key: string) => {
    const networkObject = Network.instance.networkObjects[key]
    // Validate that the object has an associated user and doesn't belong to a non-existant user
    if (
      !hasComponent(networkObject.entity, AvatarComponent) ||
      (networkObject.uniqueId !== undefined && world.clients.get(networkObject.uniqueId) !== undefined)
    )
      return

    console.log('Culling ownerless object: ', key, 'owned by ', networkObject.uniqueId)

    // If it does, tell clients to destroy it
    dispatchFromServer(NetworkWorldAction.destroyObject(Number(key)))

    // get network object
    const entity = networkObject.entity

    // Remove the entity and all of it's components
    removeEntity(entity)

    // Remove network object from list
    delete Network.instance.networkObjects[key]
    logger.info(key, ' removed from simulation')
  })*/
}

export async function handleConnectToWorld(socket, data, callback, userId: UserId, user, avatarDetail): Promise<any> {
  const transport = Network.instance.transport as SocketWebRTCServerTransport

  console.log('Connect to world from ' + userId)
  // console.log("Avatar detail is", avatarDetail);
  disconnectClientIfConnected(socket, userId)

  // Create a new client object
  // and add to the dictionary
  const world = Engine.currentWorld
  world.clients.set(userId, {
    userId: userId,
    name: user.dataValues.name,
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

  // Return initial world state to client to set things up
  callback({
    routerRtpCapabilities: transport.routers.instance[0].rtpCapabilities
  })
}

function disconnectClientIfConnected(socket, userId: UserId): void {
  // If we are already logged in, kick the other socket
  const world = Engine.currentWorld
  if (world.clients.has(userId) && world.clients.get(userId)!.socketId !== socket.id) {
    const client = world.clients.get(userId)!
    console.log('Client already exists, kicking the old client and disconnecting')
    client.socket?.emit(MessageTypes.Kick.toString(), 'You joined this world on another device')
    client.socket?.disconnect()
  }

  for (const eid of world.getOwnedNetworkObjects(userId)) {
    const { networkId } = getComponent(eid, NetworkObjectComponent)
    dispatchFrom(world.hostId, () => NetworkWorldAction.destroyObject({ networkId }))
  }
}

export async function handleJoinWorld(socket, data, callback, joinedUserId: UserId, user): Promise<any> {
  console.info('JoinWorld received', joinedUserId, data)
  const transport = Network.instance.transport as any
  const world = Engine.currentWorld

  // TEMPORARY data?.spawnTransform  - just so portals work for now - will be removed in favor of gameserver-gameserver communication
  const spawnPos = data?.spawnTransform
    ? {
        position: new Vector3().copy(data.spawnTransform.position),
        rotation: new Quaternion().copy(data.spawnTransform.rotation)
      }
    : SpawnPoints.instance.getRandomSpawnPoint()

  for (const [userId, client] of world.clients) {
    dispatchFrom(world.hostId, () =>
      NetworkWorldAction.createClient({
        userId,
        name: client.name,
        avatarDetail: client.avatarDetail!
      })
    ).to(userId === joinedUserId ? 'all' : joinedUserId)
  }

  dispatchFrom(world.hostId, () =>
    NetworkWorldAction.spawnAvatar({
      userId: joinedUserId,
      parameters: { ...spawnPos }
    })
  )

  for (const eid of world.networkObjectQuery(world)) {
    const networkObject = getComponent(eid, NetworkObjectComponent)
    dispatchFrom(world.hostId, () =>
      NetworkWorldAction.spawnObject({
        ...networkObject
      })
    ).to(joinedUserId)
    if (hasComponent(eid, XRInputSourceComponent)) {
      dispatchFrom(world.hostId, () =>
        NetworkWorldAction.setXRMode({
          userId: networkObject.userId,
          enabled: true
        })
      ).to(joinedUserId)
    }
    if (hasComponent(eid, XRHandsInputComponent)) {
      dispatchFrom(world.hostId, () =>
        NetworkWorldAction.xrHandsConnected({
          userId: networkObject.userId
        })
      ).to(joinedUserId)
    }
  }

  callback({
    routerRtpCapabilities: transport.routers.instance[0].rtpCapabilities
  })
}

export function handleIncomingActions(socket, message) {
  if (!message) return

  const world = Engine.currentWorld
  const userIdMap = {} as { [socketId: string]: UserId }
  for (const [id, client] of world.clients) userIdMap[client.socketId!] = id

  const actions = /*decode(new Uint8Array(*/ message /*))*/ as Required<Action>[]
  for (const a of actions) {
    a.$from = userIdMap[socket.id]
    world.incomingActions.add(a)
  }
  // console.log('SERVER INCOMING ACTIONS', JSON.stringify(actions))
}

export async function handleIncomingMessage(socket, message): Promise<any> {
  Network.instance.incomingMessageQueueReliable.add(message)
}

export async function handleHeartbeat(socket): Promise<any> {
  const userId = getUserIdFromSocketId(socket.id)!
  // console.log('Got heartbeat from user ' + userId + ' at ' + Date.now());
  if (Engine.currentWorld.clients.has(userId)) Engine.currentWorld.clients.get(userId)!.lastSeenTs = Date.now()
}

export async function handleDisconnect(socket): Promise<any> {
  const world = Engine.currentWorld
  const userId = getUserIdFromSocketId(socket.id) as UserId
  const disconnectedClient = world?.clients.get(userId)
  if (!disconnectedClient)
    return console.warn(
      'Disconnecting client ' + userId + ' was undefined, probably already handled from JoinWorld handshake'
    )
  //On local, new connections can come in before the old sockets are disconnected.
  //The new connection will overwrite the socketID for the user's client.
  //This will only clear transports if the client's socketId matches the socket that's disconnecting.
  if (socket.id === disconnectedClient?.socketId) {
    dispatchFrom(world.hostId, () => NetworkWorldAction.destroyClient({ userId }))

    logger.info('Disconnecting clients for user ' + userId)
    if (disconnectedClient?.instanceRecvTransport) disconnectedClient.instanceRecvTransport.close()
    if (disconnectedClient?.instanceSendTransport) disconnectedClient.instanceSendTransport.close()
    if (disconnectedClient?.channelRecvTransport) disconnectedClient.channelRecvTransport.close()
    if (disconnectedClient?.channelSendTransport) disconnectedClient.channelSendTransport.close()
    if (world.clients.has(userId)) world.clients.delete(userId)
  } else {
    console.warn("Socket didn't match for disconnecting client")
  }
}

export async function handleLeaveWorld(socket, data, callback): Promise<any> {
  const userId = getUserIdFromSocketId(socket.id)!
  if (Network.instance.transports)
    for (const [, transport] of Object.entries(Network.instance.transports))
      if ((transport as any).appData.peerId === userId) closeTransport(transport)
  if (Engine.currentWorld?.clients.has(userId)) Engine.currentWorld.clients.delete(userId)
  logger.info('Removing ' + userId + ' from client list')
  if (callback !== undefined) callback({})
}
