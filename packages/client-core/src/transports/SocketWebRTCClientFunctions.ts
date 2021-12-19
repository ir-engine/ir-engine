import { CAM_VIDEO_SIMULCAST_ENCODINGS } from '@xrengine/engine/src/networking/constants/VideoConstants'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { DataProducer, Transport as MediaSoupTransport } from 'mediasoup-client/lib/types'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { SocketWebRTCClientTransport } from './SocketWebRTCClientTransport'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineService'

let networkTransport: SocketWebRTCClientTransport

export async function createDataProducer(channel = 'default', type = 'raw', customInitInfo: any = {}): Promise<void> {
  networkTransport = Network.instance.transport as SocketWebRTCClientTransport
  const sendTransport =
    channel === 'instance' ? networkTransport.instanceSendTransport : networkTransport.channelSendTransport
  // else if (MediaStreams.instance.dataProducers.get(channel)) return Promise.reject(new Error('Data channel already exists!'))
  const dataProducer = await sendTransport.produceData({
    appData: { data: customInitInfo },
    ordered: false,
    label: channel,
    maxPacketLifeTime: 3000,
    // maxRetransmits: 3,
    protocol: type // sub-protocol for type of data to be transmitted on the channel e.g. json, raw etc. maybe make type an enum rather than string
  })
  // dataProducer.on("open", () => {
  //     networkTransport.dataProducer.send(JSON.stringify({ info: 'init' }));
  // });
  dataProducer.on('transportclose', () => {
    if (channel === 'instance') networkTransport.instanceDataProducer?.close()
    else networkTransport.channelDataProducer?.close()
  })
  if (channel === 'instance') networkTransport.instanceDataProducer = dataProducer
  else networkTransport.channelDataProducer = dataProducer
}
// utility function to create a transport and hook up signaling logic
// appropriate to the transport's direction

export async function createTransport(direction: string, channelType?: string, channelId?: string) {
  networkTransport = Network.instance.transport as SocketWebRTCClientTransport
  const request =
    channelType === 'instance' && channelId == null ? networkTransport.instanceRequest : networkTransport.channelRequest

  // ask the server to create a server-side transport object and send
  // us back the info we need to create a client-side transport
  let transport

  console.log('Requesting transport creation', direction, channelType, channelId)
  if (request != null) {
    const { transportOptions } = await request(MessageTypes.WebRTCTransportCreate.toString(), {
      direction,
      sctpCapabilities: networkTransport.mediasoupDevice.sctpCapabilities,
      channelType: channelType,
      channelId: channelId
    })

    if (direction === 'recv') transport = await networkTransport.mediasoupDevice.createRecvTransport(transportOptions)
    else if (direction === 'send')
      transport = await networkTransport.mediasoupDevice.createSendTransport(transportOptions)
    else throw new Error(`bad transport 'direction': ${direction}`)

    // mediasoup-client will emit a connect event when media needs to
    // start flowing for the first time. send dtlsParameters to the
    // server, then call callback() on success or errback() on failure.
    transport.on('connect', async ({ dtlsParameters }: any, callback: () => void, errback: () => void) => {
      console.log('connect', dtlsParameters, transportOptions)
      const connectResult = await request(MessageTypes.WebRTCTransportConnect.toString(), {
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
          const { error, id } = await request(MessageTypes.WebRTCSendTrack.toString(), {
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

      transport.on(
        'producedata',
        async (parameters: any, callback: (arg0: { id: any }) => void, errback: () => void) => {
          const { sctpStreamParameters, label, protocol, appData } = parameters
          const { error, id } = await request(MessageTypes.WebRTCProduceData, {
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
        }
      )
    }

    // any time a transport transitions to closed,
    // failed, or disconnected, leave the  and reset
    transport.on('connectionstatechange', async (state: string) => {
      if (networkTransport.leaving !== true && (state === 'closed' || state === 'failed' || state === 'disconnected')) {
        EngineEvents.instance.dispatchEvent({ type: SocketWebRTCClientTransport.EVENTS.INSTANCE_DISCONNECTED })
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
          await createTransport(direction, channelType, channelId)
          console.log('Re-created transport', direction, channelType, channelId)
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

    transport.channelType = channelType
    transport.channelId = channelId
    return Promise.resolve(transport)
  } else return Promise.resolve()
}

export async function initReceiveTransport(
  channelType: string,
  channelId?: string
): Promise<MediaSoupTransport | Error> {
  networkTransport = Network.instance.transport as any
  let newTransport
  if (channelType === 'instance' && channelId == null)
    newTransport = networkTransport.instanceRecvTransport = await createTransport('recv', channelType)
  else newTransport = networkTransport.channelRecvTransport = await createTransport('recv', channelType, channelId)
  return Promise.resolve(newTransport)
}

export async function initSendTransport(channelType: string, channelId?: string): Promise<MediaSoupTransport | Error> {
  networkTransport = Network.instance.transport as any
  let newTransport
  if (channelType === 'instance' && channelId == null)
    newTransport = networkTransport.instanceSendTransport = await createTransport('send', channelType)
  else newTransport = networkTransport.channelSendTransport = await createTransport('send', channelType, channelId)

  return Promise.resolve(newTransport)
}

export async function initRouter(channelType: string, channelId?: string): Promise<void> {
  networkTransport = Network.instance.transport as any
  const request = networkTransport.channelRequest
  await request(MessageTypes.InitializeRouter.toString(), {
    channelType: channelType,
    channelId: channelId
  })
  return Promise.resolve()
}

export async function configureMediaTransports(
  mediaTypes: string[],
  channelType: string,
  channelId?: string
): Promise<boolean> {
  networkTransport = Network.instance.transport as any
  if (mediaTypes.indexOf('video') > -1 && MediaStreams.instance.videoStream == null) {
    await MediaStreams.instance.startCamera()

    if (MediaStreams.instance.videoStream == null) {
      console.warn('Video stream is null, camera must have failed or be missing')
      return false
    }
  }

  if (mediaTypes.indexOf('audio') > -1 && MediaStreams.instance.audioStream == null) {
    await MediaStreams.instance.startMic()

    if (MediaStreams.instance.audioStream == null) {
      console.warn('Audio stream is null, mic must have failed or be missing')
      return false
    }
  }

  //This probably isn't needed anymore with channels handling all audio and video, but left it in and commented
  //just in case.
  // if (
  //   networkTransport.channelSendTransport == null ||
  //     networkTransport.channelSendTransport.closed === true ||
  //     networkTransport.channelSendTransport.connectionState === 'disconnected'
  // ) {
  //   await initRouter(channelType, channelId)
  //   await Promise.all([initSendTransport(channelType, channelId), initReceiveTransport(channelType, channelId)])
  // }
  return true
}

export async function createCamVideoProducer(channelType: string, channelId?: string): Promise<void> {
  if (MediaStreams.instance.videoStream !== null && networkTransport.videoEnabled === true) {
    if (networkTransport.channelSendTransport == null) {
      await new Promise((resolve) => {
        const waitForTransportReadyInterval = setInterval(() => {
          if (networkTransport.channelSendTransport) {
            clearInterval(waitForTransportReadyInterval)
            resolve(true)
          }
        }, 100)
      })
    }

    const transport = networkTransport.channelSendTransport
    try {
      MediaStreams.instance.camVideoProducer = await transport.produce({
        track: MediaStreams.instance.videoStream.getVideoTracks()[0],
        encodings: CAM_VIDEO_SIMULCAST_ENCODINGS,
        appData: { mediaTag: 'cam-video', channelType: channelType, channelId: channelId }
      })

      if (MediaStreams.instance.videoPaused) await MediaStreams.instance?.camVideoProducer.pause()
      else await resumeProducer(MediaStreams.instance.camVideoProducer)
    } catch (err) {
      console.log('error producing video', err)
    }
  }
}

export async function createCamAudioProducer(channelType: string, channelId?: string): Promise<void> {
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

    if (networkTransport.channelSendTransport == null) {
      await new Promise((resolve) => {
        const waitForTransportReadyInterval = setInterval(() => {
          if (networkTransport.channelSendTransport) {
            clearInterval(waitForTransportReadyInterval)
            resolve(true)
          }
        }, 100)
      })
    }

    const transport = networkTransport.channelSendTransport
    try {
      // Create a new transport for audio and start producing
      MediaStreams.instance.camAudioProducer = await transport.produce({
        track: MediaStreams.instance.audioStream.getAudioTracks()[0],
        appData: { mediaTag: 'cam-audio', channelType: channelType, channelId: channelId }
      })

      if (MediaStreams.instance.audioPaused) MediaStreams.instance?.camAudioProducer.pause()
      else await resumeProducer(MediaStreams.instance.camAudioProducer)
    } catch (err) {
      console.log('error producing audio', err)
    }
  }
}

export async function endVideoChat(options: { leftParty?: boolean; endConsumers?: boolean }): Promise<boolean> {
  if (Network.instance != null && Network.instance.transport != null) {
    try {
      networkTransport = Network.instance.transport as any
      const request = networkTransport.channelRequest
      const socket = networkTransport.channelSocket
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

      if (networkTransport.channelRecvTransport != null && networkTransport.channelRecvTransport.closed !== true)
        await networkTransport.channelRecvTransport.close()
      if (networkTransport.channelSendTransport != null && networkTransport.channelSendTransport.closed !== true)
        await networkTransport.channelSendTransport.close()

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

export function setRelationship(channelType: string, channelId: string): void {
  networkTransport = Network.instance.transport as any
  networkTransport.channelType = channelType
  networkTransport.channelId = channelId
}

export async function subscribeToTrack(peerId: string, mediaTag: string, channelType: string, channelId: string) {
  networkTransport = Network.instance.transport as any
  const request = networkTransport.channelRequest

  if (request != null) {
    // if we do already have a consumer, we shouldn't have called this method
    let consumer = MediaStreams.instance?.consumers.find(
      (c: any) => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag
    )

    // ask the server to create a server-side consumer object and send us back the info we need to create a client-side consumer
    const consumerParameters = await request(MessageTypes.WebRTCReceiveTrack.toString(), {
      mediaTag,
      mediaPeerId: peerId,
      rtpCapabilities: networkTransport.mediasoupDevice.rtpCapabilities,
      channelType: channelType,
      channelId: channelId
    })

    // Only continue if we have a valid id
    if (consumerParameters?.id == null) return

    consumer = await networkTransport.channelRecvTransport.consume({
      ...consumerParameters,
      appData: { peerId, mediaTag, channelType },
      paused: true
    })

    const existingConsumer = MediaStreams.instance?.consumers?.find(
      (c) => c?.appData?.peerId === peerId && c?.appData?.mediaTag === mediaTag
    )
    if (existingConsumer == null) {
      MediaStreams.instance?.consumers.push(consumer)
      EngineEvents.instance.dispatchEvent({ type: MediaStreams.EVENTS.TRIGGER_UPDATE_CONSUMERS })

      // okay, we're ready. let's ask the peer to send us media
      await resumeConsumer(consumer)
    } else if (existingConsumer?._track?.muted) {
      await closeConsumer(existingConsumer)
      console.log('consumers before splice', MediaStreams.instance?.consumers)
      // MediaStreams.instance?.consumers.splice(existingConsumerIndex, 0, consumer) // existingConsumerIndex is undefined...
      console.log('consumers after splice', MediaStreams.instance?.consumers)
      EngineEvents.instance.dispatchEvent({ type: MediaStreams.EVENTS.TRIGGER_UPDATE_CONSUMERS })

      // okay, we're ready. let's ask the peer to send us media
      await resumeConsumer(consumer)
    } else await closeConsumer(consumer)
  }
}

export async function unsubscribeFromTrack(peerId: any, mediaTag: any) {
  const consumer = MediaStreams.instance?.consumers.find(
    (c) => c.appData.peerId === peerId && c.appData.mediaTag === mediaTag
  )
  await closeConsumer(consumer)
}

export async function pauseConsumer(consumer: { appData: { peerId: any; mediaTag: any }; id: any; pause: () => any }) {
  await (Network.instance.transport as any).channelRequest(MessageTypes.WebRTCPauseConsumer.toString(), {
    consumerId: consumer.id
  })
  await consumer.pause()
}

export async function resumeConsumer(consumer: {
  appData: { peerId: any; mediaTag: any }
  id: any
  resume: () => any
}) {
  await (Network.instance.transport as any).channelRequest(MessageTypes.WebRTCResumeConsumer.toString(), {
    consumerId: consumer.id
  })
  await consumer.resume()
}

export async function pauseProducer(producer: { appData: { mediaTag: any }; id: any; pause: () => any }) {
  await (Network.instance.transport as any).channelRequest(MessageTypes.WebRTCPauseProducer.toString(), {
    producerId: producer.id
  })
  await producer.pause()
}

export async function resumeProducer(producer: { appData: { mediaTag: any }; id: any; resume: () => any }) {
  await (Network.instance.transport as any).channelRequest(MessageTypes.WebRTCResumeProducer.toString(), {
    producerId: producer.id
  })
  await producer.resume()
}

export async function globalMuteProducer(producer: { id: any }) {
  await (Network.instance.transport as any).channelRequest(MessageTypes.WebRTCPauseProducer.toString(), {
    producerId: producer.id,
    globalMute: true
  })
}

export async function globalUnmuteProducer(producer: { id: any }) {
  await (Network.instance.transport as any).channelRequest(MessageTypes.WebRTCResumeProducer.toString(), {
    producerId: producer.id
  })
}

export async function closeConsumer(consumer: any) {
  await (Network.instance.transport as any).channelRequest(MessageTypes.WebRTCCloseConsumer.toString(), {
    consumerId: consumer.id
  })
  await consumer.close()

  MediaStreams.instance.consumers = MediaStreams.instance?.consumers.filter(
    (c: any) => !(c.id === consumer.id)
  ) as any[]
}

export async function leave(instance: boolean, kicked?: boolean): Promise<boolean> {
  if (Network.instance?.transport != null) {
    try {
      networkTransport = Network.instance.transport as any
      networkTransport.leaving = true
      const socket = networkTransport.channelSocket
      const request = networkTransport.channelRequest
      if (kicked !== true && request && socket.connected === true) {
        // close everything on the server-side (transports, producers, consumers)
        const result = await Promise.race([
          await request(MessageTypes.LeaveWorld.toString()),
          new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('Connect timed out')), 10000)
          })
        ])
        if (result?.error) console.error(result.error)
        dispatchLocal(EngineActions.leaveWorld() as any)
      }

      networkTransport.leaving = false
      networkTransport.left = true

      //Leaving the world should close all transports from the server side.
      //This will also destroy all the associated producers and consumers.
      //All we need to do on the client is null all references.
      networkTransport.channelRecvTransport = null!
      networkTransport.channelSendTransport = null!
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
        MediaStreams.instance.videoStream = null!
        MediaStreams.instance.audioStream = null!
        MediaStreams.instance.localScreen = null
        MediaStreams.instance.consumers = []
      }

      if (socket && socket.close) socket.close()

      return true
    } catch (err) {
      console.log('Error with leave()')
      console.log(err)
      networkTransport.leaving = false
    }
  }
  return true // should this return true or false??
}

// async startScreenshare(): Promise<boolean> {
//   console.log("start screen share");
//
//   // make sure we've joined the  and that we have a sending transport
//   if (!transport.sendTransport) transport.sendTransport = await transport.createTransport("send");
//
//   // get a screen share track
//   MediaStreamSystem.localScreen = await (navigator.mediaDevices as any).getDisplayMedia(
//     { video: true, audio: true }
//   );
//
//   // create a producer for video
//   MediaStreamSystem.screenVideoProducer = await transport.sendTransport.produce({
//     track: MediaStreamSystem.localScreen.getVideoTracks()[0],
//     encodings: [], // TODO: Add me
//     appData: { mediaTag: "screen-video" }
//   });
//
//   // create a producer for audio, if we have it
//   if (MediaStreamSystem.localScreen.getAudioTracks().length) {
//     MediaStreamSystem.screenAudioProducer = await transport.sendTransport.produce({
//       track: MediaStreamSystem.localScreen.getAudioTracks()[0],
//       appData: { mediaTag: "screen-audio" }
//     });
//   }
//
//   // handler for screen share stopped event (triggered by the
//   // browser's built-in screen sharing ui)
//   MediaStreamSystem.screenVideoProducer.track.onended = async () => {
//     console.log("screen share stopped");
//     await MediaStreamSystem.screenVideoProducer.pause();
//
//     const { error } = await transport.request(MessageTypes.WebRTCCloseProducer.toString(), {
//       producerId: MediaStreamSystem.screenVideoProducer.id
//     });
//
//     await MediaStreamSystem.screenVideoProducer.close();
//     MediaStreamSystem.screenVideoProducer = null;
//     if (MediaStreamSystem.screenAudioProducer) {
//       const { error: screenAudioProducerError } = await transport.request(MessageTypes.WebRTCCloseProducer.toString(), {
//         producerId: MediaStreamSystem.screenAudioProducer.id
//       });
//
//       await MediaStreamSystem.screenAudioProducer.close();
//       MediaStreamSystem.screenAudioProducer = null;
//     }
//   };
//   return true;
// }
