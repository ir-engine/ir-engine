import { Network, NetworkTransportHandler } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { NetworkTransport } from '@xrengine/engine/src/networking/interfaces/NetworkTransport'
import * as mediasoupClient from 'mediasoup-client'
import { DataProducer, Transport as MediaSoupTransport } from 'mediasoup-client/lib/types'
import { Config } from '@xrengine/common/src/config'
import { io as ioclient, Socket } from 'socket.io-client'
import { onConnectToInstance } from './SocketWebRTCClientFunctions'
import { Action } from '@xrengine/engine/src/networking/interfaces/Action'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineService'
import { useDispatch } from '../store'
import { InstanceConnectionAction } from '../common/services/InstanceConnectionService'
import { ChannelConnectionAction } from '../common/services/ChannelConnectionService'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { accessAuthState } from '../user/services/AuthService'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
// import { encode, decode } from 'msgpackr'

// Adds support for Promise to socket.io-client
const promisedRequest = (socket: Socket) => {
  return function request(type: any, data = {}): any {
    return new Promise((resolve) => socket.emit(type, data, resolve))
  }
}

export class ClientTransportHandler
  implements NetworkTransportHandler<SocketWebRTCClientTransport, SocketWebRTCClientMediaTransport>
{
  worldTransports = new Map<UserId, SocketWebRTCClientTransport>()
  mediaTransports = new Map<UserId, SocketWebRTCClientMediaTransport>()
  constructor() {
    this.worldTransports.set('server' as UserId, new SocketWebRTCClientTransport())
    this.mediaTransports.set('media' as UserId, new SocketWebRTCClientMediaTransport())
  }
  getWorldTransport() {
    return this.worldTransports.get('server' as UserId)!
  }
  getMediaTransport() {
    return this.mediaTransports.get('media' as UserId)!
  }
}

export const getMediaTransport = () =>
  Network.instance.transportHandler.getMediaTransport() as SocketWebRTCClientMediaTransport
export const getWorldTransport = () =>
  Network.instance.transportHandler.getWorldTransport() as SocketWebRTCClientTransport

// todo: rename to SocketWebRTCClientWorldTransport
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

  heartbeat: any
  mediasoupDevice = new mediasoupClient.Device()
  leaving = false
  left = false
  recvTransport: MediaSoupTransport
  sendTransport: MediaSoupTransport
  socket: Socket = null!
  request: ReturnType<typeof promisedRequest>
  dataProducer: DataProducer

  sendActions(actions: Set<Action>) {
    if (actions.size === 0) return
    this.socket?.emit(MessageTypes.ActionData.toString(), /*encode(*/ Array.from(actions)) //)
  }

  sendNetworkStatUpdateMessage(message, instance = true): void {
    this.socket?.emit(MessageTypes.UpdateNetworkState.toString(), message)
  }

  close() {
    console.log('SocketWebRTCClientTransport close')
    this.recvTransport.close()
    this.sendTransport.close()
    this.recvTransport = null!
    this.sendTransport = null!
    clearInterval(this.heartbeat)
    this.socket.close()
    this.socket = null!
  }

  // This sends message on a data channel (data channel creation is now handled explicitly/default)
  sendData(data: ArrayBuffer, instance = true): void {
    if (this.dataProducer && this.dataProducer.closed !== true && this.dataProducer.readyState === 'open')
      this.dataProducer.send(data)
  }

  public async initialize(address, port, instance: boolean, opts?: any): Promise<void> {
    if (instance && this.socket) return console.error('[SocketWebRTCClientWorldTransport]: already initialized')
    let reconnecting = false
    const authState = accessAuthState()
    const token = authState.authUser.accessToken.value
    const { user, ...query } = opts
    console.log('******* WORLD SERVER PORT IS', port)
    query.token = token
    dispatchLocal(EngineActions.connect(user.id) as any)

    if (query.locationId == null) delete query.locationId
    if (query.sceneId == null) delete query.sceneId
    if (process.env.VITE_LOCAL_BUILD === 'true') {
      this.socket = ioclient(`https://${address as string}:${port.toString()}`, {
        query: query
      })
    } else if (process.env.APP_ENV === 'development') {
      this.socket = ioclient(`${address as string}:${port.toString()}`, {
        query: query
      })
    } else {
      this.socket = ioclient(`${Config.publicRuntimeConfig.gameserver}`, {
        path: `/socket.io/${address as string}/${port.toString()}`,
        query: query
      })
    }
    const dispatch = useDispatch()

    this.request = promisedRequest(this.socket)
    dispatch(InstanceConnectionAction.socketCreated(this.socket))

    this.socket.on('connect', async () => {
      console.log(`CONNECT to port ${port}`)
      if (reconnecting) {
        reconnecting = false
        return
      }
      dispatch(InstanceConnectionAction.instanceServerConnected())
      onConnectToInstance(this, true)

      // Send heartbeat every second
      this.heartbeat = setInterval(() => {
        this.socket?.emit(MessageTypes.Heartbeat.toString())
      }, 1000)
    })
  }
}

export class SocketWebRTCClientMediaTransport implements NetworkTransport {
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

  mediasoupDevice = new mediasoupClient.Device()
  leaving = false
  left = false
  recvTransport: MediaSoupTransport
  sendTransport: MediaSoupTransport
  socket: Socket = null!
  request: ReturnType<typeof promisedRequest>
  localScreen: any
  videoEnabled = false
  channelType: string
  channelId: string
  dataProducer: DataProducer
  heartbeat: any

  sendActions(actions: Set<Action>) {}

  sendNetworkStatUpdateMessage(message, instance = true): void {
    this.socket?.emit(MessageTypes.UpdateNetworkState.toString(), message)
  }

  close() {
    if (!this.socket) return console.log('[SocketWebRTCClientMediaTransport]: already initialized')
    console.log('close')
    this.recvTransport.close()
    this.sendTransport.close()
    clearInterval(this.heartbeat)
    this.socket.close()
    this.socket = null!

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
  }

  // This sends message on a data channel (data channel creation is now handled explicitly/default)
  sendData(data: ArrayBuffer, instance = true): void {
    if (this.dataProducer && this.dataProducer.closed !== true && this.dataProducer.readyState === 'open')
      this.dataProducer.send(data)
  }

  public async initialize(
    address = Config.publicRuntimeConfig.gameserverHost,
    port = parseInt(Config.publicRuntimeConfig.gameserverPort),
    instance: boolean,
    opts?: any
  ): Promise<void> {
    if (instance && this.socket) return console.error('[SocketWebRTCClientMediaTransport]: already initialized')
    let reconnecting = false
    const { token, user, startVideo, videoEnabled, channelType, isHarmonyPage, ...query } = opts
    console.log('******* MEDIA SERVER PORT IS', port)
    query.token = token

    this.channelType = channelType
    this.channelId = opts.channelId

    this.videoEnabled = videoEnabled ?? false

    if (query.locationId == null) delete query.locationId
    if (query.sceneId == null) delete query.sceneId
    if (query.channelId == null) delete query.channelId
    if (process.env.VITE_LOCAL_BUILD === 'true') {
      this.socket = ioclient(`https://${address as string}:${port.toString()}`, {
        query: query
      })
    } else if (process.env.APP_ENV === 'development') {
      this.socket = ioclient(`${address as string}:${port.toString()}`, {
        query: query
      })
    } else {
      this.socket = ioclient(`${Config.publicRuntimeConfig.gameserver}`, {
        path: `/socket.io/${address as string}/${port.toString()}`,
        query: query
      })
    }
    const dispatch = useDispatch()
    this.request = promisedRequest(this.socket)
    dispatch(ChannelConnectionAction.socketCreated(this.socket))

    this.socket.on('connect', async () => {
      console.log(`CONNECT to port ${port}`)
      if (reconnecting) {
        reconnecting = false
        return
      }
      dispatch(ChannelConnectionAction.channelServerConnected())
      onConnectToInstance(this, false)

      // Send heartbeat every second
      this.heartbeat = setInterval(() => {
        this.socket?.emit(MessageTypes.Heartbeat.toString())
      }, 1000)
    })
  }
}
