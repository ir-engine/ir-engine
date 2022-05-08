import * as mediasoupClient from 'mediasoup-client'
import { DataProducer, Transport as MediaSoupTransport } from 'mediasoup-client/lib/types'
import { io as ioclient, Socket } from 'socket.io-client'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import {
  Network,
  NetworkTransportHandler,
  TransportType,
  TransportTypes
} from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { NetworkTransport } from '@xrengine/engine/src/networking/interfaces/NetworkTransport'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { addActionReceptor, defineAction } from '@xrengine/hyperflux'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'

import { accessAuthState } from '../user/services/AuthService'
import { gameserverHost } from '../util/config'
import { MediaStreamService } from './../media/services/MediaStreamService'
import { onConnectToInstance } from './SocketWebRTCClientFunctions'

// import { encode, decode } from 'msgpackr'

// Adds support for Promise to socket.io-client
const promisedRequest = (socket: Socket) => {
  return function request(type: any, data = {}): any {
    return new Promise((resolve) => socket.emit(type, data, resolve))
  }
}

export class ClientTransportHandler
  implements NetworkTransportHandler<SocketWebRTCClientTransport, SocketWebRTCClientTransport>
{
  worldTransports = new Map<UserId, SocketWebRTCClientTransport>()
  mediaTransports = new Map<UserId, SocketWebRTCClientTransport>()
  constructor() {
    this.worldTransports.set('server' as UserId, new SocketWebRTCClientTransport(TransportTypes.world))
    this.mediaTransports.set('media' as UserId, new SocketWebRTCClientTransport(TransportTypes.media))
  }
  getWorldTransport() {
    return this.worldTransports.get('server' as UserId)!
  }
  getMediaTransport() {
    return this.mediaTransports.get('media' as UserId)!
  }
}

export const getMediaTransport = () =>
  Network.instance.transportHandler.getMediaTransport() as SocketWebRTCClientTransport
export const getWorldTransport = () =>
  Network.instance.transportHandler.getWorldTransport() as SocketWebRTCClientTransport

export class SocketWebRTCClientTransport implements NetworkTransport {
  static actions = {
    noWorldServersAvailable: defineAction({
      store: 'ENGINE',
      type: 'WEBRTC_PROVISION_INSTANCE_NO_GAMESERVERS_AVAILABLE' as const,
      instanceId: matches.string
    }),
    noMediaServersAvailable: defineAction({
      store: 'ENGINE',
      type: 'WEBRTC_PROVISION_CHANNEL_NO_GAMESERVERS_AVAILABLE' as const
    }),
    worldInstanceKicked: defineAction({
      store: 'ENGINE',
      type: 'WEBRTC_INSTANCE_KICKED' as const,
      message: matches.string
    }),
    worldInstanceDisconnected: defineAction({
      store: 'ENGINE',
      type: 'WEBRTC_INSTANCE_DISCONNECTED' as const
    }),
    worldInstanceReconnected: defineAction({
      store: 'ENGINE',
      type: 'WEBRTC_INSTANCE_RECONNECTED' as const
    }),
    mediaInstanceDisconnected: defineAction({
      store: 'ENGINE',
      type: 'WEBRTC_CHANNEL_DISCONNECTED' as const
    }),
    mediaInstanceReconnected: defineAction({
      store: 'ENGINE',
      type: 'WEBRTC_CHANNEL_RECONNECTED' as const
    })
  }

  type: TransportType
  constructor(type: TransportType) {
    this.type = type
    addActionReceptor(Engine.instance.store, (action) => {
      matches(action).when(
        MediaStreams.actions.triggerUpdateConsumers.matches,
        MediaStreamService.triggerUpdateConsumers
      )
    })
  }

  mediasoupDevice = new mediasoupClient.Device(Engine.instance.isBot ? { handlerName: 'Chrome74' } : undefined)
  leaving = false
  left = false
  reconnecting = false
  recvTransport: MediaSoupTransport
  sendTransport: MediaSoupTransport
  socket: Socket = null!
  request: ReturnType<typeof promisedRequest>
  dataProducer: DataProducer
  heartbeat: NodeJS.Timer // is there an equivalent browser type for this?

  sendActions(actions: Action<'WORLD'>[]) {
    if (actions.length === 0) return
    this.socket?.emit(MessageTypes.ActionData.toString(), /*encode(*/ actions) //)
  }

  // This sends message on a data channel (data channel creation is now handled explicitly/default)
  sendData(data: ArrayBuffer): void {
    if (this.dataProducer && this.dataProducer.closed !== true && this.dataProducer.readyState === 'open')
      this.dataProducer.send(data)
  }

  close() {
    console.log('SocketWebRTCClientTransport close')
    this.recvTransport.close()
    this.sendTransport.close()
    this.recvTransport = null!
    this.sendTransport = null!
    clearInterval(this.heartbeat)
    this.socket.removeAllListeners()
    this.socket.close()
    this.socket = null!
  }

  public async initialize(args: {
    sceneId: string
    ipAddress: string
    port: string
    locationId?: string
    channelId?: string
  }): Promise<void> {
    this.reconnecting = false
    if (this.socket) return console.error('[SocketWebRTCClientTransport]: already initialized')
    console.log('[SocketWebRTCClientTransport]: Initialising transport with args', args)
    const { sceneId, ipAddress, port, locationId, channelId } = args

    const authState = accessAuthState()
    const token = authState.authUser.accessToken.value

    const query = {
      sceneId,
      locationId,
      channelId,
      token
    }

    if (locationId) delete query.channelId
    if (channelId) delete query.locationId

    if (globalThis.process.env['VITE_LOCAL_BUILD'] === 'true') {
      this.socket = ioclient(`https://${ipAddress as string}:${port.toString()}`, {
        query
      })
    } else if (process.env.APP_ENV === 'development') {
      this.socket = ioclient(`${ipAddress as string}:${port.toString()}`, {
        query
      })
    } else {
      this.socket = ioclient(gameserverHost, {
        path: `/socket.io/${ipAddress as string}/${port.toString()}`,
        query
      })
    }
    this.request = promisedRequest(this.socket)

    this.socket.on('connect', () => {
      if (this.reconnecting) {
        this.reconnecting = false
        ;(this.socket as any)._connected = false
        return
      }

      if ((this.socket as any)._connected) return
      ;(this.socket as any)._connected = true

      console.log('CONNECT to port', port, sceneId, locationId)
      onConnectToInstance(this)

      // Send heartbeat every second
      this.heartbeat = setInterval(() => {
        this.socket.emit(MessageTypes.Heartbeat.toString())
      }, 1000)
    })
  }
}
