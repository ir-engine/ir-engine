import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { Network } from '@xrengine/engine/src/networking//classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { WorldStateInterface } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { DataConsumer, DataProducer } from 'mediasoup/lib/types'
import logger from '@xrengine/server-core/src/logger'
import config from '@xrengine/server-core/src/appconfig'
import { closeTransport } from './WebRTCFunctions'
import { WorldStateModel } from '@xrengine/engine/src/networking/schema/worldStateSchema'
import { Quaternion, Vector3 } from 'three'
import { checkIfIdHavePrepair } from '@xrengine/engine/src/networking/functions/initializeNetworkObject'
import { PrefabType } from '@xrengine/engine/src/networking/templates/PrefabType'
import { spawnPrefab } from '@xrengine/engine/src/networking/functions/spawnPrefab'
import { SpawnPoints } from '@xrengine/engine/src/avatar/ServerAvatarSpawnSystem'

const gsNameRegex = /gameserver-([a-zA-Z0-9]{5}-[a-zA-Z0-9]{5})/

export async function getFreeSubdomain(gsIdentifier: string, subdomainNumber: number): Promise<string> {
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
    else return getFreeSubdomain(gsIdentifier, subdomainNumber + 1)
  } else {
    const subdomain = (subdomainResult as any).data[0]
    if (subdomain.allocated === true || subdomain.allocated === 1) {
      return getFreeSubdomain(gsIdentifier, subdomainNumber + 1)
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
    else return getFreeSubdomain(gsIdentifier, subdomainNumber + 1)
  }
}

export async function cleanupOldGameservers(): Promise<void> {
  const transport = Network.instance.transport as any
  const instances = await (transport.app.service('instance') as any).Model.findAndCountAll({
    offset: 0,
    limit: 1000
  })
  const gameservers = await (transport.app as any).k8AgonesClient.get('gameservers')
  const gsIds = gameservers.items.map((gs) =>
    gsNameRegex.exec(gs.metadata.name) != null ? gsNameRegex.exec(gs.metadata.name)[1] : null
  )

  await Promise.all(
    instances.rows.map((instance) => {
      const [ip, port] = instance.ipAddress.split(':')
      const match = gameservers.items.find((gs) => {
        if (gs.status.ports == null || gs.status.address === '') return false
        const inputPort = gs.status.ports.find((port) => port.name === 'default')
        return gs.status.address === ip && inputPort.port.toString() === port
      })
      return match == null ? transport.app.service('instance').remove(instance.id) : Promise.resolve()
    })
  )

  await transport.app.service('gameserver-subdomain-provision').patch(
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

  return
}

export function getUserIdFromSocketId(socketId): string | null {
  let userId

  for (const key in Network.instance.clients)
    if (Network.instance.clients[key].socketId === socketId) {
      userId = Network.instance.clients[key].userId
      break
    }

  if (userId === undefined) return null
  return userId
}

export async function validateNetworkObjects(): Promise<void> {
  const transport = Network.instance.transport as any
  for (const userId in Network.instance.clients) {
    // Validate that user has phoned home in last 5 seconds
    if (Date.now() - Network.instance.clients[userId].lastSeenTs > 30000) {
      console.log('Removing client ', userId, ' due to inactivity')
      if (!Network.instance.clients[userId]) return console.warn('Client is not in client list')

      const disconnectedClient = Object.assign({}, Network.instance.clients[userId])

      Network.instance.worldState.clientsDisconnected.push({ userId })
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
      const networkObjectsClientOwns = []

      // Loop through network objects in world
      // If this client owns the object, add it to our array
      for (const obj in Network.instance.networkObjects)
        if (Network.instance.networkObjects[obj].ownerId === userId)
          networkObjectsClientOwns.push(Network.instance.networkObjects[obj])

      // Remove all objects for disconnecting user
      networkObjectsClientOwns.forEach((obj) => {
        // Get the entity attached to the NetworkObjectComponent and remove it
        console.log('Removing entity ', (obj.component.entity as Entity).id, ' for user ', userId)
        const removeMessage = { networkId: obj.component.networkId }
        Network.instance.worldState.destroyObjects.push(removeMessage)
        removeEntity(obj.component.entity)
        delete Network.instance.networkObjects[obj.id]
        console.log('Removed entity ', (obj.component.entity as Entity).id, ' for user ', userId)
      })

      if (Network.instance.clients[userId]) delete Network.instance.clients[userId]
      console.log('Finished removing inactive client', userId)
    }
  }
  Object.keys(Network.instance.networkObjects).forEach((key: string) => {
    const networkObject = Network.instance.networkObjects[key]
    // Validate that the object has an associated user and doesn't belong to a non-existant user
    if (
      (networkObject.ownerId !== undefined && Network.instance.clients[networkObject.ownerId] !== undefined) ||
      networkObject.ownerId === 'server'
    )
      return

    logger.info('Culling ownerless object: ', networkObject.component.networkId, 'owned by ', networkObject.ownerId)

    // If it does, tell clients to destroy it
    const removeMessage = { networkId: networkObject.component.networkId }
    Network.instance.worldState.destroyObjects.push(removeMessage)

    // get network object
    const entity = networkObject.component.entity

    // Remove the entity and all of it's components
    removeEntity(entity)

    // Remove network object from list
    delete Network.instance.networkObjects[key]
    logger.info(key, ' removed from simulation')
  })
}

export async function handleConnectToWorld(socket, data, callback, userId, user, avatarDetail): Promise<any> {
  const transport = Network.instance.transport as any
  if (!Engine.sceneLoaded && (transport.app as any).isChannelInstance !== true) {
    await new Promise<void>((resolve) => {
      EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED, resolve)
    })
  }

  console.log('Connect to world from ' + userId)
  // console.log("Avatar detail is", avatarDetail);
  disconnectClientIfConnected(socket, userId)

  // Create a new client object
  // and add to the dictionary
  if (Network.instance.clients[userId] == null)
    Network.instance.clients[userId] = {
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
      dataConsumers: new Map<string, DataConsumer>(), // Key => id of data producer
      dataProducers: new Map<string, DataProducer>() // Key => label of data channel
    }

  // Push to our worldstate to send out to other users
  Network.instance.worldState.clientsConnected.push({ userId, avatarDetail })
  // Create a new worldtate object that we can fill
  const worldState: WorldStateInterface = {
    clientsConnected: [],
    clientsDisconnected: [],
    createObjects: [],
    destroyObjects: [],
    editObjects: [],
    gameState: [],
    gameStateActions: []
  }

  // Get all clients and add to clientsConnected and push to world state frame
  Object.keys(Network.instance.clients).forEach((userId) => {
    const client = Network.instance.clients[userId]
    worldState.clientsConnected.push({ userId: client.userId, avatarDetail: client.avatarDetail })
  })

  // Return initial world state to client to set things up
  callback({
    worldState: WorldStateModel.toBuffer(worldState),
    routerRtpCapabilities: transport.routers.instance[0].rtpCapabilities
  })
}

function disconnectClientIfConnected(socket, userId: string): void {
  // If we are already logged in, kick the other socket
  if (Network.instance.clients[userId] !== undefined && Network.instance.clients[userId].socketId !== socket.id) {
    console.log('Client already exists, kicking the old client and disconnecting')
    Network.instance.clients[userId].socket?.emit(
      MessageTypes.Kick.toString(),
      'You joined this world on another device'
    )
    Network.instance.clients[userId].socket?.disconnect()
  }

  // console.log(Network.instance.networkObjects);
  Object.keys(Network.instance.networkObjects).forEach((key: string) => {
    const networkObject = Network.instance.networkObjects[key]
    // Validate that the object belongeread to disconnecting user
    if (networkObject.ownerId !== userId) return

    // If it does, tell clients to destroy it
    console.log('destroyObjects.push({ networkId: networkObject.component.networkId', networkObject.component.networkId)
    if (typeof networkObject.component.networkId === 'number') {
      Network.instance.worldState.destroyObjects.push({ networkId: networkObject.component.networkId })
    } else {
      console.error('networkObject.component.networkId is invalid', networkObject)
      logger.error('networkObject.component.networkId is invalid')
      logger.error(networkObject)
    }

    // get network object
    const entity = Network.instance.networkObjects[key].component.entity

    // Remove the entity and all of it's components
    removeEntity(entity)

    // Remove network object from list
    delete Network.instance.networkObjects[key]
  })
}

export async function handleJoinWorld(socket, data, callback, userId, user): Promise<any> {
  console.info('JoinWorld received', userId, data)
  const transport = Network.instance.transport as any

  // TEMPORARY data?.spawnTransform  - just so portals work for now - will be removed in favor of gameserver-gameserver communication
  const spawnPos = data?.spawnTransform
    ? {
        position: new Vector3().copy(data.spawnTransform.position),
        rotation: new Quaternion().copy(data.spawnTransform.rotation)
      }
    : SpawnPoints.instance.getRandomSpawnPoint()

  // Create a new worldState object that we can fill
  const worldState: WorldStateInterface = {
    clientsConnected: [],
    clientsDisconnected: [],
    createObjects: [],
    destroyObjects: [],
    editObjects: [],
    gameState: [],
    gameStateActions: []
  }

  // Get all network objects and add to createObjects
  Object.keys(Network.instance.networkObjects).forEach((networkId) => {
    worldState.createObjects.push({
      prefabType: Network.instance.networkObjects[networkId].prefabType,
      networkId: Number(networkId),
      ownerId: Network.instance.networkObjects[networkId].ownerId,
      uniqueId: Network.instance.networkObjects[networkId].uniqueId,
      parameters: Network.instance.networkObjects[networkId].parameters
    })
  })

  const networkId = checkIfIdHavePrepair(userId)
  spawnPrefab(PrefabType.Player, userId, userId, networkId, spawnPos)

  await new Promise<void>((resolve) => {
    const listener = ({ uniqueId }) => {
      if (uniqueId === userId) {
        resolve()
        EngineEvents.instance.removeEventListener(EngineEvents.EVENTS.CLIENT_USER_LOADED, listener)
      }
    }
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.CLIENT_USER_LOADED, listener)
  })

  // Get all clients and add to clientsConnected and push to world state frame
  Object.keys(Network.instance.clients).forEach((userId) => {
    const client = Network.instance.clients[userId]
    worldState.clientsConnected.push({ userId: client.userId, avatarDetail: client.avatarDetail })
  })

  // Return initial world state to client to set things up
  callback({
    worldState: WorldStateModel.toBuffer(worldState),
    routerRtpCapabilities: transport.routers.instance[0].rtpCapabilities
  })
}

export async function handleIncomingMessage(socket, message): Promise<any> {
  Network.instance.incomingMessageQueueReliable.add(message)
}

export async function handleHeartbeat(socket): Promise<any> {
  const userId = getUserIdFromSocketId(socket.id)
  // console.log('Got heartbeat from user ' + userId + ' at ' + Date.now());
  if (Network.instance.clients[userId] != undefined) Network.instance.clients[userId].lastSeenTs = Date.now()
}

export async function handleDisconnect(socket): Promise<any> {
  const userId = getUserIdFromSocketId(socket.id)
  const disconnectedClient = Network.instance.clients[userId]
  if (disconnectedClient === undefined)
    return console.warn(
      'Disconnecting client ' + userId + ' was undefined, probably already handled from JoinWorld handshake'
    )
  //On local, new connections can come in before the old sockets are disconnected.
  //The new connection will overwrite the socketID for the user's client.
  //This will only clear transports if the client's socketId matches the socket that's disconnecting.
  if (socket.id === disconnectedClient?.socketId) {
    Object.keys(Network.instance.networkObjects).forEach((key: string) => {
      const networkObject = Network.instance.networkObjects[key]
      // Validate that the object belonged to disconnecting user
      if (networkObject.ownerId !== userId) return

      logger.info(
        'Culling object:',
        networkObject.component.networkId,
        'owned by disconnecting client',
        networkObject.ownerId
      )

      // If it does, tell clients to destroy it
      Network.instance.worldState.destroyObjects.push({ networkId: networkObject.component.networkId })

      // get network object
      const entity = Network.instance.networkObjects[key].component.entity

      // Remove the entity and all of it's components
      removeEntity(entity)

      // Remove network object from list
      delete Network.instance.networkObjects[key]
    })

    Network.instance.worldState.clientsDisconnected.push({ userId })
    logger.info('Disconnecting clients for user ' + userId)
    if (disconnectedClient?.instanceRecvTransport) disconnectedClient.instanceRecvTransport.close()
    if (disconnectedClient?.instanceSendTransport) disconnectedClient.instanceSendTransport.close()
    if (disconnectedClient?.channelRecvTransport) disconnectedClient.channelRecvTransport.close()
    if (disconnectedClient?.channelSendTransport) disconnectedClient.channelSendTransport.close()
    if (Network.instance.clients[userId] !== undefined) delete Network.instance.clients[userId]
  } else {
    console.warn("Socket didn't match for disconnecting client")
  }
}

export async function handleLeaveWorld(socket, data, callback): Promise<any> {
  const userId = getUserIdFromSocketId(socket.id)
  if (Network.instance.transports)
    for (const [, transport] of Object.entries(Network.instance.transports))
      if ((transport as any).appData.peerId === userId) closeTransport(transport)
  if (Network.instance.clients[userId] !== undefined) delete Network.instance.clients[userId]
  logger.info('Removing ' + userId + ' from client list')
  if (callback !== undefined) callback({})
}
