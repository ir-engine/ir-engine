import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { NetworkTransport } from '@xrengine/engine/src/networking/interfaces/NetworkTransport'
import * as mediasoupClient from 'mediasoup-client'
import { DataProducer, Transport as MediaSoupTransport } from 'mediasoup-client/lib/types'
import { Config } from '@xrengine/common/src/config'
import { io as ioclient, Socket } from 'socket.io-client'
import {
  createDataProducer,
  endVideoChat,
  initReceiveTransport,
  initSendTransport,
  initRouter,
  leave,
  subscribeToTrack
} from './SocketWebRTCClientFunctions'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { closeConsumer } from './SocketWebRTCClientFunctions'
import { Action } from '@xrengine/engine/src/networking/interfaces/Action'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { MediaStreamService } from '../media/services/MediaStreamService'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineService'
import { useDispatch } from '../store'
import { InstanceConnectionAction } from '../common/services/InstanceConnectionService'
import { ChannelConnectionAction } from '../common/services/ChannelConnectionService'
// import { encode, decode } from 'msgpackr'

type ConnectionType = 'world' | 'media'

export class SocketWebRTCClientTransport implements NetworkTransport {
  static EVENTS = {
    PROVISION_INSTANCE_NO_GAMESERVERS_AVAILABLE: 'WEBRTC_PROVISION_INSTANCE_NO_GAMESERVERS_AVAILABLE',
    PROVISION_CHANNEL_NO_GAMESERVERS_AVAILABLE: 'WEBRTC_PROVISION_CHANNEL_NO_GAMESERVERS_AVAILABLE',
    INSTANCE_DISCONNECTED: 'WEBRTC_INSTANCE_DISCONNECTED',
    INSTANCE_WEBGL_DISCONNECTED: 'WEBRTC_INSTANCE_WEBGL_DISCONNECTED',
    INSTANCE_KICKED: 'WEBRTC_INSTANCE_KICKED',
    INSTANCE_RECONNECTED: 'WEBRTC_INSTANCE_RECONNECTED',
    CHANNEL_DISCONNECTED: 'WEBRTC_CHANNEL_DISCONNECTED',
    CHANNEL_RECONNECTED: 'WEBRTC_CHANNEL_RECONNECTED'
  }

  connectionType: ConnectionType

  constructor(connectionType: ConnectionType) {
    this.connectionType = connectionType
  }

  mediasoupDevice: mediasoupClient.Device
  leaving = false
  left = false
  instanceRecvTransport: MediaSoupTransport
  instanceSendTransport: MediaSoupTransport
  channelRecvTransport: MediaSoupTransport
  channelSendTransport: MediaSoupTransport
  instanceSocket: Socket = {} as Socket
  channelSocket: Socket = {} as Socket
  instanceRequest: any
  channelRequest: any
  localScreen: any
  videoEnabled = false
  channelType: string
  channelId: string
  instanceDataProducer: DataProducer
  channelDataProducer: DataProducer

  sendActions(actions: Set<Action>) {
    if (actions.size === 0) return
    // TODO: should we be checking for existence of `emit` here ??
    if (this.instanceSocket.emit) {
      this.instanceSocket.emit(MessageTypes.ActionData.toString(), /*encode(*/ Array.from(actions)) //)
    }
  }

  sendNetworkStatUpdateMessage(message, instance = true): void {
    if (instance) this.instanceSocket.emit(MessageTypes.UpdateNetworkState.toString(), message)
    else this.channelSocket.emit(MessageTypes.UpdateNetworkState.toString(), message)
  }

  close(instance = true, channel = true) {
    if (instance) {
      this.instanceRecvTransport?.close()
      this.instanceSendTransport?.close()
    }
    if (channel) {
      this.channelRecvTransport?.close()
      this.channelSendTransport?.close()
    }
  }

  // This sends message on a data channel (data channel creation is now handled explicitly/default)
  sendData(data: ArrayBuffer, instance = true): void {
    if (instance === true) {
      if (
        this.instanceDataProducer &&
        this.instanceDataProducer.closed !== true &&
        this.instanceDataProducer.readyState === 'open'
      )
        this.instanceDataProducer.send(data)
    } else {
      if (
        this.channelDataProducer &&
        this.channelDataProducer.closed !== true &&
        this.channelDataProducer.readyState === 'open'
      )
        this.channelDataProducer.send(data)
    }
  }

  // Adds support for Promise to socket.io-client
  promisedRequest(socket: Socket) {
    return function request(type: any, data = {}): any {
      return new Promise((resolve) => socket.emit(type, data, resolve))
    }
  }

  public async initialize(
    address = Config.publicRuntimeConfig.gameserverHost,
    port = parseInt(Config.publicRuntimeConfig.gameserverPort),
    instance: boolean,
    opts?: any
  ): Promise<void> {
    const self = this
    let reconnecting
    let socket = instance ? this.instanceSocket : this.channelSocket
    const { token, user, startVideo, videoEnabled, channelType, isHarmonyPage, ...query } = opts
    console.log('******* GAMESERVER PORT IS', port)
    query.token = token
    dispatchLocal(EngineActions.connect(user.id) as any)

    this.mediasoupDevice = new mediasoupClient.Device()
    if (socket && socket.close) socket.close()

    this.channelType = channelType
    this.channelId = opts.channelId

    this.videoEnabled = videoEnabled ?? false

    if (query.locationId == null) delete query.locationId
    if (query.sceneId == null) delete query.sceneId
    if (query.channelId == null) delete query.channelId
    if (process.env.VITE_LOCAL_BUILD === 'true') {
      socket = ioclient(`https://${address as string}:${port.toString()}`, {
        query: query
      })
    } else if (process.env.APP_ENV === 'development') {
      socket = ioclient(`${address as string}:${port.toString()}`, {
        query: query
      })
    } else {
      socket = ioclient(`${Config.publicRuntimeConfig.gameserver}`, {
        path: `/socket.io/${address as string}/${port.toString()}`,
        query: query
      })
    }
    const dispatch = useDispatch()

    if (instance === true) {
      instance = true
      this.instanceSocket = socket
      this.instanceRequest = this.promisedRequest(socket)
      dispatch(InstanceConnectionAction.socketCreated(socket))
    } else {
      this.channelSocket = socket
      this.channelRequest = this.promisedRequest(socket)
      dispatch(ChannelConnectionAction.socketCreated(socket))
    }

    socket.on('connect', async () => {
      console.log(`CONNECT to port ${port}`)
      if (reconnecting === true) {
        reconnecting = false
        return
      }
      if (instance) {
        dispatch(InstanceConnectionAction.instanceServerConnected())
      } else {
        dispatch(ChannelConnectionAction.channelServerConnected())
      }
      const request = instance === true ? this.instanceRequest : this.channelRequest
      const payload = { userId: Engine.userId, accessToken: token }

      const { success } = await new Promise<any>((resolve) => {
        const interval = setInterval(async () => {
          const response = await request(MessageTypes.Authorization.toString(), payload)
          clearInterval(interval)
          resolve(response)
        }, 1000)
      })

      if (!success) return console.error('Unable to connect with credentials')

      let ConnectToWorldResponse
      try {
        ConnectToWorldResponse = await Promise.race([
          await request(MessageTypes.ConnectToWorld.toString()),
          new Promise((resolve, reject) => {
            setTimeout(() => !ConnectToWorldResponse && reject(new Error('Connect timed out')), 10000)
          })
        ])
      } catch (err) {
        console.log(err)
        dispatchLocal(EngineActions.connectToWorldTimeout(instance) as any)
        return
      }
      const { routerRtpCapabilities } = ConnectToWorldResponse as any
      dispatchLocal(EngineActions.connectToWorld(instance, instance) as any)
      // Send heartbeat every second
      const heartbeat = setInterval(() => {
        socket.emit(MessageTypes.Heartbeat.toString())
      }, 1000)

      if (this.mediasoupDevice.loaded !== true) await this.mediasoupDevice.load({ routerRtpCapabilities })

      socket.on(MessageTypes.ActionData.toString(), (message) => {
        if (!message) return
        const actions = message as any as Required<Action>[]
        // const actions = decode(new Uint8Array(message)) as IncomingActionType[]
        for (const a of actions) {
          Engine.currentWorld!.incomingActions.add(a)
        }
      })

      // use sendBeacon to tell the server we're disconnecting when
      // the page unloads
      window.addEventListener('unload', async () => {
        // TODO: Handle this as a full disconnect
        socket.emit(MessageTypes.LeaveWorld.toString())
      })

      socket.on('disconnect', async () => {
        console.log(`DISCONNECT from port ${port}`)
        if (instance === true)
          EngineEvents.instance.dispatchEvent({ type: SocketWebRTCClientTransport.EVENTS.INSTANCE_DISCONNECTED })
        if (instance !== true)
          EngineEvents.instance.dispatchEvent({ type: SocketWebRTCClientTransport.EVENTS.CHANNEL_DISCONNECTED })
        if (instance !== true && isHarmonyPage !== true) {
          self.channelType = 'instance'
          self.channelId = ''
        }
        // if (instance === true) await endVideoChat({ endConsumers: true })
      })

      socket.on(MessageTypes.Kick.toString(), async (message) => {
        // console.log("TODO: SNACKBAR HERE");
        clearInterval(heartbeat)
        await endVideoChat({ endConsumers: true })
        await leave(instance === true, true)
        EngineEvents.instance.dispatchEvent({
          type: SocketWebRTCClientTransport.EVENTS.INSTANCE_KICKED,
          message: message
        })
        console.log('Client has been kicked from the world')
      })

      // Get information for how to consume data from server and init a data consumer
      socket.on(MessageTypes.WebRTCConsumeData.toString(), async (options) => {
        const dataConsumer = await this.instanceRecvTransport.consumeData(options)

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
      })

      socket.on(
        MessageTypes.WebRTCCreateProducer.toString(),
        async (socketId, mediaTag, producerId, channelType, channelId) => {
          const selfProducerIds = [
            MediaStreams.instance?.camVideoProducer?.id,
            MediaStreams.instance?.camAudioProducer?.id
          ]

          if (
            producerId != null &&
            // channelType === self.channelType &&
            selfProducerIds.indexOf(producerId) < 0 &&
            // (MediaStreams.instance?.consumers?.find(
            //   c => c?.appData?.peerId === socketId && c?.appData?.mediaTag === mediaTag
            // ) == null /*&&
            (channelType === 'instance'
              ? this.channelType === 'instance'
              : this.channelType === channelType && this.channelId === channelId)
          ) {
            // that we don't already have consumers for...
            await subscribeToTrack(socketId, mediaTag, channelType, channelId)
          }
        }
      )

      socket.on(MessageTypes.WebRTCPauseConsumer.toString(), async (consumerId) => {
        if (MediaStreams.instance) {
          const consumer = MediaStreams.instance.consumers.find((c) => c.id === consumerId)
          consumer.pause()
        }
      })

      socket.on(MessageTypes.WebRTCResumeConsumer.toString(), async (consumerId) => {
        if (MediaStreams.instance) {
          const consumer = MediaStreams.instance.consumers.find((c) => c.id === consumerId)
          consumer.resume()
        }
      })

      socket.on(MessageTypes.WebRTCCloseConsumer.toString(), async (consumerId) => {
        if (MediaStreams.instance)
          MediaStreams.instance.consumers = MediaStreams.instance.consumers.filter((c) => c.id !== consumerId)
        EngineEvents.instance.dispatchEvent({ type: MediaStreams.EVENTS.TRIGGER_UPDATE_CONSUMERS })
      })

      // Init Receive and Send Transports initially since we need them for unreliable message consumption and production
      if (instance === true) {
        await Promise.all([initSendTransport('instance'), initReceiveTransport('instance')])
        await createDataProducer('instance')
      } else {
        await initRouter(channelType, this.channelId)
        await Promise.all([
          initSendTransport(channelType, this.channelId),
          initReceiveTransport(channelType, this.channelId)
        ])
        let userIds
        if (channelType === 'instance')
          ({ userIds } = await this.instanceRequest(MessageTypes.WebRTCRequestNearbyUsers.toString()))

        await request(MessageTypes.WebRTCRequestCurrentProducers.toString(), {
          userIds: userIds || [],
          channelType: channelType,
          channelId: this.channelId
        })
      }

      ;(socket.io as any).on('reconnect', async () => {
        if (instance === true)
          EngineEvents.instance.dispatchEvent({ type: SocketWebRTCClientTransport.EVENTS.INSTANCE_RECONNECTED })
        if (instance !== true)
          EngineEvents.instance.dispatchEvent({ type: SocketWebRTCClientTransport.EVENTS.CHANNEL_RECONNECTED })
        reconnecting = true
        console.log('reconnect')
        dispatchLocal(EngineActions.resetEngine(instance) as any)
      })

      if (instance === true) {
        EngineEvents.instance.addEventListener(MediaStreams.EVENTS.UPDATE_NEARBY_LAYER_USERS, async () => {
          const { userIds } = await this.instanceRequest(MessageTypes.WebRTCRequestNearbyUsers.toString())
          await request(MessageTypes.WebRTCRequestCurrentProducers.toString(), {
            userIds: userIds || [],
            channelType: 'instance',
            channelId: this.channelId
          })
          MediaStreamService.triggerUpdateNearbyLayerUsers()
        })
        EngineEvents.instance.addEventListener(MediaStreams.EVENTS.CLOSE_CONSUMER, (consumer) =>
          closeConsumer(consumer.consumer)
        )
      }
    })
  }
}
