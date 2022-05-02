import { Transport as MediaSoupTransport } from 'mediasoup-client/lib/types'

import { ChannelType } from '@xrengine/common/src/interfaces/Channel'
import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineService'
import { Network, TransportTypes } from '@xrengine/engine/src/networking/classes/Network'
import { PUBLIC_STUN_SERVERS } from '@xrengine/engine/src/networking/constants/STUNServers'
import { CAM_VIDEO_SIMULCAST_ENCODINGS } from '@xrengine/engine/src/networking/constants/VideoConstants'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { receiveJoinWorld } from '@xrengine/engine/src/networking/functions/receiveJoinWorld'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { updateNearbyAvatars } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { addActionReceptor, dispatchAction, removeActionReceptor } from '@xrengine/hyperflux'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'

import { LocationInstanceConnectionAction } from '../common/services/LocationInstanceConnectionService'
import {
  accessMediaInstanceConnectionState,
  MediaLocationInstanceConnectionAction
} from '../common/services/MediaInstanceConnectionService'
import { MediaStreamService } from '../media/services/MediaStreamService'
import { useDispatch } from '../store'
import { accessAuthState } from '../user/services/AuthService'
import { getSearchParamFromURL } from '../util/getSearchParamFromURL'
import { getMediaTransport, SocketWebRTCClientTransport } from './SocketWebRTCClientTransport'

export const getChannelTypeIdFromTransport = (networkTransport: SocketWebRTCClientTransport) => {
  const channelConnectionState = accessMediaInstanceConnectionState()
  const isWorldConnection = networkTransport.type === TransportTypes.world
  return {
    channelType: isWorldConnection ? 'instance' : channelConnectionState.channelType.value,
    channelId: isWorldConnection ? null : channelConnectionState.channelId.value
  }
}

export async function onConnectToInstance(networkTransport: SocketWebRTCClientTransport) {
  const dispatch = useDispatch()

  const isWorldConnection = networkTransport.type === TransportTypes.world
  console.log('onConnectToInstance', networkTransport.type)

  if (isWorldConnection) {
    dispatch(LocationInstanceConnectionAction.instanceServerConnected())
    dispatchAction(Engine.instance.store, SocketWebRTCClientTransport.actions.worldInstanceReconnected())
  } else {
    dispatch(MediaLocationInstanceConnectionAction.serverConnected())
    dispatchAction(Engine.instance.store, SocketWebRTCClientTransport.actions.mediaInstanceReconnected())
  }

  const authState = accessAuthState()
  const token = authState.authUser.accessToken.value
  const payload = { accessToken: token }

  const { success } = await new Promise<any>((resolve) => {
    const interval = setInterval(async () => {
      const response = await networkTransport.request(MessageTypes.Authorization.toString(), payload)
      clearInterval(interval)
      resolve(response)
    }, 1000)
  })

  if (!success) return console.error('Unable to connect with credentials')

  let ConnectToWorldResponse
  try {
    ConnectToWorldResponse = await Promise.race([
      await networkTransport.request(MessageTypes.ConnectToWorld.toString()),
      new Promise((resolve, reject) => {
        setTimeout(() => !ConnectToWorldResponse && reject(new Error('Connect timed out')), 10000)
      })
    ])
  } catch (err) {
    console.log(err)
    dispatchAction(Engine.instance.store, EngineActions.connectToWorldTimeout({ instance: true }))
    return
  }

  if (!ConnectToWorldResponse) {
    dispatchAction(Engine.instance.store, EngineActions.connectToWorldTimeout({ instance: true }))
    return
  }
  const { routerRtpCapabilities } = ConnectToWorldResponse as any
  dispatchAction(Engine.instance.store, EngineActions.connectToWorld({ connectedWorld: true }))

  if (networkTransport.mediasoupDevice.loaded !== true)
    await networkTransport.mediasoupDevice.load({ routerRtpCapabilities })

  // use sendBeacon to tell the server we're disconnecting when
  // the page unloads
  window.addEventListener('unload', async () => {
    // TODO: Handle this as a full disconnect
    networkTransport.socket.emit(MessageTypes.LeaveWorld.toString())
  })

  networkTransport.socket.on(MessageTypes.Kick.toString(), async (message) => {
    // console.log("TODO: SNACKBAR HERE");
    await endVideoChat(networkTransport, { endConsumers: true })
    await leave(networkTransport, true)
    dispatchAction(Engine.instance.store, SocketWebRTCClientTransport.actions.worldInstanceKicked({ message }))
    console.log('Client has been kicked from the world')
  })

  if (isWorldConnection) await onConnectToWorldInstance(networkTransport)
  else await onConnectToMediaInstance(networkTransport)
}

export async function onConnectToWorldInstance(networkTransport: SocketWebRTCClientTransport) {
  function actionDataHandler(message) {
    if (!message) return
    const actions = message as any as Required<Action<any>>[]
    // const actions = decode(new Uint8Array(message)) as IncomingActionType[]
    for (const a of actions) {
      Engine.instance.currentWorld!.store.actions.incoming.push(a)
    }
  }

  async function consumeDataHandler(options) {
    console.log('WebRTCConsumeData', options)
    const dataConsumer = await networkTransport.recvTransport.consumeData(options)

    // Firefox uses blob as by default hence have to convert binary type of data consumer to 'arraybuffer' explicitly.
    dataConsumer.binaryType = 'arraybuffer'
    Network.instance.dataConsumers.set(options.dataProducerId, dataConsumer)

    dataConsumer.on('message', (message: any) => {
      try {
        Network.instance.incomingMessageQueueUnreliable.add(message)
        Network.instance.incomingMessageQueueUnreliableIDs.add(options.dataProducerId)
      } catch (error) {
        console.warn('Error handling data from consumer:')
        console.warn(error)
      }
    }) // Handle message received
    dataConsumer.on('close', () => {
      dataConsumer.close()
      Network.instance.dataConsumers.delete(options.dataProducerId)
    })
  }

  async function updateNearbyLayerUsersHandler(action) {
    matches(action).when(MediaStreams.actions.updateNearbyLayerUsers.matches, async () => {
      const { userIds } = await networkTransport.request(MessageTypes.WebRTCRequestNearbyUsers.toString())
      dispatchAction(Engine.instance.store, MediaStreams.actions.triggerRequestCurrentProducers({ userIds }))
    })
  }

  networkTransport.socket.on('disconnect', async () => {
    dispatchAction(Engine.instance.store, SocketWebRTCClientTransport.actions.worldInstanceDisconnected())
    networkTransport.reconnecting = true
    networkTransport.socket.off(MessageTypes.ActionData.toString(), actionDataHandler)

    // Get information for how to consume data from server and init a data consumer
    networkTransport.socket.off(MessageTypes.WebRTCConsumeData.toString(), consumeDataHandler)

    removeActionReceptor(Engine.instance.store, updateNearbyLayerUsersHandler)
  })
  networkTransport.socket.io.on('reconnect', async () => {
    dispatchAction(Engine.instance.store, SocketWebRTCClientTransport.actions.worldInstanceReconnected())
    networkTransport.reconnecting = false
    await onConnectToInstance(networkTransport)
    const transportRequestData = {
      inviteCode: getSearchParamFromURL('inviteCode')!
    }
    await networkTransport.request(MessageTypes.JoinWorld.toString(), transportRequestData).then(receiveJoinWorld)
  })

  networkTransport.socket.on(MessageTypes.ActionData.toString(), actionDataHandler)

  // Get information for how to consume data from server and init a data consumer
  networkTransport.socket.on(MessageTypes.WebRTCConsumeData.toString(), consumeDataHandler)

  addActionReceptor(Engine.instance.store, updateNearbyLayerUsersHandler)
  await Promise.all([initSendTransport(networkTransport), initReceiveTransport(networkTransport)])
  await createDataProducer(networkTransport, 'instance')
}

export async function onConnectToMediaInstance(networkTransport: SocketWebRTCClientTransport) {
  async function webRTCPauseConsumerHandler(consumerId) {
    if (MediaStreams.instance) {
      const consumer = MediaStreams.instance.consumers.find((c) => c.id === consumerId)
      consumer?.pause()
    }
  }

  async function webRTCResumeConsumerHandler(consumerId) {
    if (MediaStreams.instance) {
      const consumer = MediaStreams.instance.consumers.find((c) => c.id === consumerId)
      consumer?.resume()
    }
  }

  async function webRTCCloseConsumerHandler(consumerId) {
    if (MediaStreams.instance)
      MediaStreams.instance.consumers = MediaStreams.instance.consumers.filter((c) => c.id !== consumerId)
    dispatchAction(Engine.instance.store, MediaStreams.actions.triggerUpdateConsumers())
  }

  async function webRTCCreateProducerHandler(socketId, mediaTag, producerId, channelType: ChannelType, channelId) {
    const selfProducerIds = [MediaStreams.instance?.camVideoProducer?.id, MediaStreams.instance?.camAudioProducer?.id]
    const channelConnectionState = accessMediaInstanceConnectionState()
    if (
      producerId != null &&
      // channelType === self.channelType &&
      selfProducerIds.indexOf(producerId) < 0 &&
      // (MediaStreams.instance?.consumers?.find(
      //   c => c?.appData?.peerId === socketId && c?.appData?.mediaTag === mediaTag
      // ) == null /*&&
      (channelType === 'instance'
        ? channelConnectionState.channelType.value === 'instance'
        : channelConnectionState.channelType.value === channelType &&
          channelConnectionState.channelId.value === channelId)
    ) {
      // that we don't already have consumers for...
      await subscribeToTrack(networkTransport as SocketWebRTCClientTransport, socketId, mediaTag)
    }
  }

  async function consumerHandler(action) {
    matches(action)
      .when(MediaStreams.actions.closeConsumer.matches, ({ consumer }) => {
        closeConsumer(networkTransport, consumer)
      })
      .when(MediaStreams.actions.triggerRequestCurrentProducers.matches, async ({ userIds }) => {
        await networkTransport.request(MessageTypes.WebRTCRequestCurrentProducers.toString(), {
          userIds: userIds || [],
          channelType: channelConnectionState.channelType.value,
          channelId: channelConnectionState.channelId.value
        })
        MediaStreamService.triggerUpdateNearbyLayerUsers()
      })
  }

  const channelConnectionState = accessMediaInstanceConnectionState()
  networkTransport.socket.on('disconnect', async () => {
    dispatchAction(Engine.instance.store, SocketWebRTCClientTransport.actions.mediaInstanceDisconnected())
    networkTransport.reconnecting = true

    networkTransport.socket.off(MessageTypes.WebRTCPauseConsumer.toString(), webRTCPauseConsumerHandler)

    networkTransport.socket.off(MessageTypes.WebRTCResumeConsumer.toString(), webRTCResumeConsumerHandler)

    networkTransport.socket.off(MessageTypes.WebRTCCloseConsumer.toString(), webRTCCloseConsumerHandler)

    removeActionReceptor(Engine.instance.store, consumerHandler)
  })

  networkTransport.socket.on(MessageTypes.WebRTCCreateProducer.toString(), webRTCCreateProducerHandler)

  networkTransport.socket.io.on('reconnect', async () => {
    dispatchAction(Engine.instance.store, SocketWebRTCClientTransport.actions.mediaInstanceReconnected())
    networkTransport.reconnecting = false
    await onConnectToInstance(networkTransport)
    await updateNearbyAvatars()
    const mediaTransport = getMediaTransport()
    const request = networkTransport.request
    const socket = networkTransport.socket
    if (MediaStreams.instance.videoStream) {
      if (MediaStreams.instance?.camVideoProducer != null) {
        if (socket.connected === true && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: MediaStreams.instance?.camVideoProducer.id
          })
        await MediaStreams.instance?.camVideoProducer?.close()
        await configureMediaTransports(mediaTransport, ['video'])
        await createCamVideoProducer(mediaTransport)
      }
      MediaStreamService.updateCamVideoState()
    }
    if (MediaStreams.instance.audioStream) {
      if (MediaStreams.instance?.camAudioProducer != null) {
        if (socket.connected === true && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: MediaStreams.instance?.camAudioProducer.id
          })
        await MediaStreams.instance?.camAudioProducer?.close()
        await configureMediaTransports(mediaTransport, ['audio'])
        await createCamAudioProducer(mediaTransport)
      }
      MediaStreamService.updateCamAudioState()
    }
    // if (MediaStreams.instance.screenVideoProducer) {
    //   if (socket.connected === true && typeof request === 'function')
    //     await request(MessageTypes.WebRTCCloseProducer.toString(), {
    //       producerId: MediaStreams.instance.screenVideoProducer.id
    //     })
    //   await MediaStreams.instance.screenVideoProducer?.close()
    // }
    // if (MediaStreams.instance.screenAudioProducer) {
    //   if (socket.connected === true && typeof request === 'function')
    //     await request(MessageTypes.WebRTCCloseProducer.toString(), {
    //       producerId: MediaStreams.instance.screenAudioProducer.id
    //     })
    //   await MediaStreams.instance.screenAudioProducer?.close()
    // }
  })

  networkTransport.socket.on(MessageTypes.WebRTCPauseConsumer.toString(), webRTCPauseConsumerHandler)
  networkTransport.socket.on(MessageTypes.WebRTCResumeConsumer.toString(), webRTCResumeConsumerHandler)
  networkTransport.socket.on(MessageTypes.WebRTCCloseConsumer.toString(), webRTCCloseConsumerHandler)

  addActionReceptor(Engine.instance.store, consumerHandler)

  await initRouter(networkTransport)
  await Promise.all([initSendTransport(networkTransport), initReceiveTransport(networkTransport)])
}

export async function createDataProducer(
  networkTransport: SocketWebRTCClientTransport,
  channelType: ChannelType,
  type = 'raw',
  customInitInfo: any = {}
): Promise<void> {
  const sendTransport = networkTransport.sendTransport
  // else if (MediaStreams.instance.dataProducers.get(channel)) return Promise.reject(new Error('Data channel already exists!'))
  const dataProducer = await sendTransport.produceData({
    appData: { data: customInitInfo },
    ordered: false,
    label: channelType,
    maxPacketLifeTime: 3000,
    // maxRetransmits: 3,
    protocol: type // sub-protocol for type of data to be transmitted on the channel e.g. json, raw etc. maybe make type an enum rather than string
  })
  // dataProducer.on("open", () => {
  //     networkTransport.dataProducer.send(JSON.stringify({ info: 'init' }));
  // });
  dataProducer.on('transportclose', () => {
    networkTransport.dataProducer?.close()
  })
  networkTransport.dataProducer = dataProducer
}
// utility function to create a transport and hook up signaling logic
// appropriate to the transport's direction

export async function createTransport(networkTransport: SocketWebRTCClientTransport, direction: string) {
  const request = networkTransport.request
  if (request === null) return null!
  const { channelId, channelType } = getChannelTypeIdFromTransport(networkTransport)

  // ask the server to create a server-side transport object and send
  // us back the info we need to create a client-side transport
  let transport: MediaSoupTransport

  // console.log('Requesting transport creation', direction, channelType, channelId)

  const { transportOptions } = await networkTransport.request(MessageTypes.WebRTCTransportCreate.toString(), {
    direction,
    sctpCapabilities: networkTransport.mediasoupDevice.sctpCapabilities,
    channelType: channelType,
    channelId: channelId
  })

  if (process.env.NODE_ENV === 'production') transportOptions.iceServers = PUBLIC_STUN_SERVERS
  if (direction === 'recv') transport = await networkTransport.mediasoupDevice.createRecvTransport(transportOptions)
  else if (direction === 'send')
    transport = await networkTransport.mediasoupDevice.createSendTransport(transportOptions)
  else throw new Error(`bad transport 'direction': ${direction}`)

  // mediasoup-client will emit a connect event when media needs to
  // start flowing for the first time. send dtlsParameters to the
  // server, then call callback() on success or errback() on failure.
  transport.on('connect', async ({ dtlsParameters }: any, callback: () => void, errback: () => void) => {
    // console.log('\n\n\n\nWebRTCTransportConnect', direction, dtlsParameters, transportOptions, '\n\n\n')
    const connectResult = await networkTransport.request(MessageTypes.WebRTCTransportConnect.toString(), {
      transportId: transportOptions.id,
      dtlsParameters
    })

    if (connectResult.error) {
      console.log('Transport connect error')
      console.log(connectResult.error)
      return errback()
    }

    callback()
  })

  if (direction === 'send') {
    transport.on(
      'produce',
      async ({ kind, rtpParameters, appData }: any, callback: (arg0: { id: any }) => void, errback: () => void) => {
        let paused = false
        if (appData.mediaTag === 'cam-video') paused = MediaStreams.instance.videoPaused
        else if (appData.mediaTag === 'cam-audio') paused = MediaStreams.instance.audioPaused

        // tell the server what it needs to know from us in order to set
        // up a server-side producer object, and get back a
        // producer.id. call callback() on success or errback() on
        // failure.
        const { error, id } = await networkTransport.request(MessageTypes.WebRTCSendTrack.toString(), {
          transportId: transportOptions.id,
          kind,
          rtpParameters,
          paused,
          appData
        })
        if (error) {
          errback()
          console.log(error)
          return
        }
        callback({ id })
      }
    )

    transport.on('producedata', async (parameters: any, callback: (arg0: { id: any }) => void, errback: () => void) => {
      const { sctpStreamParameters, label, protocol, appData } = parameters
      const { error, id } = await networkTransport.request(MessageTypes.WebRTCProduceData, {
        transportId: transport.id,
        sctpStreamParameters,
        label,
        protocol,
        appData
      })

      if (error) {
        console.log(error)
        errback()
        return
      }

      return callback({ id })
    })
  }

  // any time a transport transitions to closed,
  // failed, or disconnected, leave the  and reset
  transport.on('connectionstatechange', async (state: string) => {
    if (!networkTransport.leaving && (state === 'closed' || state === 'failed' || state === 'disconnected')) {
      dispatchAction(
        Engine.instance.store,
        networkTransport.type === 'world'
          ? SocketWebRTCClientTransport.actions.worldInstanceDisconnected()
          : SocketWebRTCClientTransport.actions.mediaInstanceDisconnected()
      )
      console.error('Transport', transport, ' transitioned to state', state)
      console.error(
        'If this occurred unexpectedly shortly after joining a world, check that the gameserver nodegroup has public IP addresses.'
      )
      console.log('Waiting 5 seconds to make a new transport')
      setTimeout(async () => {
        console.log(
          'Re-creating transport',
          direction,
          channelType,
          channelId,
          ' after unexpected closing/fail/disconnect'
        )
        await createTransport(networkTransport, direction)
        console.log('Re-created transport', direction, channelType, channelId)
        dispatchAction(
          Engine.instance.store,
          networkTransport.type === 'world'
            ? SocketWebRTCClientTransport.actions.worldInstanceReconnected()
            : SocketWebRTCClientTransport.actions.mediaInstanceReconnected()
        )
      }, 5000)
      // await request(MessageTypes.WebRTCTransportClose.toString(), {transportId: transport.id});
    }
    // if (networkTransport.leaving !== true && state === 'connected' && transport.direction === 'recv') {
    //   console.log('requesting current producers for', channelType, channelId)
    //   await request(MessageTypes.WebRTCRequestCurrentProducers.toString(), {
    //     channelType: channelType,
    //     channelId: channelId
    //   })
    // }
  })
  ;(transport as any).channelType = channelType
  ;(transport as any).channelId = channelId

  return transport
}

export async function initReceiveTransport(networkTransport: SocketWebRTCClientTransport): Promise<void> {
  networkTransport.recvTransport = await createTransport(networkTransport, 'recv')
}

export async function initSendTransport(networkTransport: SocketWebRTCClientTransport): Promise<void> {
  networkTransport.sendTransport = await createTransport(networkTransport, 'send')
}

export async function initRouter(networkTransport: SocketWebRTCClientTransport): Promise<void> {
  const { channelId, channelType } = getChannelTypeIdFromTransport(networkTransport)
  await networkTransport.request(MessageTypes.InitializeRouter.toString(), {
    channelType,
    channelId
  })
}

export async function configureMediaTransports(
  networkTransport: SocketWebRTCClientTransport | null,
  mediaTypes: string[]
): Promise<boolean> {
  if (
    mediaTypes.indexOf('video') > -1 &&
    (MediaStreams.instance.videoStream == null || !MediaStreams.instance.videoStream.active)
  ) {
    await MediaStreams.instance.startCamera()

    if (MediaStreams.instance.videoStream == null) {
      console.warn('Video stream is null, camera must have failed or be missing')
      return false
    }
  }

  if (
    mediaTypes.indexOf('audio') > -1 &&
    (MediaStreams.instance.audioStream == null || !MediaStreams.instance.audioStream.active)
  ) {
    await MediaStreams.instance.startMic()

    if (MediaStreams.instance.audioStream == null) {
      console.warn('Audio stream is null, mic must have failed or be missing')
      return false
    }
  }

  //This probably isn't needed anymore with channels handling all audio and video, but left it in and commented
  //just in case.
  // if (
  //   networkTransport.sendTransport == null ||
  //     networkTransport.sendTransport.closed === true ||
  //     networkTransport.sendTransport.connectionState === 'disconnected'
  // ) {
  //   await initRouter(networkTransport)
  //   await Promise.all([initSendTransport(networkTransport), initReceiveTransport(networkTransport)])
  // }
  return true
}

export async function createCamVideoProducer(networkTransport: SocketWebRTCClientTransport): Promise<void> {
  const channelConnectionState = accessMediaInstanceConnectionState()
  const channelType = channelConnectionState.channelType.value
  const channelId = channelConnectionState.channelId.value
  if (MediaStreams.instance.videoStream !== null && channelConnectionState.videoEnabled.value === true) {
    if (networkTransport.sendTransport == null) {
      await new Promise((resolve) => {
        const waitForTransportReadyInterval = setInterval(() => {
          if (networkTransport.sendTransport) {
            clearInterval(waitForTransportReadyInterval)
            resolve(true)
          }
        }, 100)
      })
    }

    const transport = networkTransport.sendTransport
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
      if (MediaStreams.instance.videoPaused) await MediaStreams.instance?.camVideoProducer.pause()
      else
        (await MediaStreams.instance.camVideoProducer) &&
          (await resumeProducer(networkTransport, MediaStreams.instance.camVideoProducer))
    } catch (err) {
      console.log('error producing video', err)
    }
  }
}

export async function createCamAudioProducer(networkTransport: SocketWebRTCClientTransport): Promise<void> {
  const channelConnectionState = accessMediaInstanceConnectionState()
  const channelType = channelConnectionState.channelType.value
  const channelId = channelConnectionState.channelId.value
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
    MediaStreams.instance.audioGainNode = gainNode
    MediaStreams.instance.audioStream.removeTrack(audioTrack)
    MediaStreams.instance.audioStream.addTrack(dst.stream.getAudioTracks()[0])
    // same thing for audio, but we can use our already-created

    if (networkTransport.sendTransport == null) {
      await new Promise((resolve) => {
        const waitForTransportReadyInterval = setInterval(() => {
          if (networkTransport.sendTransport) {
            clearInterval(waitForTransportReadyInterval)
            resolve(true)
          }
        }, 100)
      })
    }

    const transport = networkTransport.sendTransport
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

      if (MediaStreams.instance.audioPaused) MediaStreams.instance?.camAudioProducer.pause()
      else
        (await MediaStreams.instance.camAudioProducer) &&
          resumeProducer(networkTransport, MediaStreams.instance.camAudioProducer)
    } catch (err) {
      console.log('error producing audio', err)
    }
  }
}

export async function endVideoChat(
  networkTransport: SocketWebRTCClientTransport | null,
  options: { leftParty?: boolean; endConsumers?: boolean }
): Promise<boolean> {
  if (networkTransport) {
    try {
      const request = networkTransport.request
      const socket = networkTransport.socket
      if (MediaStreams.instance?.camVideoProducer) {
        if (socket.connected === true && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: MediaStreams.instance?.camVideoProducer.id
          })
        await MediaStreams.instance?.camVideoProducer?.close()
      }

      if (MediaStreams.instance?.camAudioProducer) {
        if (socket.connected === true && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: MediaStreams.instance?.camAudioProducer.id
          })
        await MediaStreams.instance?.camAudioProducer?.close()
      }

      if (MediaStreams.instance?.screenVideoProducer) {
        if (socket.connected === true && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: MediaStreams.instance.screenVideoProducer.id
          })
        await MediaStreams.instance.screenVideoProducer?.close()
      }
      if (MediaStreams.instance?.screenAudioProducer) {
        if (socket.connected === true && typeof request === 'function')
          await request(MessageTypes.WebRTCCloseProducer.toString(), {
            producerId: MediaStreams.instance.screenAudioProducer.id
          })
        await MediaStreams.instance.screenAudioProducer?.close()
      }

      if (options?.endConsumers === true) {
        MediaStreams.instance?.consumers.map(async (c) => {
          if (request && typeof request === 'function')
            await request(MessageTypes.WebRTCCloseConsumer.toString(), {
              consumerId: c.id
            })
          await c.close()
        })
      }

      if (networkTransport.recvTransport?.closed !== true) await networkTransport.recvTransport.close()
      if (networkTransport.sendTransport?.closed !== true) await networkTransport.sendTransport.close()

      resetProducer()
      return true
    } catch (err) {
      console.log('EndvideoChat error')
      console.log(err)
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
    MediaStreams.instance.localScreen = null
    // MediaStreams.instance.instance?.consumers = [];
  }
}

export async function subscribeToTrack(
  networkTransport: SocketWebRTCClientTransport,
  peerId: string,
  mediaTag: string
) {
  const socket = networkTransport.socket
  if (!socket?.connected) return
  const channelConnectionState = accessMediaInstanceConnectionState()
  const channelType = channelConnectionState.channelType.value
  const channelId = channelConnectionState.channelId.value
  // if we do already have a consumer, we shouldn't have called this method
  let consumer = MediaStreams.instance?.consumers.find(
    (c: any) => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag
  )

  // ask the server to create a server-side consumer object and send us back the info we need to create a client-side consumer
  const consumerParameters = await networkTransport.request(MessageTypes.WebRTCReceiveTrack.toString(), {
    mediaTag,
    mediaPeerId: peerId,
    rtpCapabilities: networkTransport.mediasoupDevice.rtpCapabilities,
    channelType: channelType,
    channelId: channelId
  })

  // Only continue if we have a valid id
  if (consumerParameters?.id == null) return

  consumer = await networkTransport.recvTransport.consume({
    ...consumerParameters,
    appData: { peerId, mediaTag, channelType },
    paused: true
  })

  const existingConsumer = MediaStreams.instance?.consumers?.find(
    (c) => c?.appData?.peerId === peerId && c?.appData?.mediaTag === mediaTag
  )
  if (existingConsumer == null) {
    MediaStreams.instance?.consumers.push(consumer)
    dispatchAction(Engine.instance.store, MediaStreams.actions.triggerUpdateConsumers())
    MediaStreamService.triggerUpdateNearbyLayerUsers()

    // okay, we're ready. let's ask the peer to send us media
    await resumeConsumer(networkTransport, consumer)
  } else if (existingConsumer?._track?.muted) {
    await closeConsumer(networkTransport, existingConsumer)
    console.log('consumers before splice', MediaStreams.instance?.consumers)
    // MediaStreams.instance?.consumers.splice(existingConsumerIndex, 0, consumer) // existingConsumerIndex is undefined...
    console.log('consumers after splice', MediaStreams.instance?.consumers)
    dispatchAction(Engine.instance.store, MediaStreams.actions.triggerUpdateConsumers())
    MediaStreamService.triggerUpdateNearbyLayerUsers()

    // okay, we're ready. let's ask the peer to send us media
    await resumeConsumer(networkTransport, consumer)
  } else await closeConsumer(networkTransport, consumer)
}

export async function unsubscribeFromTrack(transport: SocketWebRTCClientTransport, peerId: any, mediaTag: any) {
  const consumer = MediaStreams.instance?.consumers.find(
    (c) => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag
  )
  await closeConsumer(transport, consumer)
}

export async function pauseConsumer(
  transport: SocketWebRTCClientTransport,
  consumer: { appData: { peerId: any; mediaTag: any }; id: any; pause: () => any }
) {
  await transport.request(MessageTypes.WebRTCPauseConsumer.toString(), {
    consumerId: consumer.id
  })
  if (consumer && typeof consumer.pause === 'function')
    Network.instance.mediasoupOperationQueue.add({
      object: consumer,
      action: 'pause'
    })
}

export async function resumeConsumer(
  transport: SocketWebRTCClientTransport,
  consumer: {
    appData: { peerId: any; mediaTag: any }
    id: any
    resume: () => any
  }
) {
  await transport.request(MessageTypes.WebRTCResumeConsumer.toString(), {
    consumerId: consumer.id
  })
  if (consumer && typeof consumer.resume === 'function')
    Network.instance.mediasoupOperationQueue.add({
      object: consumer,
      action: 'resume'
    })
}

export async function pauseProducer(
  transport: SocketWebRTCClientTransport,
  producer: { appData: { mediaTag: any }; id: any; pause: () => any }
) {
  await transport.request(MessageTypes.WebRTCPauseProducer.toString(), {
    producerId: producer.id
  })
  if (producer && typeof producer.pause === 'function')
    Network.instance.mediasoupOperationQueue.add({
      object: producer,
      action: 'pause'
    })
}

export async function resumeProducer(
  transport: SocketWebRTCClientTransport,
  producer: { appData: { mediaTag: any }; id: any; resume: () => any }
) {
  await transport.request(MessageTypes.WebRTCResumeProducer.toString(), {
    producerId: producer.id
  })
  if (producer && typeof producer.resume === 'function')
    Network.instance.mediasoupOperationQueue.add({
      object: producer,
      action: 'resume'
    })
}

export async function globalMuteProducer(transport: SocketWebRTCClientTransport, producer: { id: any }) {
  await transport.request(MessageTypes.WebRTCPauseProducer.toString(), {
    producerId: producer.id,
    globalMute: true
  })
}

export async function globalUnmuteProducer(transport: SocketWebRTCClientTransport, producer: { id: any }) {
  await transport.request(MessageTypes.WebRTCResumeProducer.toString(), {
    producerId: producer.id
  })
}

export async function closeConsumer(transport: SocketWebRTCClientTransport, consumer: any) {
  await transport.request(MessageTypes.WebRTCCloseConsumer.toString(), {
    consumerId: consumer.id
  })
  await consumer?.close()

  MediaStreams.instance.consumers = MediaStreams.instance?.consumers.filter(
    (c: any) => !(c.id === consumer.id)
  ) as any[]
}

export async function leave(networkTransport: SocketWebRTCClientTransport, kicked?: boolean) {
  try {
    networkTransport.leaving = true
    const socket = networkTransport.socket
    if (kicked !== true && socket.connected === true) {
      // close everything on the server-side (transports, producers, consumers)
      const result = await Promise.race([
        await networkTransport.request(MessageTypes.LeaveWorld.toString()),
        new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error('Connect timed out')), 10000)
        })
      ])
      if (result?.error) console.error(result.error)
      dispatchAction(Engine.instance.store, EngineActions.leaveWorld())
    }

    networkTransport.leaving = false
    networkTransport.left = true

    //Leaving the world should close all transports from the server side.
    //This will also destroy all the associated producers and consumers.
    //All we need to do on the client is null all references.
    networkTransport.close()

    if (networkTransport.type === TransportTypes.media) {
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
      MediaStreams.instance.localScreen = null
      MediaStreams.instance.consumers = []
    }
  } catch (err) {
    console.log('Error with leave()')
    console.log(err)
    networkTransport.leaving = false
  }
}

// TODO: currently unused - reimplement
export const startScreenshare = async (networkTransport: SocketWebRTCClientTransport) => {
  console.log('start screen share')

  // make sure we've joined the  and that we have a sending transport
  if (!networkTransport.sendTransport) networkTransport.sendTransport = await createTransport(networkTransport, 'send')

  // get a screen share track
  MediaStreams.instance.localScreen = await (navigator.mediaDevices as any).getDisplayMedia({
    video: true,
    audio: true
  })

  // create a producer for video
  MediaStreams.instance.screenVideoProducer = await networkTransport.sendTransport.produce({
    track: MediaStreams.instance.localScreen.getVideoTracks()[0],
    encodings: [], // TODO: Add me
    appData: { mediaTag: 'screen-video' }
  })

  // create a producer for audio, if we have it
  if (MediaStreams.instance.localScreen.getAudioTracks().length) {
    MediaStreams.instance.screenAudioProducer = await networkTransport.sendTransport.produce({
      track: MediaStreams.instance.localScreen.getAudioTracks()[0],
      appData: { mediaTag: 'screen-audio' }
    })
  }

  // handler for screen share stopped event (triggered by the
  // browser's built-in screen sharing ui)
  MediaStreams.instance.screenVideoProducer.track.onended = async () => {
    console.log('screen share stopped')
    await MediaStreams.instance.screenVideoProducer.pause()

    const { error } = await networkTransport.request(MessageTypes.WebRTCCloseProducer.toString(), {
      producerId: MediaStreams.instance.screenVideoProducer.id
    })

    await MediaStreams.instance.screenVideoProducer.close()
    MediaStreams.instance.screenVideoProducer = null
    if (MediaStreams.instance.screenAudioProducer) {
      const { error: screenAudioProducerError } = await networkTransport.request(
        MessageTypes.WebRTCCloseProducer.toString(),
        {
          producerId: MediaStreams.instance.screenAudioProducer.id
        }
      )

      await MediaStreams.instance.screenAudioProducer.close()
      MediaStreams.instance.screenAudioProducer = null
    }
  }
  return true
}
