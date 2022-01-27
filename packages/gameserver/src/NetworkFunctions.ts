import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { DataConsumer, DataProducer } from 'mediasoup/node/lib/types'
import logger from '@xrengine/server-core/src/logger'
import config from '@xrengine/server-core/src/appconfig'
import { closeTransport } from './WebRTCFunctions'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import { NetworkWorldAction } from '../../engine/src/networking/functions/NetworkWorldAction'
import { dispatchFrom } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { SocketWebRTCServerTransport } from './SocketWebRTCServerTransport'
import { localConfig } from '@xrengine/server-core/src/config'
import getLocalServerIp from '@xrengine/server-core/src/util/get-local-server-ip'
import AWS from 'aws-sdk'
import { Action } from '@xrengine/engine/src/ecs/functions/Action'
import { JoinWorldProps } from '@xrengine/engine/src/networking/functions/receiveJoinWorld'

const gsNameRegex = /gameserver-([a-zA-Z0-9]{5}-[a-zA-Z0-9]{5})/

export const setupSubdomain = async (transport: SocketWebRTCServerTransport) => {
  const app = transport.app
  let stringSubdomainNumber: string

  if (config.kubernetes.enabled) {
    await cleanupOldGameservers(transport)
    app.gameServer = await app.agonesSDK.getGameServer()
    const name = app.gameServer.objectMeta.name

    const gsIdentifier = gsNameRegex.exec(name)!
    stringSubdomainNumber = await getFreeSubdomain(transport, gsIdentifier[1], 0)
    app.gsSubdomainNumber = stringSubdomainNumber

    const Route53 = new AWS.Route53({ ...config.aws.route53.keys })
    const params = {
      ChangeBatch: {
        Changes: [
          {
            Action: 'UPSERT',
            ResourceRecordSet: {
              Name: `${stringSubdomainNumber}.${config.gameserver.domain}`,
              ResourceRecords: [{ Value: app.gameServer.status.address }],
              TTL: 0,
              Type: 'A'
            }
          }
        ]
      },
      HostedZoneId: config.aws.route53.hostedZoneId
    }
    if (config.gameserver.local !== true) await Route53.changeResourceRecordSets(params as any).promise()
  } else {
    try {
      // is this needed?
      await (app.service('instance') as any).Model.update(
        { ended: true, assigned: false, assignedAt: null },
        { where: {} }
      )
    } catch (error) {
      logger.warn(error)
    }
  }

  // Set up our gameserver according to our current environment
  const localIp = await getLocalServerIp(app.isChannelInstance)
  const announcedIp = config.kubernetes.enabled
    ? config.gameserver.local === true
      ? app.gameServer.status.address
      : `${stringSubdomainNumber!}.${config.gameserver.domain}`
    : localIp.ipAddress

  localConfig.mediasoup.webRtcTransport.listenIps = [
    {
      ip: '0.0.0.0',
      announcedIp
    }
  ]
}

export async function getFreeSubdomain(
  transport: SocketWebRTCServerTransport,
  gsIdentifier: string,
  subdomainNumber: number
): Promise<string> {
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

    const newSubdomainResult = (await transport.app.service('gameserver-subdomain-provision').find({
      query: {
        gs_number: stringSubdomainNumber
      }
    })) as any
    if (newSubdomainResult.total > 0 && newSubdomainResult.data[0].gs_id === gsIdentifier) return stringSubdomainNumber
    else return getFreeSubdomain(transport, gsIdentifier, subdomainNumber + 1)
  } else {
    const subdomain = (subdomainResult as any).data[0]
    if (subdomain.allocated === true || subdomain.allocated === 1) {
      return getFreeSubdomain(transport, gsIdentifier, subdomainNumber + 1)
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

    const newSubdomainResult = (await transport.app.service('gameserver-subdomain-provision').find({
      query: {
        gs_number: stringSubdomainNumber
      }
    })) as any
    if (newSubdomainResult.total > 0 && newSubdomainResult.data[0].gs_id === gsIdentifier) return stringSubdomainNumber
    else return getFreeSubdomain(transport, gsIdentifier, subdomainNumber + 1)
  }
}

export async function cleanupOldGameservers(transport: SocketWebRTCServerTransport): Promise<void> {
  const instances = await (transport.app.service('instance') as any).Model.findAndCountAll({
    offset: 0,
    limit: 1000,
    where: {
      ended: false
    }
  })
  const gameservers = await transport.app.k8AgonesClient.listNamespacedCustomObject(
    'agones.dev',
    'v1',
    'default',
    'gameservers'
  )
  const gsIds = gameservers.body.items.map((gs) =>
    gsNameRegex.exec(gs.metadata.name) != null ? gsNameRegex.exec(gs.metadata.name)![1] : null
  )

  await Promise.all(
    instances.rows.map((instance) => {
      if (!instance.ipAddress) return false
      const [ip, port] = instance.ipAddress.split(':')
      const match = gameservers.body.items.find((gs) => {
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

export async function handleConnectToWorld(
  transport: SocketWebRTCServerTransport,
  socket,
  data,
  callback,
  userId: UserId,
  user,
  avatarDetail
): Promise<any> {
  console.log('Connect to world from ' + userId)
  // console.log("Avatar detail is", avatarDetail);
  disconnectClientIfConnected(socket, userId)

  // Create a new client object
  // and add to the dictionary
  const world = Engine.currentWorld
  world.clients.set(userId, {
    userId: userId,
    userIndex: world.userIndexCount++,
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
    dispatchFrom(world.hostId, () => NetworkWorldAction.destroyObject({ $from: userId, networkId }))
  }
}

export const handleJoinWorld = (
  transport: SocketWebRTCServerTransport,
  socket,
  data,
  callback: (args: JoinWorldProps) => void,
  joinedUserId: UserId,
  user
) => {
  console.info('JoinWorld received', joinedUserId, data)
  const world = Engine.currentWorld
  const client = world.clients.get(joinedUserId)!

  clearCachedActionsForDisconnectedUsers()
  clearCachedActionsForUser(joinedUserId)

  // send all client info
  const clients = [] as Array<{ userId: UserId; name: string; index: number }>
  for (const [userId, client] of world.clients) {
    clients.push({ userId, index: client.userIndex, name: client.name })
  }

  // send all cached and outgoing actions to joining user
  const cachedActions = [] as Action[]
  for (const action of world.cachedActions) {
    if (action.$to === 'all' || action.$to === joinedUserId) cachedActions.push(action)
  }

  console.log('Sending cached actions ', cachedActions)

  callback({
    tick: world.fixedTick,
    clients,
    cachedActions,
    avatarDetail: client.avatarDetail!
  })

  dispatchFrom(world.hostId, () =>
    NetworkWorldAction.createClient({
      $from: joinedUserId,
      name: client.name,
      index: client.userIndex
    })
  ).to('others')
}

export function handleIncomingActions(socket, message) {
  if (!message) return

  const world = Engine.currentWorld
  const userIdMap = {} as { [socketId: string]: UserId }
  for (const [id, client] of world.clients) userIdMap[client.socketId!] = id

  const actions = /*decode(new Uint8Array(*/ message /*))*/ as Required<Action>[]
  for (const a of actions) {
    a['$fromSocketId'] = socket.id
    a.$from = userIdMap[socket.id]
    world.outgoingActions.add(a)
  }
  // console.log('SERVER INCOMING ACTIONS', JSON.stringify(actions))
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
    dispatchFrom(world.hostId, () => NetworkWorldAction.destroyClient({ $from: userId }))
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
  if (Engine.currentWorld?.clients.has(userId)) {
    Engine.currentWorld.clients.delete(userId)
    for (const eid of Engine.currentWorld?.getOwnedNetworkObjects(userId)) {
      const { networkId } = getComponent(eid, NetworkObjectComponent)
      dispatchFrom(Engine.currentWorld?.hostId, () => NetworkWorldAction.destroyObject({ $from: userId, networkId }))
    }

    logger.info('Removing ' + userId + ' from client list')
  }
  if (callback !== undefined) callback({})
}

export function clearCachedActionsForDisconnectedUsers() {
  for (const action of Engine.currentWorld.cachedActions) {
    if (Engine.currentWorld.clients.has(action.$from) === false) {
      Engine.currentWorld.cachedActions.delete(action)
    }
  }
}

export function clearCachedActionsForUser(user: UserId) {
  for (const action of Engine.currentWorld.cachedActions) {
    if (action.$from === user) {
      Engine.currentWorld.cachedActions.delete(action)
    }
  }
}
