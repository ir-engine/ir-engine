import {
  DtlsParameters,
  MediaKind,
  Transport as MediaSoupTransport,
  Producer,
  RtpParameters,
  SctpStreamParameters
} from 'mediasoup-client/lib/types'
import { v4 as uuidv4 } from 'uuid'

import config from '@etherealengine/common/src/config'
import { AuthTask } from '@etherealengine/common/src/interfaces/AuthTask'
import { ChannelType } from '@etherealengine/common/src/interfaces/Channel'
import { MediaStreamAppData, MediaTagType } from '@etherealengine/common/src/interfaces/MediaStreamConstants'
import { PeerID, PeersUpdateType } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import multiLogger from '@etherealengine/common/src/logger'
import { getSearchParamFromURL } from '@etherealengine/common/src/utils/getSearchParamFromURL'
import { matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineActions } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { NetworkTopics } from '@etherealengine/engine/src/networking/classes/Network'
import { PUBLIC_STUN_SERVERS } from '@etherealengine/engine/src/networking/constants/STUNServers'
import {
  CAM_VIDEO_SIMULCAST_ENCODINGS,
  SCREEN_SHARE_SIMULCAST_ENCODINGS
} from '@etherealengine/engine/src/networking/constants/VideoConstants'
import { MessageTypes } from '@etherealengine/engine/src/networking/enums/MessageTypes'
import { NetworkPeerFunctions } from '@etherealengine/engine/src/networking/functions/NetworkPeerFunctions'
import { receiveJoinMediaServer } from '@etherealengine/engine/src/networking/functions/receiveJoinMediaServer'
import {
  JoinWorldRequestData,
  receiveJoinWorld
} from '@etherealengine/engine/src/networking/functions/receiveJoinWorld'
import { NetworkState, removeNetwork } from '@etherealengine/engine/src/networking/NetworkState'
import {
  addActionReceptor,
  dispatchAction,
  getMutableState,
  none,
  removeActionReceptor,
  removeActionsForTopic
} from '@etherealengine/hyperflux'
import { Action } from '@etherealengine/hyperflux/functions/ActionFunctions'

import { LocationInstanceConnectionAction } from '../common/services/LocationInstanceConnectionService'
import {
  accessMediaInstanceConnectionState,
  MediaInstanceConnectionAction,
  MediaInstanceConnectionService
} from '../common/services/MediaInstanceConnectionService'
import { NetworkConnectionService } from '../common/services/NetworkConnectionService'
import { MediaState, MediaStreamAction, MediaStreamService } from '../media/services/MediaStreamService'
import {
  startFaceTracking,
  startLipsyncTracking,
  stopFaceTracking,
  stopLipsyncTracking
} from '../media/webcam/WebcamInput'
import { ChatState } from '../social/services/ChatService'
import { accessAuthState } from '../user/services/AuthService'
import { MediaStreamService as _MediaStreamService, MediaStreamActions, MediaStreamState } from './MediaStreams'
import { ConsumerExtension, ProducerExtension, SocketWebRTCClientNetwork } from './SocketWebRTCClientNetwork'
import { updateNearbyAvatars } from './UpdateNearbyUsersSystem'

const logger = multiLogger.child({ component: 'client-core:SocketWebRTCClientFunctions' })

export const getChannelTypeIdFromTransport = (network: SocketWebRTCClientNetwork) => {
  const channelConnectionState = accessMediaInstanceConnectionState()
  const mediaNetwork = Engine.instance.mediaNetwork
  const currentChannelInstanceConnection = mediaNetwork && channelConnectionState.instances[mediaNetwork.hostId].ornull
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

export async function onConnectToInstance(network: SocketWebRTCClientNetwork) {
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
      const response = (await network.request(MessageTypes.Authorization.toString(), payload)) as AuthTask
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
    network.primus.removeListener('end', commonDisconnectHandler)
    network.primus.removeListener('data', actionDataAndPeerUpdateHandler)
  }
  async function actionDataAndPeerUpdateHandler(message) {
    if (message.type === MessageTypes.ActionData.toString()) actionDataHandler(message.data)
    if (message.type === MessageTypes.UpdatePeers.toString()) peerUpdateHandler(message.data)
  }
  network.primus.on('data', actionDataAndPeerUpdateHandler)
  network.primus.on('end', commonDisconnectHandler)

  const joinWorldRequest = {
    inviteCode: getSearchParamFromURL('inviteCode')
  } as JoinWorldRequestData

  const connectToWorldResponse = await network.request(MessageTypes.JoinWorld.toString(), joinWorldRequest)

  if (!connectToWorldResponse || !connectToWorldResponse.routerRtpCapabilities) {
    dispatchAction(NetworkConnectionService.actions.worldInstanceReconnected({}))
    network.reconnecting = false
    onConnectToInstance(network)
    return
  }

  if (!network.mediasoupDevice.loaded) await network.mediasoupDevice.load(connectToWorldResponse)

  if (isWorldConnection) receiveJoinWorld(connectToWorldResponse)
  else receiveJoinMediaServer(connectToWorldResponse)

  if (isWorldConnection) await onConnectToWorldInstance(network)
  else await onConnectToMediaInstance(network)

  network.ready = true

  logger.info('Successfully connected to instance type: %o', { topic: network.topic, hostId: network.hostId })
}

export async function onConnectToWorldInstance(network: SocketWebRTCClientNetwork) {
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
    leaveNetwork(network, true)
    dispatchAction(NetworkConnectionService.actions.worldInstanceKicked({ message }))
    logger.info('Client has been kicked from the world')
  }

  async function reconnectHandler() {
    dispatchAction(NetworkConnectionService.actions.worldInstanceReconnected({}))
    network.reconnecting = false
    await onConnectToInstance(network)
    network.primus.removeListener('reconnected', reconnectHandler)
    network.primus.removeListener('disconnection', disconnectHandler)
  }

  async function disconnectHandler() {
    dispatchAction(NetworkConnectionService.actions.worldInstanceDisconnected({}))
    dispatchAction(EngineActions.connectToWorld({ connectedWorld: false }))
    removeActionReceptor(consumeDataHandler)
    network.primus.removeListener('data', consumeDataAndKickHandler)
  }

  async function consumeDataAndKickHandler(message) {
    if (message.type === MessageTypes.WebRTCConsumeData.toString()) consumeDataHandler(message.data)
    if (message.type === MessageTypes.Kick.toString()) kickHandler(message.data)
  }

  network.primus.on('disconnection', disconnectHandler)
  network.primus.on('reconnected', reconnectHandler)
  network.primus.on('data', consumeDataAndKickHandler)
  // Get information for how to consume data from server and init a data consumer

  await Promise.all([initSendTransport(network), initReceiveTransport(network)])
  await createDataProducer(network, 'instance')

  dispatchAction(EngineActions.connectToWorld({ connectedWorld: true }))

  // use sendBeacon to tell the server we're disconnecting when
  // the page unloads
  window.addEventListener('unload', async () => {
    // TODO: Handle this as a full disconnect #5404
    network.primus.write({ type: MessageTypes.LeaveWorld.toString(), id: uuidv4() })
  })
}

export async function onConnectToMediaInstance(network: SocketWebRTCClientNetwork) {
  const mediaStreamState = getMutableState(MediaStreamState)

  async function webRTCPauseConsumerHandler(consumerId) {
    const consumer = network.consumers.find((c) => c.id === consumerId)
    consumer?.pause()
  }

  async function webRTCResumeConsumerHandler(consumerId) {
    const consumer = network.consumers.find((c) => c.id === consumerId)
    consumer?.resume()
  }

  async function webRTCCloseConsumerHandler(consumerId) {
    network.consumers = network.consumers.filter((c) => c.id !== consumerId)
    dispatchAction(MediaStreamActions.triggerUpdateConsumers({}))
  }

  async function webRTCCreateProducerHandler({
    peerID,
    mediaTag,
    producerId,
    channelType,
    channelId
  }: {
    peerID: PeerID
    mediaTag: MediaTagType
    producerId: string
    channelType: ChannelType
    channelId: string
  }) {
    const selfProducerIds = [mediaStreamState.camVideoProducer.value?.id, mediaStreamState.camAudioProducer.value?.id]
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
      await subscribeToTrack(network as SocketWebRTCClientNetwork, peerID, mediaTag)
    }
  }

  async function consumerHandler(action) {
    matches(action).when(MediaStreamActions.closeConsumer.matches, ({ consumer }) => {
      closeConsumer(network, consumer)
    })
  }

  async function reconnectHandler() {
    dispatchAction(NetworkConnectionService.actions.mediaInstanceReconnected({}))
    network.reconnecting = false
    await onConnectToInstance(network)
    await updateNearbyAvatars()
    const request = network.request
    const primus = network.primus
    if (mediaStreamState.videoStream.value) {
      if (mediaStreamState.camVideoProducer.value) {
        if (!primus.disconnect && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: mediaStreamState.camVideoProducer.value.id
          })
        await mediaStreamState.camVideoProducer.value?.close()
        await configureMediaTransports(network, ['video'])
        await createCamVideoProducer(network)
      }
      MediaStreamService.updateCamVideoState()
    }
    if (mediaStreamState.audioStream.value) {
      if (mediaStreamState.camAudioProducer.value != null) {
        if (!primus.disconnect && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: mediaStreamState.camAudioProducer.value.id
          })
        await mediaStreamState.camAudioProducer.value?.close()
        await configureMediaTransports(network, ['audio'])
        await createCamAudioProducer(network)
      }
      MediaStreamService.updateCamAudioState()
    }
    network.primus.removeListener('reconnected', reconnectHandler)
    network.primus.removeListener('disconnection', disconnectHandler)
    if (mediaStreamState.screenVideoProducer.value) {
      if (!primus.disconnect && typeof request === 'function')
        await request(MessageTypes.WebRTCCloseProducer.toString(), {
          producerId: mediaStreamState.screenVideoProducer.value.id
        })
      await mediaStreamState.screenVideoProducer.value?.close()
      MediaStreamService.updateScreenVideoState()
    }
    if (mediaStreamState.screenAudioProducer.value) {
      if (!primus.disconnect && typeof request === 'function')
        await request(MessageTypes.WebRTCCloseProducer.toString(), {
          producerId: mediaStreamState.screenAudioProducer.value.id
        })
      await mediaStreamState.screenAudioProducer.value?.close()
      MediaStreamService.updateScreenAudioState()
    }
  }

  async function producerConsumerHandler(message) {
    const { type, data } = message
    switch (type) {
      case MessageTypes.WebRTCCreateProducer.toString():
        webRTCCreateProducerHandler(data)
        break
      case MessageTypes.WebRTCPauseConsumer.toString():
        webRTCPauseConsumerHandler(data)
        break
      case MessageTypes.WebRTCResumeConsumer.toString():
        webRTCResumeConsumerHandler(data)
        break
      case MessageTypes.WebRTCCloseConsumer.toString():
        webRTCCloseConsumerHandler(data)
        break
    }
  }

  async function disconnectHandler() {
    if (network.recvTransport?.closed !== true) await network.recvTransport.close()
    if (network.sendTransport?.closed !== true) await network.sendTransport.close()
    network.consumers.forEach((consumer) => closeConsumer(network, consumer))
    dispatchAction(NetworkConnectionService.actions.mediaInstanceDisconnected({}))
    network.primus.removeListener('data', producerConsumerHandler)
    removeActionReceptor(consumerHandler)
  }

  network.primus.on('disconnection', disconnectHandler)
  network.primus.on('reconnected', reconnectHandler)
  network.primus.on('data', producerConsumerHandler)

  addActionReceptor(consumerHandler)

  await initRouter(network)
  await Promise.all([initSendTransport(network), initReceiveTransport(network)])
}

export async function createDataProducer(
  network: SocketWebRTCClientNetwork,
  channelType: ChannelType,
  type = 'raw',
  customInitInfo: any = {}
): Promise<void> {
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
  network.dataProducer = dataProducer
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

  const { transportOptions } = await network.request(MessageTypes.WebRTCTransportCreate.toString(), {
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
      const connectResult = await network.request(MessageTypes.WebRTCTransportConnect.toString(), {
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
        const mediaStreamState = getMutableState(MediaStreamState)
        let paused = false

        switch (appData.mediaTag) {
          case 'cam-video':
            paused = mediaStreamState.videoPaused.value
            break
          case 'cam-audio':
            paused = mediaStreamState.audioPaused.value
            break
          case 'screen-video':
            paused = mediaStreamState.screenShareVideoPaused.value
            break
          case 'screen-audio':
            paused = mediaStreamState.screenShareAudioPaused.value
            break
          default:
            return logger.error('Unkown media type on transport produce', appData.mediaTag)
        }

        // tell the server what it needs to know from us in order to set
        // up a server-side producer object, and get back a
        // producer.id. call callback() on success or errback() on
        // failure.
        const { error, id } = await network.request(MessageTypes.WebRTCSendTrack.toString(), {
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
        const { error, id } = await network.request(MessageTypes.WebRTCProduceData.toString(), {
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

export async function initReceiveTransport(network: SocketWebRTCClientNetwork): Promise<void> {
  network.recvTransport = await createTransport(network, 'recv')
}

export async function initSendTransport(network: SocketWebRTCClientNetwork): Promise<void> {
  network.sendTransport = await createTransport(network, 'send')
}

export async function initRouter(network: SocketWebRTCClientNetwork): Promise<void> {
  const { channelId, channelType } = getChannelTypeIdFromTransport(network)
  await network.request(MessageTypes.InitializeRouter.toString(), {
    channelType,
    channelId
  })
}

export async function configureMediaTransports(
  network: SocketWebRTCClientNetwork | null,
  mediaTypes: string[]
): Promise<boolean> {
  const mediaStreamState = getMutableState(MediaStreamState)
  if (
    mediaTypes.indexOf('video') > -1 &&
    (mediaStreamState.videoStream.value == null || !mediaStreamState.videoStream.value.active)
  ) {
    await _MediaStreamService.startCamera()

    if (!mediaStreamState.videoStream.value) {
      logger.warn('Video stream is null, camera must have failed or be missing')
      return false
    }
  }

  if (
    mediaTypes.indexOf('audio') > -1 &&
    (mediaStreamState.audioStream.value == null || !mediaStreamState.audioStream.value.active)
  ) {
    await _MediaStreamService.startMic()

    if (mediaStreamState.audioStream.value == null) {
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
  const mediaStreamState = getMutableState(MediaStreamState)
  if (mediaStreamState.videoStream.value !== null && currentChannelInstanceConnection.videoEnabled.value) {
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
          if (!mediaStreamState.camVideoProducer.value || mediaStreamState.camVideoProducer.value.closed) {
            if (!produceInProgress) {
              produceInProgress = true
              const producer = (await transport.produce({
                track: mediaStreamState.videoStream.value!.getVideoTracks()[0],
                encodings: CAM_VIDEO_SIMULCAST_ENCODINGS,
                codecOptions: {
                  videoGoogleStartBitrate: 1000
                },
                appData: { mediaTag: 'cam-video', channelType: channelType, channelId: channelId }
              })) as any as ProducerExtension
              mediaStreamState.camVideoProducer.set(producer)
            }
          } else {
            clearInterval(waitForProducer)
            produceInProgress = false
            resolve(true)
          }
        }, 100)
      })
      console.log(mediaStreamState.videoPaused.value)
      if (mediaStreamState.videoPaused.value) await mediaStreamState.camVideoProducer.value!.pause()
      else if (mediaStreamState.camVideoProducer.value)
        await resumeProducer(network, mediaStreamState.camVideoProducer.value!)
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
  const mediaStreamState = getMutableState(MediaStreamState)
  if (mediaStreamState.audioStream.value !== null) {
    //To control the producer audio volume, we need to clone the audio track and connect a Gain to it.
    //This Gain is saved on MediaStreamState so it can be accessed from the user's component and controlled.
    const audioTrack = mediaStreamState.audioStream.value.getAudioTracks()[0]
    const ctx = new AudioContext()
    const src = ctx.createMediaStreamSource(new MediaStream([audioTrack]))
    const dst = ctx.createMediaStreamDestination()
    const gainNode = ctx.createGain()
    gainNode.gain.value = 1
    ;[src, gainNode, dst].reduce((a, b) => a && (a.connect(b) as any))
    mediaStreamState.microphoneGainNode.set(gainNode)
    mediaStreamState.audioStream.value.removeTrack(audioTrack)
    mediaStreamState.audioStream.value.addTrack(dst.stream.getAudioTracks()[0])
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
          if (!mediaStreamState.camAudioProducer.value || mediaStreamState.camAudioProducer.value.closed) {
            if (!produceInProgress) {
              produceInProgress = true
              const producer = (await transport.produce({
                track: mediaStreamState.audioStream.value!.getAudioTracks()[0],
                appData: { mediaTag: 'cam-audio', channelType: channelType, channelId: channelId }
              })) as any as ProducerExtension
              mediaStreamState.camAudioProducer.set(producer)
            }
          } else {
            clearInterval(waitForProducer)
            produceInProgress = false
            resolve(true)
          }
        }, 100)
      })

      if (mediaStreamState.audioPaused.value) mediaStreamState.camAudioProducer.value!.pause()
      else if (mediaStreamState.camAudioProducer.value)
        await resumeProducer(network, mediaStreamState.camAudioProducer.value!)
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
    const mediaStreamState = getMutableState(MediaStreamState)
    try {
      const request = network.request
      const primus = network.primus
      if (mediaStreamState.camVideoProducer.value) {
        if (!primus.disconnect && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: mediaStreamState.camVideoProducer.value.id
          })
        await mediaStreamState.camVideoProducer.value?.close()
      }

      if (mediaStreamState.camAudioProducer.value) {
        if (!primus.disconnect && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: mediaStreamState.camAudioProducer.value.id
          })
        await mediaStreamState.camAudioProducer.value?.close()
      }

      if (mediaStreamState.screenVideoProducer.value) {
        if (!primus.disconnect && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: mediaStreamState.screenVideoProducer.value.id
          })
        await mediaStreamState.screenVideoProducer.value?.close()
      }
      if (mediaStreamState.screenAudioProducer.value) {
        if (!primus.disconnect && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: mediaStreamState.screenAudioProducer.value.id
          })
        await mediaStreamState.screenAudioProducer.value?.close()
      }

      if (options?.endConsumers === true) {
        network.consumers.map(async (c) => {
          if (request && typeof request === 'function')
            await request(MessageTypes.WebRTCCloseConsumer.toString(), {
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
  const mediaStreamState = getMutableState(MediaStreamState)
  if (mediaStreamState.audioStream.value) {
    const audioTracks = mediaStreamState.audioStream.value?.getTracks()
    audioTracks.forEach((track) => track.stop())
  }
  if (mediaStreamState.videoStream.value) {
    const videoTracks = mediaStreamState.videoStream.value?.getTracks()
    videoTracks.forEach((track) => track.stop())
  }
  mediaStreamState.camVideoProducer.set(null)
  mediaStreamState.camAudioProducer.set(null)
  mediaStreamState.screenVideoProducer.set(null)
  mediaStreamState.screenAudioProducer.set(null)
  mediaStreamState.audioStream.set(null)
  mediaStreamState.videoStream.set(null)
  mediaStreamState.localScreen.set(null)
  // mediaStreamState.instance.value?.consumers = [];
}

export async function subscribeToTrack(network: SocketWebRTCClientNetwork, peerID: PeerID, mediaTag: MediaTagType) {
  const primus = network.primus
  if (primus?.disconnect) return
  const channelConnectionState = accessMediaInstanceConnectionState()
  const currentChannelInstanceConnection = channelConnectionState.instances[network.hostId].ornull
  const channelType = currentChannelInstanceConnection.channelType.value
  const channelId = currentChannelInstanceConnection.channelId.value

  // ask the server to create a server-side consumer object and send us back the info we need to create a client-side consumer
  const consumerParameters = await network.request(MessageTypes.WebRTCReceiveTrack.toString(), {
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
    await closeConsumer(network, existingConsumer)
    network.consumers.push(consumer)
    // okay, we're ready. let's ask the peer to send us media
    if (!consumer.producerPaused) await resumeConsumer(network, consumer)
    else await pauseConsumer(network, consumer)
  } else await closeConsumer(network, consumer)

  dispatchAction(MediaStreamActions.triggerUpdateConsumers({}))
}

export async function unsubscribeFromTrack(network: SocketWebRTCClientNetwork, peerID: PeerID, mediaTag: any) {
  const consumer = network.consumers.find((c) => c.appData.peerID === peerID && c.appData.mediaTag === mediaTag)
  await closeConsumer(network, consumer)
}

export async function pauseConsumer(network: SocketWebRTCClientNetwork, consumer: ConsumerExtension) {
  await network.request(MessageTypes.WebRTCPauseConsumer.toString(), {
    consumerId: consumer.id
  })

  if (consumer && typeof consumer.pause === 'function' && !consumer.closed && !(consumer as any)._closed)
    await consumer.pause()
}

export async function resumeConsumer(network: SocketWebRTCClientNetwork, consumer: ConsumerExtension) {
  await network.request(MessageTypes.WebRTCResumeConsumer.toString(), {
    consumerId: consumer.id
  })
  if (consumer && typeof consumer.resume === 'function' && !consumer.closed && !(consumer as any)._closed)
    await consumer.resume()
}

export async function pauseProducer(network: SocketWebRTCClientNetwork, producer: ProducerExtension) {
  await network.request(MessageTypes.WebRTCPauseProducer.toString(), {
    producerId: producer.id
  })

  if (producer && typeof producer.pause === 'function' && !producer.closed && !(producer as any)._closed)
    await producer.pause()
}

export async function resumeProducer(network: SocketWebRTCClientNetwork, producer: ProducerExtension) {
  await network.request(MessageTypes.WebRTCResumeProducer.toString(), {
    producerId: producer.id
  })

  if (producer && typeof producer.resume === 'function' && !producer.closed && !(producer as any)._closed)
    await producer.resume()
}

export async function globalMuteProducer(network: SocketWebRTCClientNetwork, producer: { id: any }) {
  await network.request(MessageTypes.WebRTCPauseProducer.toString(), {
    producerId: producer.id,
    globalMute: true
  })
}

export async function globalUnmuteProducer(network: SocketWebRTCClientNetwork, producer: { id: any }) {
  await network.request(MessageTypes.WebRTCResumeProducer.toString(), {
    producerId: producer.id
  })
}

export async function closeConsumer(network: SocketWebRTCClientNetwork, consumer: any) {
  await consumer?.close()

  network.consumers = network.consumers.filter((c: any) => !(c.id === consumer.id)) as any[]
  dispatchAction(MediaStreamAction.setConsumersAction({ consumers: network.consumers }))
  await network.request(MessageTypes.WebRTCCloseConsumer.toString(), {
    consumerId: consumer.id
  })
}

const checkEndVideoChat = async () => {
  const mediaStreamState = getMutableState(MediaStreamState)
  const mediaNetwork = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
  const chatState = getMutableState(ChatState)
  const channelState = chatState.channels
  const channels = channelState.channels.value

  const channelEntries = Object.values(channels).filter((channel) => !!channel) as any
  const instanceChannel = channelEntries.find((entry) => entry.instanceId === Engine.instance.worldNetwork?.hostId)
  if (
    (mediaStreamState.audioPaused.value || mediaStreamState.camAudioProducer.value == null) &&
    (mediaStreamState.videoPaused.value || mediaStreamState.camVideoProducer.value == null) &&
    instanceChannel.channelType !== 'instance'
  ) {
    await endVideoChat(mediaNetwork, {})
    if (!mediaNetwork.primus?.disconnect) {
      await leaveNetwork(mediaNetwork, false)
      await MediaInstanceConnectionService.provisionServer(instanceChannel.id)
    }
  }
}

export const toggleFaceTracking = async () => {
  const mediaStreamState = getMutableState(MediaStreamState)
  const mediaState = getMutableState(MediaState)
  if (mediaState.isFaceTrackingEnabled.value) {
    mediaStreamState.faceTracking.set(false)
    stopFaceTracking()
    stopLipsyncTracking()
    MediaStreamService.updateFaceTrackingState()
  } else {
    const mediaNetwork = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
    if (await configureMediaTransports(mediaNetwork, ['video', 'audio'])) {
      mediaStreamState.faceTracking.set(true)
      startFaceTracking()
      startLipsyncTracking()
      MediaStreamService.updateFaceTrackingState()
    }
  }
}

export const toggleMicrophonePaused = async () => {
  const mediaStreamState = getMutableState(MediaStreamState)
  const mediaNetwork = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
  if (await configureMediaTransports(mediaNetwork, ['audio'])) {
    if (!mediaStreamState.camAudioProducer.value) await createCamAudioProducer(mediaNetwork)
    else {
      const audioPaused = mediaStreamState.audioPaused.value
      if (audioPaused) await resumeProducer(mediaNetwork, mediaStreamState.camAudioProducer.value!)
      else await pauseProducer(mediaNetwork, mediaStreamState.camAudioProducer.value!)
      mediaStreamState.audioPaused.set(!audioPaused)
      checkEndVideoChat()
    }
    MediaStreamService.updateCamAudioState()
  }
}

export const toggleWebcamPaused = async () => {
  const mediaStreamState = getMutableState(MediaStreamState)
  const mediaNetwork = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
  if (await configureMediaTransports(mediaNetwork, ['video'])) {
    if (!mediaStreamState.camVideoProducer.value) await createCamVideoProducer(mediaNetwork)
    else {
      const videoPaused = mediaStreamState.videoPaused.value
      if (videoPaused) await resumeProducer(mediaNetwork, mediaStreamState.camVideoProducer.value!)
      else await pauseProducer(mediaNetwork, mediaStreamState.camVideoProducer.value!)
      mediaStreamState.videoPaused.set(!videoPaused)
    }

    MediaStreamService.updateCamVideoState()
  }
}

export const toggleScreenshare = async () => {
  const mediaStreamState = getMutableState(MediaStreamState)
  const mediaNetwork = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
  if (mediaStreamState.screenVideoProducer.value) await stopScreenshare(mediaNetwork)
  else await startScreenshare(mediaNetwork)
}

export const toggleScreenshareAudioPaused = async () => {
  const mediaStreamState = getMutableState(MediaStreamState)
  const mediaNetwork = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
  const audioPaused = mediaStreamState.screenShareAudioPaused.value
  if (audioPaused) await resumeProducer(mediaNetwork, mediaStreamState.screenAudioProducer.value!)
  else await pauseProducer(mediaNetwork, mediaStreamState.screenAudioProducer.value!)
  mediaStreamState.screenShareAudioPaused.set(!audioPaused)
  MediaStreamService.updateScreenAudioState()
}

export const toggleScreenshareVideoPaused = async () => {
  const mediaStreamState = getMutableState(MediaStreamState)
  const mediaNetwork = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
  mediaStreamState.screenShareVideoPaused.set(!mediaStreamState.screenShareVideoPaused.value)
  const videoPaused = mediaStreamState.screenShareVideoPaused.value
  if (videoPaused) await resumeProducer(mediaNetwork, mediaStreamState.screenVideoProducer.value!)
  else await stopScreenshare(mediaNetwork)
  MediaStreamService.updateScreenVideoState()
}

export function leaveNetwork(network: SocketWebRTCClientNetwork, kicked?: boolean) {
  const mediaStreamState = getMutableState(MediaStreamState)
  try {
    if (!network) return
    // Leaving a network should close all transports from the server side.
    // This will also destroy all the associated producers and consumers.
    // All we need to do on the client is null all references.
    network.close()

    if (network.topic === NetworkTopics.media) {
      if (mediaStreamState.audioStream.value) {
        const audioTracks = mediaStreamState.audioStream.value?.getTracks()
        audioTracks.forEach((track) => track.stop())
      }
      if (mediaStreamState.videoStream.value) {
        const videoTracks = mediaStreamState.videoStream.value?.getTracks()
        videoTracks.forEach((track) => track.stop())
      }
      mediaStreamState.camVideoProducer.set(null)
      mediaStreamState.camAudioProducer.set(null)
      mediaStreamState.screenVideoProducer.set(null)
      mediaStreamState.screenAudioProducer.set(null)
      mediaStreamState.videoStream.set(null)
      mediaStreamState.audioStream.set(null)
      mediaStreamState.localScreen.set(null)
      network.consumers = []
      removeNetwork(network)
      getMutableState(NetworkState).hostIds.media.set(none)
      dispatchAction(MediaInstanceConnectionAction.disconnect({ instanceId: network.hostId }))
    } else {
      NetworkPeerFunctions.destroyAllPeers(network)
      removeNetwork(network)
      getMutableState(NetworkState).hostIds.world.set(none)
      dispatchAction(LocationInstanceConnectionAction.disconnect({ instanceId: network.hostId }))
      dispatchAction(EngineActions.connectToWorld({ connectedWorld: false }))
      // if world has a media server connection
      if (Engine.instance.mediaNetwork) {
        const mediaState = accessMediaInstanceConnectionState().instances[Engine.instance.mediaNetwork.hostId].value
        if (mediaState.channelType === 'instance' && mediaState.connected) {
          leaveNetwork(Engine.instance.mediaNetwork as SocketWebRTCClientNetwork)
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

export const startScreenshare = async (network: SocketWebRTCClientNetwork) => {
  logger.info('Start screen share')
  const mediaStreamState = getMutableState(MediaStreamState)

  // make sure we've joined the  and that we have a sending transport
  if (!network.sendTransport) network.sendTransport = await createTransport(network, 'send')

  // get a screen share track
  mediaStreamState.localScreen.set(
    await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    })
  )

  console.log('local screen', mediaStreamState.localScreen.value)

  const channelConnectionState = accessMediaInstanceConnectionState()
  const currentChannelInstanceConnection = channelConnectionState.instances[network.hostId].ornull
  const channelType = currentChannelInstanceConnection.channelType.value
  const channelId = currentChannelInstanceConnection.channelId.value

  // create a producer for video
  mediaStreamState.screenShareVideoPaused.set(false)
  mediaStreamState.screenVideoProducer.set(
    (await network.sendTransport.produce({
      track: mediaStreamState.localScreen.value!.getVideoTracks()[0],
      encodings: SCREEN_SHARE_SIMULCAST_ENCODINGS,
      codecOptions: {
        videoGoogleStartBitrate: 1000
      },
      appData: { mediaTag: 'screen-video', channelType: channelType, channelId: channelId }
    })) as any as ProducerExtension
  )

  console.log('screen producer', mediaStreamState.screenVideoProducer.value)

  // create a producer for audio, if we have it
  if (mediaStreamState.localScreen.value!.getAudioTracks().length) {
    mediaStreamState.screenAudioProducer.set(
      (await network.sendTransport.produce({
        track: mediaStreamState.localScreen.value!.getAudioTracks()[0],
        appData: { mediaTag: 'screen-audio', channelType: channelType, channelId: channelId }
      })) as any as ProducerExtension
    )
    mediaStreamState.screenShareAudioPaused.set(false)
  }

  // handler for screen share stopped event (triggered by the
  // browser's built-in screen sharing ui)
  mediaStreamState.screenVideoProducer.value!.track!.onended = async () => {
    return stopScreenshare(network)
  }

  MediaStreamService.updateScreenAudioState()
  MediaStreamService.updateScreenVideoState()
}

export const stopScreenshare = async (network: SocketWebRTCClientNetwork) => {
  logger.info('Screen share stopped')
  const mediaStreamState = getMutableState(MediaStreamState)

  if (mediaStreamState.screenVideoProducer.value) {
    await mediaStreamState.screenVideoProducer.value.pause()
    mediaStreamState.screenShareVideoPaused.set(true)

    const { error } = await network.request(MessageTypes.WebRTCCloseProducer.toString(), {
      producerId: mediaStreamState.screenVideoProducer.value.id
    })

    if (error) logger.error(error)

    await mediaStreamState.screenVideoProducer.value.close()
    mediaStreamState.screenVideoProducer.set(null)
  }

  if (mediaStreamState.screenAudioProducer.value) {
    const { error: screenAudioProducerError } = await network.request(MessageTypes.WebRTCCloseProducer.toString(), {
      producerId: mediaStreamState.screenAudioProducer.value.id
    })
    if (screenAudioProducerError) logger.error(screenAudioProducerError)

    await mediaStreamState.screenAudioProducer.value.close()
    mediaStreamState.screenAudioProducer.set(null)
    mediaStreamState.screenShareAudioPaused.set(true)
  }

  MediaStreamService.updateScreenAudioState()
  MediaStreamService.updateScreenVideoState()
}
