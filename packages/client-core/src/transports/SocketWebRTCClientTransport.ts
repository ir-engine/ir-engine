import { NetworkConnectionHandler } from '@xrengine/engine/src/networking/classes/Network'
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
// import { encode, decode } from 'msgpackr'

// Adds support for Promise to socket.io-client
const promisedRequest = (socket: Socket) => {
  return function request(type: any, data = {}): any {
    return new Promise((resolve) => socket.emit(type, data, resolve))
  }
}

export class ClientConnectionHandler implements NetworkConnectionHandler {
  worldConnections = new Map<UserId, SocketWebRTCClientTransport>()
  mediaConnections = new Map<UserId, SocketWebRTCClientMediaTransport>()
}

export type TransportConnectionType = 'instance' | 'media'

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
    this.recvTransport?.close()
    this.sendTransport?.close()
    this.socket?.close()
    this.socket = null!
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
    if (instance && this.socket) return console.error('[SocketWebRTCClientWorldTransport]: already initialized')
    let reconnecting = false
    const authState = accessAuthState()
    const token = authState.authUser.accessToken.value
    const { user, startVideo, videoEnabled, channelType, isHarmonyPage, ...query } = opts
    console.log('******* WORLD SERVER PORT IS', port)
    query.token = token
    dispatchLocal(EngineActions.connect(user.id) as any)

    if (this.socket && this.socket.close) this.socket.close()

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
    dispatch(InstanceConnectionAction.socketCreated(this.socket))

    this.socket.on('connect', async () => {
      console.log(`CONNECT to port ${port}`)
      if (reconnecting) {
        reconnecting = false
        return
      }
      dispatch(InstanceConnectionAction.instanceServerConnected())
      onConnectToInstance(this, true)
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

  mediasoupDevice: mediasoupClient.Device
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

  sendActions(actions: Set<Action>) {}

  sendNetworkStatUpdateMessage(message, instance = true): void {
    this.socket?.emit(MessageTypes.UpdateNetworkState.toString(), message)
  }

  close() {
    this.recvTransport?.close()
    this.sendTransport?.close()
    this.socket?.close()
    this.socket = null!
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

    this.mediasoupDevice = new mediasoupClient.Device()
    if (this.socket && this.socket.close) this.socket.close()

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
    })
  }
}
