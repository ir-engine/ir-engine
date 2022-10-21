import {
  Consumer,
  DtlsParameters,
  MediaKind,
  Transport as MediaSoupTransport,
  RtpParameters,
  SctpStreamParameters
} from 'mediasoup-client/lib/types'

import { MediaStreams } from '@xrengine/client-core/src/transports/MediaStreams'
import { AuthTask } from '@xrengine/common/src/interfaces/AuthTask'
import { ChannelType } from '@xrengine/common/src/interfaces/Channel'
import { MediaTagType } from '@xrengine/common/src/interfaces/MediaStreamConstants'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import multiLogger from '@xrengine/common/src/logger'
import { getSearchParamFromURL } from '@xrengine/common/src/utils/getSearchParamFromURL'
import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineState'
import { NetworkTopics } from '@xrengine/engine/src/networking/classes/Network'
import { PUBLIC_STUN_SERVERS } from '@xrengine/engine/src/networking/constants/STUNServers'
import {
  CAM_VIDEO_SIMULCAST_ENCODINGS,
  SCREEN_SHARE_SIMULCAST_ENCODINGS
} from '@xrengine/engine/src/networking/constants/VideoConstants'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { NetworkPeerFunctions } from '@xrengine/engine/src/networking/functions/NetworkPeerFunctions'
import { JoinWorldRequestData, receiveJoinWorld } from '@xrengine/engine/src/networking/functions/receiveJoinWorld'
import { addActionReceptor, dispatchAction, removeActionReceptor, removeActionsForTopic } from '@xrengine/hyperflux'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'

import { LocationInstanceConnectionAction } from '../common/services/LocationInstanceConnectionService'
import {
  accessMediaInstanceConnectionState,
  MediaInstanceConnectionAction
} from '../common/services/MediaInstanceConnectionService'
import { NetworkConnectionService } from '../common/services/NetworkConnectionService'
import { MediaStreamAction, MediaStreamService } from '../media/services/MediaStreamService'
import { accessAuthState } from '../user/services/AuthService'
import { SocketWebRTCClientNetwork } from './SocketWebRTCClientNetwork'
import { updateNearbyAvatars } from './UpdateNearbyUsersSystem'

const logger = multiLogger.child({ component: 'client-core:SocketWebRTCClientFunctions' })

class ExtendedConsumer extends Consumer {
  producerPaused?: boolean
}

export const getChannelTypeIdFromTransport = (network: SocketWebRTCClientNetwork) => {
  const channelConnectionState = accessMediaInstanceConnectionState()
  const mediaNetwork = Engine.instance.currentWorld.mediaNetwork
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

type PeersUpdateType = Array<{
  userId: UserId
  index: number
  name: string
}>

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

  function peerUpdateHandler(peers: PeersUpdateType) {
    for (const peer of peers) {
      NetworkPeerFunctions.createPeer(network, peer.userId, peer.index, peer.name)
    }
    for (const [userId, peer] of network.peers) {
      if (!peers.find((p) => p.userId === userId)) NetworkPeerFunctions.destroyPeer(network, userId)
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

  const connectToWorldResponse = await network.request(MessageTypes.JoinWorld.toString(), joinWorldRequest)

  if (!connectToWorldResponse || !connectToWorldResponse.routerRtpCapabilities) {
    dispatchAction(NetworkConnectionService.actions.worldInstanceReconnected({}))
    network.reconnecting = false
    onConnectToInstance(network)
    return
  }

  if (network.mediasoupDevice.loaded !== true) await network.mediasoupDevice.load(connectToWorldResponse)

  if (isWorldConnection) receiveJoinWorld(connectToWorldResponse)

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

  await Promise.all([initSendTransport(network), initReceiveTransport(network)])
  await createDataProducer(network, 'instance')

  dispatchAction(EngineActions.connectToWorld({ connectedWorld: true }))

  // use sendBeacon to tell the server we're disconnecting when
  // the page unloads
  window.addEventListener('unload', async () => {
    // TODO: Handle this as a full disconnect
    network.socket.emit(MessageTypes.LeaveWorld.toString())
  })
}

export async function onConnectToMediaInstance(network: SocketWebRTCClientNetwork) {
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
    dispatchAction(MediaStreams.actions.triggerUpdateConsumers({}))
  }

  async function webRTCCreateProducerHandler(socketId, mediaTag, producerId, channelType: ChannelType, channelId) {
    const selfProducerIds = [MediaStreams.instance.camVideoProducer?.id, MediaStreams.instance.camAudioProducer?.id]
    const channelConnectionState = accessMediaInstanceConnectionState()
    const currentChannelInstanceConnection = channelConnectionState.instances[network.hostId].ornull

    const consumerMatch = network.consumers?.find(
      (c) => c?.appData?.peerId === socketId && c?.appData?.mediaTag === mediaTag && c?.producerId === producerId
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
      await subscribeToTrack(network as SocketWebRTCClientNetwork, socketId, mediaTag)
    }
  }

  async function consumerHandler(action) {
    matches(action).when(MediaStreams.actions.closeConsumer.matches, ({ consumer }) => {
      closeConsumer(network, consumer)
    })
  }

  async function reconnectHandler() {
    dispatchAction(NetworkConnectionService.actions.mediaInstanceReconnected({}))
    network.reconnecting = false
    await onConnectToInstance(network)
    await updateNearbyAvatars()
    const request = network.request
    const socket = network.socket
    if (MediaStreams.instance.videoStream) {
      if (MediaStreams.instance.camVideoProducer != null) {
        if (socket.connected === true && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
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
        if (socket.connected === true && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
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
      if (socket.connected === true && typeof request === 'function')
        await request(MessageTypes.WebRTCCloseProducer.toString(), {
          producerId: MediaStreams.instance.screenVideoProducer.id
        })
      await MediaStreams.instance.screenVideoProducer?.close()
      MediaStreamService.updateScreenVideoState()
    }
    if (MediaStreams.instance.screenAudioProducer) {
      if (socket.connected === true && typeof request === 'function')
        await request(MessageTypes.WebRTCCloseProducer.toString(), {
          producerId: MediaStreams.instance.screenAudioProducer.id
        })
      await MediaStreams.instance.screenAudioProducer?.close()
      MediaStreamService.updateScreenAudioState()
    }
  }

  async function disconnectHandler() {
    if (network.recvTransport?.closed !== true) await network.recvTransport.close()
    if (network.sendTransport?.closed !== true) await network.sendTransport.close()
    network.consumers.forEach((consumer) => closeConsumer(network, consumer))
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

  if (process.env.NODE_ENV === 'production') transportOptions.iceServers = PUBLIC_STUN_SERVERS
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
        }: { kind: MediaKind; rtpParameters: RtpParameters; appData: Record<string, unknown> },
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
        const { error, id } = await network.request(MessageTypes.WebRTCProduceData, {
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
      const request = network.request
      const socket = network.socket
      if (MediaStreams.instance.camVideoProducer) {
        if (socket.connected === true && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: MediaStreams.instance.camVideoProducer.id
          })
        await MediaStreams.instance.camVideoProducer?.close()
      }

      if (MediaStreams.instance.camAudioProducer) {
        if (socket.connected === true && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: MediaStreams.instance.camAudioProducer.id
          })
        await MediaStreams.instance.camAudioProducer?.close()
      }

      if (MediaStreams.instance.screenVideoProducer) {
        if (socket.connected === true && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: MediaStreams.instance.screenVideoProducer.id
          })
        await MediaStreams.instance.screenVideoProducer?.close()
      }
      if (MediaStreams.instance.screenAudioProducer) {
        if (socket.connected === true && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: MediaStreams.instance.screenAudioProducer.id
          })
        await MediaStreams.instance.screenAudioProducer?.close()
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

export async function subscribeToTrack(network: SocketWebRTCClientNetwork, peerId: string, mediaTag: string) {
  const socket = network.socket
  if (!socket?.connected) return
  const channelConnectionState = accessMediaInstanceConnectionState()
  const currentChannelInstanceConnection = channelConnectionState.instances[network.hostId].ornull
  const channelType = currentChannelInstanceConnection.channelType.value
  const channelId = currentChannelInstanceConnection.channelId.value

  // ask the server to create a server-side consumer object and send us back the info we need to create a client-side consumer
  const consumerParameters = await network.request(MessageTypes.WebRTCReceiveTrack.toString(), {
    mediaTag,
    mediaPeerId: peerId,
    rtpCapabilities: network.mediasoupDevice.rtpCapabilities,
    channelType: channelType,
    channelId: channelId
  })

  // Only continue if we have a valid id
  if (consumerParameters?.id == null) return

  const consumer: ExtendedConsumer = await network.recvTransport.consume({
    ...consumerParameters,
    appData: { peerId, mediaTag, channelType },
    paused: true
  })

  consumer.producerPaused = consumerParameters.producerPaused

  // if we do already have a consumer, we shouldn't have called this method
  const existingConsumer = network.consumers?.find(
    (c) => c?.appData?.peerId === peerId && c?.appData?.mediaTag === mediaTag
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

  dispatchAction(MediaStreams.actions.triggerUpdateConsumers({}))
}

export async function unsubscribeFromTrack(network: SocketWebRTCClientNetwork, peerId: any, mediaTag: any) {
  const consumer = network.consumers.find((c) => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag)
  await closeConsumer(network, consumer)
}

export async function pauseConsumer(network: SocketWebRTCClientNetwork, consumer: ExtendedConsumer) {
  await network.request(MessageTypes.WebRTCPauseConsumer.toString(), {
    consumerId: consumer.id
  })
  if (consumer && typeof consumer.pause === 'function')
    network.mediasoupOperationQueue.add({
      object: consumer,
      action: 'pause'
    })
}

export async function resumeConsumer(network: SocketWebRTCClientNetwork, consumer: ExtendedConsumer) {
  await network.request(MessageTypes.WebRTCResumeConsumer.toString(), {
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
  await network.request(MessageTypes.WebRTCPauseProducer.toString(), {
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
  await network.request(MessageTypes.WebRTCResumeProducer.toString(), {
    producerId: producer.id
  })
  if (producer && typeof producer.resume === 'function')
    network.mediasoupOperationQueue.add({
      object: producer,
      action: 'resume'
    })
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

export function leaveNetwork(network: SocketWebRTCClientNetwork, kicked?: boolean) {
  try {
    if (!network) return
    // Leaving a network should close all transports from the server side.
    // This will also destroy all the associated producers and consumers.
    // All we need to do on the client is null all references.
    network.close()

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
      network.consumers = []
      world.networks.delete(network.hostId)
      world._mediaHostId = null!
      dispatchAction(MediaInstanceConnectionAction.disconnect({ instanceId: network.hostId }))
    } else {
      NetworkPeerFunctions.destroyAllPeers(network, world)
      world.networks.delete(network.hostId)
      world._worldHostId = null!
      dispatchAction(LocationInstanceConnectionAction.disconnect({ instanceId: network.hostId }))
      dispatchAction(EngineActions.connectToWorld({ connectedWorld: false }))
      // if world has a media server connection
      if (world.mediaNetwork) {
        const mediaState = accessMediaInstanceConnectionState().instances[world.mediaNetwork.hostId].value
        if (mediaState.channelType === 'instance' && mediaState.connected) {
          leaveNetwork(world.mediaNetwork as SocketWebRTCClientNetwork)
        }
      }
    }
    removeActionsForTopic(network.hostId)
  } catch (err) {
    logger.error(err, 'Error with leave()')
  }
}

export const startScreenshare = async (network: SocketWebRTCClientNetwork) => {
  logger.info('Start screen share')

  // make sure we've joined the  and that we have a sending transport
  if (!network.sendTransport) network.sendTransport = await createTransport(network, 'send')

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

  const { error } = await network.request(MessageTypes.WebRTCCloseProducer.toString(), {
    producerId: MediaStreams.instance.screenVideoProducer.id
  })

  if (error) logger.error(error)

  await MediaStreams.instance.screenVideoProducer.close()
  MediaStreams.instance.screenVideoProducer = null

  if (MediaStreams.instance.screenAudioProducer) {
    const { error: screenAudioProducerError } = await network.request(MessageTypes.WebRTCCloseProducer.toString(), {
      producerId: MediaStreams.instance.screenAudioProducer.id
    })
    if (screenAudioProducerError) logger.error(screenAudioProducerError)

    await MediaStreams.instance.screenAudioProducer.close()
    MediaStreams.instance.screenAudioProducer = null
    MediaStreams.instance.setScreenShareAudioPaused(true)
  }

  MediaStreamService.updateScreenAudioState()
  MediaStreamService.updateScreenVideoState()
}
