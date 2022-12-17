import * as mediasoupClient from 'mediasoup-client'
import {
  Consumer,
  DataProducer,
  Device,
  DtlsParameters,
  MediaKind,
  Transport as MediaSoupTransport,
  Producer,
  RtpParameters,
  SctpStreamParameters
} from 'mediasoup-client/lib/types'
import { io as ioclient, Socket } from 'socket.io-client'

import { MediaStreams } from '@xrengine/client-core/src/transports/MediaStreams'
import config from '@xrengine/common/src/config'
import { AuthTask } from '@xrengine/common/src/interfaces/AuthTask'
import { Channel, ChannelType } from '@xrengine/common/src/interfaces/Channel'
import { MediaStreamAppData, MediaTagType } from '@xrengine/common/src/interfaces/MediaStreamConstants'
import { PeerID, PeersUpdateType } from '@xrengine/common/src/interfaces/PeerID'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import multiLogger from '@xrengine/common/src/logger'
import { getSearchParamFromURL } from '@xrengine/common/src/utils/getSearchParamFromURL'
import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineState'
import { createNetwork, Network, NetworkTopics } from '@xrengine/engine/src/networking/classes/Network'
import { PUBLIC_STUN_SERVERS } from '@xrengine/engine/src/networking/constants/STUNServers'
import {
  CAM_VIDEO_SIMULCAST_ENCODINGS,
  SCREEN_SHARE_SIMULCAST_ENCODINGS
} from '@xrengine/engine/src/networking/constants/VideoConstants'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { NetworkPeerFunctions } from '@xrengine/engine/src/networking/functions/NetworkPeerFunctions'
import { JoinWorldRequestData, receiveJoinWorld } from '@xrengine/engine/src/networking/functions/receiveJoinWorld'
import {
  addActionReceptor,
  dispatchAction,
  none,
  removeActionReceptor,
  removeActionsForTopic,
  State
} from '@xrengine/hyperflux'
import { Action, Topic } from '@xrengine/hyperflux/functions/ActionFunctions'

import {
  accessLocationInstanceConnectionState,
  LocationInstanceConnectionAction,
  LocationInstanceConnectionService
} from '../common/services/LocationInstanceConnectionService'
import {
  accessMediaInstanceConnectionState,
  MediaInstanceConnectionAction,
  MediaInstanceConnectionService
} from '../common/services/MediaInstanceConnectionService'
import { NetworkConnectionService } from '../common/services/NetworkConnectionService'
import { MediaStreamAction, MediaStreamService } from '../media/services/MediaStreamService'
import { accessChatState } from '../social/services/ChatService'
import { accessLocationState } from '../social/services/LocationService'
import { accessAuthState } from '../user/services/AuthService'
import { updateNearbyAvatars } from './UpdateNearbyUsersSystem'

const logger = multiLogger.child({ component: 'client-core:SocketWebRTCClientFunctions' })

export type WebRTCTransportExtension = Omit<MediaSoupTransport, 'appData'> & { appData: MediaStreamAppData }
export type ProducerExtension = Omit<Producer, 'appData'> & { appData: MediaStreamAppData }
export type ConsumerExtension = Omit<Consumer, 'appData'> & { appData: MediaStreamAppData; producerPaused: boolean }

// import { encode, decode } from 'msgpackr'

// Adds support for Promise to socket.io-client
export function networkRequest(network: SocketWebRTCClientNetwork, type: any, data = {}): any {
  return new Promise((resolve) => network.socket!.emit(type, data, resolve))
}

type ClientProperties = {
  mediasoupDevice: Device
  reconnecting: boolean
  recvTransport: MediaSoupTransport
  sendTransport: MediaSoupTransport
  sockets: Map<PeerID, Socket>
  /** @deprecated use hostSocket */
  socket: Socket
  hostSocket: Socket
  dataProducer: DataProducer | null
  producers: ProducerExtension[]
  consumers: ConsumerExtension[]
}

export const createClientNetwork = (hostId: UserId, topic: Topic) => {
  return createNetwork({
    hostId,
    topic,
    sendData,
    mediasoupDevice: new mediasoupClient.Device(Engine.instance.isBot ? { handlerName: 'Chrome74' } : undefined),
    reconnecting: false,
    recvTransport: null!,
    sendTransport: null!,
    sockets: new Map(),
    dataProducer: null!,
    producers: [],
    consumers: []
  })
}

export type SocketWebRTCClientNetwork = Readonly<Network & ClientProperties>

// This sends message on a data channel (data channel creation is now handled explicitly/default)
export const sendData = (network: SocketWebRTCClientNetwork, data: ArrayBuffer) => {
  if (network.dataProducer && network.dataProducer.closed !== true && network.dataProducer.readyState === 'open')
    network.dataProducer.send(data)
}

export const closeNetwork = (network: State<SocketWebRTCClientNetwork>) => {
  logger.info('SocketWebRTCClientNetwork close')
  network.recvTransport?.value?.close()
  network.sendTransport?.value?.close()
  network.recvTransport.set(none)
  network.sendTransport.set(none)
  for (const [peerId, socket] of network.sockets.value) {
    socket?.removeAllListeners()
    socket?.close()
    network.sockets.value.delete(peerId)
  }
}

const handleFailedConnection = (isLocation: boolean) => {
  if (isLocation) {
    const currentLocation = accessLocationState().currentLocation.location
    const locationInstanceConnectionState = accessLocationInstanceConnectionState()
    const instanceId = Engine.instance.currentWorld.hostIds.world.value ?? ''
    if (!locationInstanceConnectionState.instances[instanceId]?.connected?.value) {
      dispatchAction(LocationInstanceConnectionAction.disconnect({ instanceId }))
      LocationInstanceConnectionService.provisionServer(
        currentLocation.id.value,
        instanceId || undefined,
        currentLocation.sceneId.value
      )
    }
  } else {
    const mediaInstanceConnectionState = accessMediaInstanceConnectionState()
    const instanceId = Engine.instance.currentWorld.hostIds.media.value ?? ''
    if (!mediaInstanceConnectionState.instances[instanceId]?.connected?.value) {
      dispatchAction(MediaInstanceConnectionAction.disconnect({ instanceId }))
      const authState = accessAuthState()
      const selfUser = authState.user
      const chatState = accessChatState()
      const channelState = chatState.channels
      const channels = channelState.channels.value as Channel[]
      const channelEntries = Object.values(channels).filter((channel) => !!channel) as any
      const instanceChannel = channelEntries.find(
        (entry) => entry.instanceId === Engine.instance.currentWorld.worldNetwork?.hostId
      )
      if (instanceChannel) {
        MediaInstanceConnectionService.provisionServer(instanceChannel?.id!, true)
      } else {
        const partyChannel = Object.values(chatState.channels.channels.value).find(
          (channel) => channel.channelType === 'party' && channel.partyId === selfUser.partyId.value
        )
        MediaInstanceConnectionService.provisionServer(partyChannel?.id!, false)
      }
    }
  }
  return
}

export const initializeClientNetwork = (
  networkState: State<SocketWebRTCClientNetwork>,
  args: {
    ipAddress: string
    port: string
    locationId?: string | null
    channelId?: string | null
    roomCode?: string | null
  }
) => {
  console.log(networkState)
  networkState.reconnecting.set(false)
  if (networkState.value.sockets.size) {
    return logger.error(new Error('Network already initialized'))
  }
  logger.info('Initialising transport with args %o', args)
  const { ipAddress, port, locationId, channelId, roomCode } = args

  const authState = accessAuthState()
  const token = authState.authUser.accessToken.value

  const query = {
    locationId,
    channelId,
    roomCode,
    token
  }

  if (locationId) delete query.channelId
  if (channelId) delete query.locationId
  if (!roomCode) delete query.roomCode

  let socket = null as Socket | null

  try {
    if (config.client.localBuild === 'true') {
      socket = ioclient(`https://${ipAddress as string}:${port.toString()}`, {
        query
      })
    } else if (config.client.appEnv === 'development' && config.client.localNginx !== 'true') {
      socket = ioclient(`${ipAddress as string}:${port.toString()}`, {
        query
      })
    } else {
      socket = ioclient(config.client.instanceserverUrl, {
        path: `/socket.io/${ipAddress as string}/${port.toString()}`,
        query
      })
    }
  } catch (err) {
    logger.error(err)
    return handleFailedConnection(locationId != null)
  }

  const connectionFailTimeout = setTimeout(() => {
    return handleFailedConnection(locationId != null)
  }, 3000)

  networkState.sockets.value.set(socket.id as PeerID, socket)
  networkState.hostSocket.set(socket)
  networkState.socket.set(socket)

  socket.on('connect', () => {
    clearTimeout(connectionFailTimeout)
    if (networkState.reconnecting.value) {
      networkState.reconnecting.set(false)
      ;(socket as any)._connected = false
      return
    }

    if ((socket as any)._connected) return
    ;(socket as any)._connected = true

    logger.info('CONNECT to port %o', { port, locationId })
    onConnectToInstance(networkState)
  })
}

export const getChannelTypeIdFromTransport = (network: SocketWebRTCClientNetwork) => {
  const channelConnectionState = accessMediaInstanceConnectionState()
  const mediaNetwork = Engine.instance.currentWorld.mediaNetwork
  const currentChannelInstanceConnection =
    mediaNetwork.value && channelConnectionState.instances[mediaNetwork.value.hostId].ornull
  const isWorldConnection = network.topic === NetworkTopics.world
  return {
    channelType: isWorldConnection ? 'instance' : currentChannelInstanceConnection?.channelType.value,
    channelId: isWorldConnection ? null : currentChannelInstanceConnection?.channelId.value
  }
}

function actionDataHandler(message) {
  if (!message) return
  const actions = message as any as Required<Action>[]
  // const actions = decode(new Uint8Array(message)) as IncomingActionType[]
  for (const a of actions) {
    Engine.instance.store.actions.incoming.push(a)
  }
}

export async function onConnectToInstance(networkState: State<SocketWebRTCClientNetwork>) {
  const network = networkState.value
  const isWorldConnection = network.topic === NetworkTopics.world
  logger.info('Connecting to instance type: %o', { topic: network.topic, hostId: network.hostId })

  if (isWorldConnection) {
    dispatchAction(LocationInstanceConnectionAction.instanceServerConnected({ instanceId: network.hostId }))
    dispatchAction(NetworkConnectionService.actions.worldInstanceReconnected({}))
  } else {
    dispatchAction(MediaInstanceConnectionAction.serverConnected({ instanceId: network.hostId }))
    dispatchAction(NetworkConnectionService.actions.mediaInstanceReconnected({}))
  }

  const authState = accessAuthState()
  const token = authState.authUser.accessToken.value
  const payload = { accessToken: token }

  const { status } = await new Promise<AuthTask>((resolve) => {
    const interval = setInterval(async () => {
      const response = (await networkRequest(network, MessageTypes.Authorization.toString(), payload)) as AuthTask
      if (response.status !== 'pending') {
        clearInterval(interval)
        resolve(response)
      }
    }, 100)
  })

  if (status !== 'success') {
    return logger.error(new Error('Unable to connect with credentials'))
  }

  function peerUpdateHandler(peers: Array<PeersUpdateType>) {
    for (const peer of peers) {
      NetworkPeerFunctions.createPeer(network, peer.peerID, peer.peerIndex, peer.userID, peer.userIndex, peer.name)
    }
    for (const [peerID, peer] of network.peers) {
      if (!peers.find((p) => p.peerID === peerID)) NetworkPeerFunctions.destroyPeer(network, peerID)
    }
    logger.info('Updated peers %o', { topic: network.topic, peers })
  }

  async function commonDisconnectHandler() {
    network.socket.off('disconnect', commonDisconnectHandler)
    network.socket.off(MessageTypes.ActionData.toString(), actionDataHandler)
    network.socket.off(MessageTypes.UpdatePeers.toString(), peerUpdateHandler)
  }
  network.socket.on('disconnect', commonDisconnectHandler)
  network.socket.on(MessageTypes.ActionData.toString(), actionDataHandler)
  network.socket.on(MessageTypes.UpdatePeers.toString(), peerUpdateHandler)

  const joinWorldRequest = {
    inviteCode: getSearchParamFromURL('inviteCode')
  } as JoinWorldRequestData

  const connectToWorldResponse = await networkRequest(network, MessageTypes.JoinWorld.toString(), joinWorldRequest)

  if (!connectToWorldResponse || !connectToWorldResponse.routerRtpCapabilities) {
    dispatchAction(NetworkConnectionService.actions.worldInstanceReconnected({}))
    networkState.reconnecting.set(false)
    onConnectToInstance(networkState)
    return
  }

  if (network.mediasoupDevice.loaded !== true) await network.mediasoupDevice.load(connectToWorldResponse)

  if (isWorldConnection) receiveJoinWorld(connectToWorldResponse)

  if (isWorldConnection) await onConnectToWorldInstance(networkState)
  else await onConnectToMediaInstance(networkState)

  networkState.ready.set(true)

  logger.info('Successfully connected to instance type: %o', { topic: network.topic, hostId: network.hostId })
}

export async function onConnectToWorldInstance(networkState: State<SocketWebRTCClientNetwork>) {
  const network = networkState.value
  async function consumeDataHandler(options) {
    const dataConsumer = await network.recvTransport.consumeData(options)

    // Firefox uses blob as by default hence have to convert binary type of data consumer to 'arraybuffer' explicitly.
    dataConsumer.binaryType = 'arraybuffer'
    network.dataConsumers.set(options.dataProducerId, dataConsumer)

    dataConsumer.on('message', (message: any) => {
      try {
        network.incomingMessageQueueUnreliable.add(message)
        network.incomingMessageQueueUnreliableIDs.add(options.dataProducerId)
      } catch (error) {
        logger.error(error, 'Error handling data from consumer')
      }
    }) // Handle message received
    dataConsumer.on('close', () => {
      dataConsumer.close()
      network.dataConsumers.delete(options.dataProducerId)
    })
  }

  function kickHandler(message) {
    leaveNetwork(networkState, true)
    dispatchAction(NetworkConnectionService.actions.worldInstanceKicked({ message }))
    logger.info('Client has been kicked from the world')
  }

  async function reconnectHandler() {
    dispatchAction(NetworkConnectionService.actions.worldInstanceReconnected({}))
    networkState.reconnecting.set(false)
    await onConnectToInstance(networkState)
    network.socket.io.off('reconnect', reconnectHandler)
    network.socket.off('disconnect', disconnectHandler)
  }

  async function disconnectHandler() {
    dispatchAction(NetworkConnectionService.actions.worldInstanceDisconnected({}))
    dispatchAction(EngineActions.connectToWorld({ connectedWorld: false }))
    network.socket.off(MessageTypes.WebRTCConsumeData.toString(), consumeDataHandler)
    network.socket.off(MessageTypes.Kick.toString(), kickHandler)
    removeActionReceptor(consumeDataHandler)
  }

  network.socket.on('disconnect', disconnectHandler)
  network.socket.io.on('reconnect', reconnectHandler)

  // Get information for how to consume data from server and init a data consumer
  network.socket.on(MessageTypes.WebRTCConsumeData.toString(), consumeDataHandler)
  network.socket.on(MessageTypes.Kick.toString(), kickHandler)

  await Promise.all([initSendTransport(networkState), initReceiveTransport(networkState)])
  await createDataProducer(networkState, 'instance')

  dispatchAction(EngineActions.connectToWorld({ connectedWorld: true }))

  // use sendBeacon to tell the server we're disconnecting when
  // the page unloads
  window.addEventListener('unload', async () => {
    // TODO: Handle this as a full disconnect #5404
    network.socket.emit(MessageTypes.LeaveWorld.toString())
  })
}

export async function onConnectToMediaInstance(networkState: State<SocketWebRTCClientNetwork>) {
  const network = networkState.value

  async function webRTCPauseConsumerHandler(consumerId) {
    const consumer = network.consumers.find((c) => c.id === consumerId)
    consumer?.pause()
  }

  async function webRTCResumeConsumerHandler(consumerId) {
    const consumer = network.consumers.find((c) => c.id === consumerId)
    consumer?.resume()
  }

  async function webRTCCloseConsumerHandler(consumerId) {
    networkState.consumers.set(network.consumers.filter((c) => c.id !== consumerId))
    dispatchAction(MediaStreams.actions.triggerUpdateConsumers({}))
  }

  async function webRTCCreateProducerHandler(
    peerID: PeerID,
    mediaTag: MediaTagType,
    producerId,
    channelType: ChannelType,
    channelId
  ) {
    const selfProducerIds = [MediaStreams.instance.camVideoProducer?.id, MediaStreams.instance.camAudioProducer?.id]
    const channelConnectionState = accessMediaInstanceConnectionState()
    const currentChannelInstanceConnection = channelConnectionState.instances[network.hostId].ornull

    const consumerMatch = network.consumers?.find(
      (c) => c?.appData?.peerID === peerID && c?.appData?.mediaTag === mediaTag && c?.producerId === producerId
    )
    if (
      producerId != null &&
      // channelType === self.channelType &&
      selfProducerIds.indexOf(producerId) < 0 &&
      (consumerMatch == null || (consumerMatch.track?.muted && consumerMatch.track?.enabled)) &&
      (channelType === 'instance'
        ? currentChannelInstanceConnection.channelType.value === 'instance'
        : currentChannelInstanceConnection.channelType.value === channelType &&
          currentChannelInstanceConnection.channelId.value === channelId)
    ) {
      // that we don't already have consumers for...
      await subscribeToTrack(networkState, peerID, mediaTag)
    }
  }

  async function consumerHandler(action) {
    matches(action).when(MediaStreams.actions.closeConsumer.matches, ({ consumer }) => {
      closeConsumer(networkState, consumer)
    })
  }

  async function reconnectHandler() {
    dispatchAction(NetworkConnectionService.actions.mediaInstanceReconnected({}))
    networkState.reconnecting.set(false)
    await onConnectToInstance(networkState)
    await updateNearbyAvatars()
    const socket = network.socket
    if (MediaStreams.instance.videoStream) {
      if (MediaStreams.instance.camVideoProducer != null) {
        if (socket.connected === true && typeof networkRequest === 'function')
          await networkRequest(network, MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: MediaStreams.instance.camVideoProducer.id
          })
        await MediaStreams.instance.camVideoProducer?.close()
        await configureMediaTransports(network, ['video'])
        await createCamVideoProducer(network)
      }
      MediaStreamService.updateCamVideoState()
    }
    if (MediaStreams.instance.audioStream) {
      if (MediaStreams.instance.camAudioProducer != null) {
        if (socket.connected === true && typeof networkRequest === 'function')
          await networkRequest(network, MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: MediaStreams.instance.camAudioProducer.id
          })
        await MediaStreams.instance.camAudioProducer?.close()
        await configureMediaTransports(network, ['audio'])
        await createCamAudioProducer(network)
      }
      MediaStreamService.updateCamAudioState()
    }
    network.socket.io.off('reconnect', reconnectHandler)
    network.socket.off('disconnect', disconnectHandler)
    if (MediaStreams.instance.screenVideoProducer) {
      if (socket.connected === true && typeof networkRequest === 'function')
        await networkRequest(network, MessageTypes.WebRTCCloseProducer.toString(), {
          producerId: MediaStreams.instance.screenVideoProducer.id
        })
      await MediaStreams.instance.screenVideoProducer?.close()
      MediaStreamService.updateScreenVideoState()
    }
    if (MediaStreams.instance.screenAudioProducer) {
      if (socket.connected === true && typeof networkRequest === 'function')
        await networkRequest(network, MessageTypes.WebRTCCloseProducer.toString(), {
          producerId: MediaStreams.instance.screenAudioProducer.id
        })
      await MediaStreams.instance.screenAudioProducer?.close()
      MediaStreamService.updateScreenAudioState()
    }
  }

  async function disconnectHandler() {
    if (network.recvTransport?.closed !== true) await network.recvTransport!.close()
    if (network.sendTransport?.closed !== true) await network.sendTransport!.close()
    network.consumers.forEach((consumer) => closeConsumer(networkState, consumer))
    network.socket.off(MessageTypes.WebRTCCreateProducer.toString(), webRTCCreateProducerHandler)
    dispatchAction(NetworkConnectionService.actions.mediaInstanceDisconnected({}))
    network.socket.off(MessageTypes.WebRTCPauseConsumer.toString(), webRTCPauseConsumerHandler)
    network.socket.off(MessageTypes.WebRTCResumeConsumer.toString(), webRTCResumeConsumerHandler)
    network.socket.off(MessageTypes.WebRTCCloseConsumer.toString(), webRTCCloseConsumerHandler)
    removeActionReceptor(consumerHandler)
  }

  network.socket.on('disconnect', disconnectHandler)
  network.socket.on(MessageTypes.WebRTCCreateProducer.toString(), webRTCCreateProducerHandler)
  network.socket.io.on('reconnect', reconnectHandler)
  network.socket.on(MessageTypes.WebRTCPauseConsumer.toString(), webRTCPauseConsumerHandler)
  network.socket.on(MessageTypes.WebRTCResumeConsumer.toString(), webRTCResumeConsumerHandler)
  network.socket.on(MessageTypes.WebRTCCloseConsumer.toString(), webRTCCloseConsumerHandler)

  addActionReceptor(consumerHandler)

  await initRouter(network)
  await Promise.all([initSendTransport(networkState), initReceiveTransport(networkState)])
}

export async function createDataProducer(
  networkState: State<SocketWebRTCClientNetwork>,
  channelType: ChannelType,
  type = 'raw',
  customInitInfo: any = {}
): Promise<void> {
  const network = networkState.value
  const sendTransport = network.sendTransport
  const dataProducer = await sendTransport.produceData({
    appData: { data: customInitInfo },
    ordered: false,
    label: channelType,
    maxPacketLifeTime: 3000,
    // maxRetransmits: 3,
    protocol: type // sub-protocol for type of data to be transmitted on the channel e.g. json, raw etc. maybe make type an enum rather than string
  })
  // dataProducer.on("open", () => {
  //     network.dataProducer.send(JSON.stringify({ info: 'init' }));
  // });
  dataProducer.on('transportclose', () => {
    network.dataProducer?.close()
  })
  networkState.dataProducer.set(dataProducer)
}
// utility function to create a transport and hook up signaling logic
// appropriate to the transport's direction

export async function createTransport(network: SocketWebRTCClientNetwork, direction: string) {
  const { channelId, channelType } = getChannelTypeIdFromTransport(network)

  logger.info('Creating transport: %o', {
    topic: network.topic,
    direction,
    hostId: network.hostId,
    channelId,
    channelType
  })

  // ask the server to create a server-side transport object and send
  // us back the info we need to create a client-side transport
  let transport: MediaSoupTransport

  const { transportOptions } = await networkRequest(network, MessageTypes.WebRTCTransportCreate.toString(), {
    direction,
    sctpCapabilities: network.mediasoupDevice.sctpCapabilities,
    channelType: channelType,
    channelId: channelId
  })

  if (config.client.nodeEnv === 'production') transportOptions.iceServers = PUBLIC_STUN_SERVERS
  if (direction === 'recv') transport = await network.mediasoupDevice.createRecvTransport(transportOptions)
  else if (direction === 'send') transport = await network.mediasoupDevice.createSendTransport(transportOptions)
  else throw new Error(`bad transport 'direction': ${direction}`)

  // mediasoup-client will emit a connect event when media needs to
  // start flowing for the first time. send dtlsParameters to the
  // server, then call callback() on success or errback() on failure.

  transport.on(
    'connect',
    async (
      { dtlsParameters }: { dtlsParameters: DtlsParameters },
      callback: () => void,
      errback: (error: Error) => void
    ) => {
      const connectResult = await networkRequest(network, MessageTypes.WebRTCTransportConnect.toString(), {
        transportId: transportOptions.id,
        dtlsParameters
      })

      if (connectResult.error) {
        logger.error(connectResult.error, 'Transport connect error')
        return errback(connectResult.error)
      }

      callback()
    }
  )

  if (direction === 'send') {
    transport.on(
      'produce',
      async (
        {
          kind,
          rtpParameters,
          appData
        }: { kind: MediaKind; rtpParameters: RtpParameters; appData: MediaStreamAppData },
        callback: (arg0: { id: string }) => void,
        errback: (error: Error) => void
      ) => {
        let paused = false

        switch (appData.mediaTag) {
          case 'cam-video':
            paused = MediaStreams.instance.videoPaused
            break
          case 'cam-audio':
            paused = MediaStreams.instance.audioPaused
            break
          case 'screen-video':
            paused = MediaStreams.instance.screenShareVideoPaused
            break
          case 'screen-audio':
            paused = MediaStreams.instance.screenShareAudioPaused
            break
          default:
            return logger.error('Unkown media type on transport produce', appData.mediaTag)
        }

        // tell the server what it needs to know from us in order to set
        // up a server-side producer object, and get back a
        // producer.id. call callback() on success or errback() on
        // failure.
        const { error, id } = await networkRequest(network, MessageTypes.WebRTCSendTrack.toString(), {
          transportId: transportOptions.id,
          kind,
          rtpParameters,
          paused,
          appData
        })
        if (error) {
          logger.error(error)
          errback(error)
          return
        }
        callback({ id })
      }
    )

    transport.on(
      'producedata',
      async (
        parameters: {
          sctpStreamParameters: SctpStreamParameters
          label?: string | undefined
          protocol?: string | undefined
          appData: Record<string, unknown>
        },
        callback: (arg0: { id: string }) => void,
        errback: (error: Error) => void
      ) => {
        const { sctpStreamParameters, label, protocol, appData } = parameters
        const { error, id } = await networkRequest(network, MessageTypes.WebRTCProduceData, {
          transportId: transport.id,
          sctpStreamParameters,
          label,
          protocol,
          appData
        })

        if (error) {
          logger.error(error)
          errback(error)
          return
        }

        return callback({ id })
      }
    )
  }

  // any time a transport transitions to closed,
  // failed, or disconnected, leave the  and reset
  transport.on('connectionstatechange', async (state: string) => {
    if (state === 'closed' || state === 'failed' || state === 'disconnected') {
      NetworkPeerFunctions.destroyAllPeers(network)
      dispatchAction(
        network.topic === NetworkTopics.world
          ? NetworkConnectionService.actions.worldInstanceDisconnected({})
          : NetworkConnectionService.actions.mediaInstanceDisconnected({})
      )
      logger.error(new Error(`Transport ${transport} transitioned to state ${state}.`))
      logger.error(
        'If this occurred unexpectedly shortly after joining a world, check that the instanceserver nodegroup has public IP addresses.'
      )
      logger.info('Waiting 5 seconds to make a new transport')
      setTimeout(async () => {
        logger.info('Re-creating transport after unexpected closing/fail/disconnect %o', {
          direction,
          channelType,
          channelId
        })
        await createTransport(network, direction)
        logger.info('Re-created transport %o', { direction, channelType, channelId })
        dispatchAction(
          network.topic === NetworkTopics.world
            ? NetworkConnectionService.actions.worldInstanceReconnected({})
            : NetworkConnectionService.actions.mediaInstanceReconnected({})
        )
      }, 5000)
    }
  })
  ;(transport as any).channelType = channelType
  ;(transport as any).channelId = channelId

  return transport
}

export async function initReceiveTransport(networkState: State<SocketWebRTCClientNetwork>): Promise<void> {
  networkState.recvTransport.set(await createTransport(networkState.value, 'recv'))
}

export async function initSendTransport(networkState: State<SocketWebRTCClientNetwork>): Promise<void> {
  networkState.sendTransport.set(await createTransport(networkState.value, 'send'))
}

export async function initRouter(network: SocketWebRTCClientNetwork): Promise<void> {
  const { channelId, channelType } = getChannelTypeIdFromTransport(network)
  await networkRequest(network, MessageTypes.InitializeRouter.toString(), {
    channelType,
    channelId
  })
}

export async function configureMediaTransports(
  network: SocketWebRTCClientNetwork | null,
  mediaTypes: string[]
): Promise<boolean> {
  if (
    mediaTypes.indexOf('video') > -1 &&
    (MediaStreams.instance.videoStream == null || !MediaStreams.instance.videoStream.active)
  ) {
    await MediaStreams.instance.startCamera()

    if (MediaStreams.instance.videoStream == null) {
      logger.warn('Video stream is null, camera must have failed or be missing')
      return false
    }
  }

  if (
    mediaTypes.indexOf('audio') > -1 &&
    (MediaStreams.instance.audioStream == null || !MediaStreams.instance.audioStream.active)
  ) {
    await MediaStreams.instance.startMic()

    if (MediaStreams.instance.audioStream == null) {
      logger.warn('Audio stream is null, mic must have failed or be missing')
      return false
    }
  }

  //This probably isn't needed anymore with channels handling all audio and video, but left it in and commented
  //just in case.
  // if (
  //   network.sendTransport == null ||
  //     network.sendTransport.closed === true ||
  //     network.sendTransport.connectionState === 'disconnected'
  // ) {
  //   await initRouter(network)
  //   await Promise.all([initSendTransport(network), initReceiveTransport(network)])
  // }
  return true
}

export async function createCamVideoProducer(network: SocketWebRTCClientNetwork): Promise<void> {
  const channelConnectionState = accessMediaInstanceConnectionState()
  const currentChannelInstanceConnection = channelConnectionState.instances[network.hostId].ornull
  const channelType = currentChannelInstanceConnection.channelType.value
  const channelId = currentChannelInstanceConnection.channelId.value
  if (MediaStreams.instance.videoStream !== null && currentChannelInstanceConnection.videoEnabled.value) {
    if (network.sendTransport == null) {
      await new Promise((resolve) => {
        const waitForTransportReadyInterval = setInterval(() => {
          if (network.sendTransport) {
            clearInterval(waitForTransportReadyInterval)
            resolve(true)
          }
        }, 100)
      })
    }
    const transport = network.sendTransport
    try {
      let produceInProgress = false
      await new Promise((resolve) => {
        const waitForProducer = setInterval(async () => {
          if (!MediaStreams.instance.camVideoProducer || MediaStreams.instance.camVideoProducer.closed) {
            if (!produceInProgress) {
              produceInProgress = true
              MediaStreams.instance.camVideoProducer = await transport.produce({
                track: MediaStreams.instance.videoStream.getVideoTracks()[0],
                encodings: CAM_VIDEO_SIMULCAST_ENCODINGS,
                codecOptions: {
                  videoGoogleStartBitrate: 1000
                },
                appData: { mediaTag: 'cam-video', channelType: channelType, channelId: channelId }
              })
            }
          } else {
            clearInterval(waitForProducer)
            produceInProgress = false
            resolve(true)
          }
        }, 100)
      })
      if (MediaStreams.instance.videoPaused) await MediaStreams.instance.camVideoProducer.pause()
      else
        (await MediaStreams.instance.camVideoProducer) &&
          (await resumeProducer(network, MediaStreams.instance.camVideoProducer))
    } catch (err) {
      logger.error(err, 'Error producing video')
    }
  }
}

export async function createCamAudioProducer(network: SocketWebRTCClientNetwork): Promise<void> {
  const channelConnectionState = accessMediaInstanceConnectionState()
  const currentChannelInstanceConnection = channelConnectionState.instances[network.hostId].ornull
  const channelType = currentChannelInstanceConnection.channelType.value
  const channelId = currentChannelInstanceConnection.channelId.value
  if (MediaStreams.instance.audioStream !== null) {
    //To control the producer audio volume, we need to clone the audio track and connect a Gain to it.
    //This Gain is saved on MediaStreamSystem so it can be accessed from the user's component and controlled.
    const audioTrack = MediaStreams.instance.audioStream.getAudioTracks()[0]
    const ctx = new AudioContext()
    const src = ctx.createMediaStreamSource(new MediaStream([audioTrack]))
    const dst = ctx.createMediaStreamDestination()
    const gainNode = ctx.createGain()
    gainNode.gain.value = 1
    ;[src, gainNode, dst].reduce((a, b) => a && (a.connect(b) as any))
    MediaStreams.instance.microphoneGainNode = gainNode
    MediaStreams.instance.audioStream.removeTrack(audioTrack)
    MediaStreams.instance.audioStream.addTrack(dst.stream.getAudioTracks()[0])
    // same thing for audio, but we can use our already-created

    if (network.sendTransport == null) {
      await new Promise((resolve) => {
        const waitForTransportReadyInterval = setInterval(() => {
          if (network.sendTransport) {
            clearInterval(waitForTransportReadyInterval)
            resolve(true)
          }
        }, 100)
      })
    }

    const transport = network.sendTransport
    try {
      // Create a new transport for audio and start producing
      let produceInProgress = false
      await new Promise((resolve) => {
        const waitForProducer = setInterval(async () => {
          if (!MediaStreams.instance.camAudioProducer || MediaStreams.instance.camAudioProducer.closed) {
            if (!produceInProgress) {
              produceInProgress = true
              MediaStreams.instance.camAudioProducer = await transport.produce({
                track: MediaStreams.instance.audioStream.getAudioTracks()[0],
                appData: { mediaTag: 'cam-audio', channelType: channelType, channelId: channelId }
              })
            }
          } else {
            clearInterval(waitForProducer)
            produceInProgress = false
            resolve(true)
          }
        }, 100)
      })

      if (MediaStreams.instance.audioPaused) MediaStreams.instance.camAudioProducer.pause()
      else
        (await MediaStreams.instance.camAudioProducer) &&
          resumeProducer(network, MediaStreams.instance.camAudioProducer)
    } catch (err) {
      logger.error(err, 'Error producing video')
    }
  }
}

export async function endVideoChat(
  network: SocketWebRTCClientNetwork | null,
  options: { leftParty?: boolean; endConsumers?: boolean }
): Promise<boolean> {
  if (network) {
    try {
      const socket = network.socket
      if (MediaStreams.instance.camVideoProducer) {
        if (socket.connected === true && typeof networkRequest === 'function')
          await networkRequest(network, MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: MediaStreams.instance.camVideoProducer.id
          })
        await MediaStreams.instance.camVideoProducer?.close()
      }

      if (MediaStreams.instance.camAudioProducer) {
        if (socket.connected === true && typeof networkRequest === 'function')
          await networkRequest(network, MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: MediaStreams.instance.camAudioProducer.id
          })
        await MediaStreams.instance.camAudioProducer?.close()
      }

      if (MediaStreams.instance.screenVideoProducer) {
        if (socket.connected === true && typeof networkRequest === 'function')
          await networkRequest(network, MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: MediaStreams.instance.screenVideoProducer.id
          })
        await MediaStreams.instance.screenVideoProducer?.close()
      }
      if (MediaStreams.instance.screenAudioProducer) {
        if (socket.connected === true && typeof networkRequest === 'function')
          await networkRequest(network, MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: MediaStreams.instance.screenAudioProducer.id
          })
        await MediaStreams.instance.screenAudioProducer?.close()
      }

      if (options?.endConsumers === true) {
        network.consumers.map(async (c) => {
          if (networkRequest && typeof networkRequest === 'function')
            await networkRequest(network, MessageTypes.WebRTCCloseConsumer.toString(), {
              consumerId: c.id
            })
          await c.close()
        })
      }

      if (network.recvTransport?.closed !== true && typeof network.recvTransport?.close === 'function')
        await network.recvTransport.close()
      if (network.sendTransport?.closed !== true && typeof network.sendTransport?.close === 'function')
        await network.sendTransport.close()

      resetProducer()
      return true
    } catch (err) {
      logger.error(err, 'EndvideoChat error')
    }
  }
  return true // should this return true or false??
}

export function resetProducer(): void {
  if (MediaStreams) {
    if (MediaStreams.instance.audioStream) {
      const audioTracks = MediaStreams.instance.audioStream?.getTracks()
      audioTracks.forEach((track) => track.stop())
    }
    if (MediaStreams.instance.videoStream) {
      const videoTracks = MediaStreams.instance.videoStream?.getTracks()
      videoTracks.forEach((track) => track.stop())
    }
    MediaStreams.instance.camVideoProducer = null
    MediaStreams.instance.camAudioProducer = null
    MediaStreams.instance.screenVideoProducer = null
    MediaStreams.instance.screenAudioProducer = null
    MediaStreams.instance.audioStream = null!
    MediaStreams.instance.videoStream = null!
    MediaStreams.instance.localScreen = null!
    // MediaStreams.instance.instance?.consumers = [];
  }
}

export async function subscribeToTrack(
  networkState: State<SocketWebRTCClientNetwork>,
  peerID: PeerID,
  mediaTag: MediaTagType
) {
  const network = networkState.value

  const socket = network.socket
  if (!socket?.connected) return
  const channelConnectionState = accessMediaInstanceConnectionState()
  const currentChannelInstanceConnection = channelConnectionState.instances[network.hostId].ornull
  const channelType = currentChannelInstanceConnection.channelType.value
  const channelId = currentChannelInstanceConnection.channelId.value

  // ask the server to create a server-side consumer object and send us back the info we need to create a client-side consumer
  const consumerParameters = await networkRequest(network, MessageTypes.WebRTCReceiveTrack.toString(), {
    mediaTag,
    mediaPeerId: peerID,
    rtpCapabilities: network.mediasoupDevice.rtpCapabilities,
    channelType: channelType,
    channelId: channelId
  })

  // Only continue if we have a valid id
  if (consumerParameters?.id == null) return

  const consumer = (await network.recvTransport.consume({
    ...consumerParameters,
    appData: { peerID, mediaTag, channelType },
    paused: true
  })) as unknown as ConsumerExtension

  consumer.producerPaused = consumerParameters.producerPaused

  // if we do already have a consumer, we shouldn't have called this method
  const existingConsumer = network.consumers?.find(
    (c) => c?.appData?.peerID === peerID && c?.appData?.mediaTag === mediaTag
  )
  if (existingConsumer == null) {
    network.consumers.push(consumer)
    // okay, we're ready. let's ask the peer to send us media
    if (!consumer.producerPaused) await resumeConsumer(network, consumer)
    else await pauseConsumer(network, consumer)
  } else if (existingConsumer?.track?.muted) {
    await closeConsumer(networkState, existingConsumer)
    network.consumers.push(consumer)
    // okay, we're ready. let's ask the peer to send us media
    if (!consumer.producerPaused) await resumeConsumer(network, consumer)
    else await pauseConsumer(network, consumer)
  } else await closeConsumer(networkState, consumer)

  dispatchAction(MediaStreams.actions.triggerUpdateConsumers({}))
}

export async function unsubscribeFromTrack(
  networkState: State<SocketWebRTCClientNetwork>,
  peerID: PeerID,
  mediaTag: any
) {
  const consumer = networkState.value.consumers.find(
    (c) => c.appData.peerID === peerID && c.appData.mediaTag === mediaTag
  )
  await closeConsumer(networkState, consumer)
}

export async function pauseConsumer(network: SocketWebRTCClientNetwork, consumer: ConsumerExtension) {
  await networkRequest(network, MessageTypes.WebRTCPauseConsumer.toString(), {
    consumerId: consumer.id
  })
  if (consumer && typeof consumer.pause === 'function')
    network.mediasoupOperationQueue.add({
      object: consumer,
      action: 'pause'
    })
}

export async function resumeConsumer(network: SocketWebRTCClientNetwork, consumer: ConsumerExtension) {
  await networkRequest(network, MessageTypes.WebRTCResumeConsumer.toString(), {
    consumerId: consumer.id
  })
  if (consumer && typeof consumer.resume === 'function')
    network.mediasoupOperationQueue.add({
      object: consumer,
      action: 'resume'
    })
}

export async function pauseProducer(
  network: SocketWebRTCClientNetwork,
  producer: { appData: MediaTagType; id: any; pause: () => any }
) {
  await networkRequest(network, MessageTypes.WebRTCPauseProducer.toString(), {
    producerId: producer.id
  })
  if (producer && typeof producer.pause === 'function')
    network.mediasoupOperationQueue.add({
      object: producer,
      action: 'pause'
    })
}

export async function resumeProducer(
  network: SocketWebRTCClientNetwork,
  producer: { appData: MediaTagType; id: any; resume: () => any }
) {
  await networkRequest(network, MessageTypes.WebRTCResumeProducer.toString(), {
    producerId: producer.id
  })
  if (producer && typeof producer.resume === 'function')
    network.mediasoupOperationQueue.add({
      object: producer,
      action: 'resume'
    })
}

export async function globalMuteProducer(network: SocketWebRTCClientNetwork, producer: { id: any }) {
  await networkRequest(network, MessageTypes.WebRTCPauseProducer.toString(), {
    producerId: producer.id,
    globalMute: true
  })
}

export async function globalUnmuteProducer(network: SocketWebRTCClientNetwork, producer: { id: any }) {
  await networkRequest(network, MessageTypes.WebRTCResumeProducer.toString(), {
    producerId: producer.id
  })
}

export async function closeConsumer(networkState: State<SocketWebRTCClientNetwork>, consumer: any) {
  await consumer?.close()

  const network = networkState.value

  networkState.consumers.set(network.consumers.filter((c: any) => !(c.id === consumer.id)) as any[])
  dispatchAction(MediaStreamAction.setConsumersAction({ consumers: network.consumers }))
  await networkRequest(network, MessageTypes.WebRTCCloseConsumer.toString(), {
    consumerId: consumer.id
  })
}

export function leaveNetwork(networkState: State<SocketWebRTCClientNetwork>, kicked?: boolean) {
  const network = networkState.value
  try {
    if (!network) return
    // Leaving a network should close all transports from the server side.
    // This will also destroy all the associated producers and consumers.
    // All we need to do on the client is null all references.
    closeNetwork(networkState)

    const world = Engine.instance.currentWorld

    if (network.topic === NetworkTopics.media) {
      if (MediaStreams.instance.audioStream) {
        const audioTracks = MediaStreams.instance.audioStream?.getTracks()
        audioTracks.forEach((track) => track.stop())
      }
      if (MediaStreams.instance.videoStream) {
        const videoTracks = MediaStreams.instance.videoStream?.getTracks()
        videoTracks.forEach((track) => track.stop())
      }
      MediaStreams.instance.camVideoProducer = null
      MediaStreams.instance.camAudioProducer = null
      MediaStreams.instance.screenVideoProducer = null
      MediaStreams.instance.screenAudioProducer = null
      MediaStreams.instance.videoStream = null!
      MediaStreams.instance.audioStream = null!
      MediaStreams.instance.localScreen = null!
      networkState.consumers.set([])
      world.networks[network.hostId].set(none)
      world.hostIds.media.set(none)
      dispatchAction(MediaInstanceConnectionAction.disconnect({ instanceId: network.hostId }))
    } else {
      NetworkPeerFunctions.destroyAllPeers(network, world)
      world.networks[network.hostId].set(none)
      world.hostIds.world.set(none)
      dispatchAction(LocationInstanceConnectionAction.disconnect({ instanceId: network.hostId }))
      dispatchAction(EngineActions.connectToWorld({ connectedWorld: false }))
      // if world has a media server connection
      if (world.mediaNetwork?.value) {
        const mediaState = accessMediaInstanceConnectionState().instances[world.mediaNetwork.value.hostId].value
        if (mediaState.channelType === 'instance' && mediaState.connected) {
          leaveNetwork(world.mediaNetwork as State<SocketWebRTCClientNetwork>)
        }
      }
      const parsed = new URL(window.location.href)
      const query = parsed.searchParams
      query.delete('roomCode')
      query.delete('instanceId')
      parsed.search = query.toString()
      if (typeof history.pushState !== 'undefined') {
        window.history.replaceState({}, '', parsed.toString())
      }
    }
    removeActionsForTopic(network.hostId)
  } catch (err) {
    logger.error(err, 'Error with leave()')
  }
}

export const startScreenshare = async (networkState: State<SocketWebRTCClientNetwork>) => {
  logger.info('Start screen share')

  const network = networkState.value

  // make sure we've joined the  and that we have a sending transport
  if (!network.sendTransport) networkState.sendTransport.set(await createTransport(network, 'send'))

  // get a screen share track
  MediaStreams.instance.localScreen = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true
  })

  const channelConnectionState = accessMediaInstanceConnectionState()
  const currentChannelInstanceConnection = channelConnectionState.instances[network.hostId].ornull
  const channelType = currentChannelInstanceConnection.channelType.value
  const channelId = currentChannelInstanceConnection.channelId.value

  // create a producer for video
  MediaStreams.instance.setScreenShareVideoPaused(false)
  MediaStreams.instance.screenVideoProducer = await network.sendTransport.produce({
    track: MediaStreams.instance.localScreen.getVideoTracks()[0],
    encodings: SCREEN_SHARE_SIMULCAST_ENCODINGS,
    codecOptions: {
      videoGoogleStartBitrate: 1000
    },
    appData: { mediaTag: 'screen-video', channelType: channelType, channelId: channelId }
  })

  // create a producer for audio, if we have it
  if (MediaStreams.instance.localScreen.getAudioTracks().length) {
    MediaStreams.instance.screenAudioProducer = await network.sendTransport.produce({
      track: MediaStreams.instance.localScreen.getAudioTracks()[0],
      appData: { mediaTag: 'screen-audio', channelType: channelType, channelId: channelId }
    })
    MediaStreams.instance.setScreenShareAudioPaused(false)
  }

  // handler for screen share stopped event (triggered by the
  // browser's built-in screen sharing ui)
  MediaStreams.instance.screenVideoProducer.track.onended = async () => {
    return stopScreenshare(network)
  }

  MediaStreamService.updateScreenAudioState()
  MediaStreamService.updateScreenVideoState()
}

export const stopScreenshare = async (network: SocketWebRTCClientNetwork) => {
  logger.info('Screen share stopped')
  await MediaStreams.instance.screenVideoProducer.pause()
  MediaStreams.instance.setScreenShareVideoPaused(true)

  const { error } = await networkRequest(network, MessageTypes.WebRTCCloseProducer.toString(), {
    producerId: MediaStreams.instance.screenVideoProducer.id
  })

  if (error) logger.error(error)

  await MediaStreams.instance.screenVideoProducer.close()
  MediaStreams.instance.screenVideoProducer = null

  if (MediaStreams.instance.screenAudioProducer) {
    const { error: screenAudioProducerError } = await networkRequest(
      network,
      MessageTypes.WebRTCCloseProducer.toString(),
      {
        producerId: MediaStreams.instance.screenAudioProducer.id
      }
    )
    if (screenAudioProducerError) logger.error(screenAudioProducerError)

    await MediaStreams.instance.screenAudioProducer.close()
    MediaStreams.instance.screenAudioProducer = null
    MediaStreams.instance.setScreenShareAudioPaused(true)
  }

  MediaStreamService.updateScreenAudioState()
  MediaStreamService.updateScreenVideoState()
}
