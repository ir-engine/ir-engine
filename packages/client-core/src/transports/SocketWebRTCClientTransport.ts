import * as mediasoupClient from 'mediasoup-client'
import { DataProducer, Transport as MediaSoupTransport } from 'mediasoup-client/lib/types'
import { Socket, io as ioclient } from 'socket.io-client'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import {
  Network,
  NetworkTransportHandler,
  TransportType,
  TransportTypes
} from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { Action } from '@xrengine/engine/src/networking/interfaces/Action'
import { NetworkTransport } from '@xrengine/engine/src/networking/interfaces/NetworkTransport'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'

import { accessAuthState } from '../user/services/AuthService'
import { onConnectToInstance } from './SocketWebRTCClientFunctions'

// import { encode, decode } from 'msgpackr'
const gameserverAddress =
  process.env.APP_ENV === 'development'
    ? `https://${(globalThis as any).process.env['VITE_GAMESERVER_HOST']}:${
        (globalThis as any).process.env['VITE_GAMESERVER_PORT']
      }`
    : `https://${(globalThis as any).process.env['VITE_GAMESERVER_HOST']}`
console.log('gameserverAddress', gameserverAddress)

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

  type: TransportType
  constructor(type: TransportType) {
    this.type = type
  }

  mediasoupDevice = new mediasoupClient.Device()
  leaving = false
  left = false
  reconnecting = false
  recvTransport: MediaSoupTransport
  sendTransport: MediaSoupTransport
  socket: Socket = null!
  request: ReturnType<typeof promisedRequest>
  dataProducer: DataProducer
  heartbeat: NodeJS.Timer // is there an equivalent browser type for this?

  sendActions(actions: Set<Action>) {
    if (actions.size === 0) return
    this.socket?.emit(MessageTypes.ActionData.toString(), /*encode(*/ Array.from(actions)) //)
  }

  sendNetworkStatUpdateMessage(message): void {
    this.socket?.emit(MessageTypes.UpdateNetworkState.toString(), message)
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
    console.log(process.env)
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
      this.socket = ioclient(gameserverAddress, {
        path: `/socket.io/${ipAddress as string}/${port.toString()}`,
        query
      })
    }
    this.request = promisedRequest(this.socket)

    this.socket.on('connect', async () => {
      console.log(`CONNECT to port ${port}`)
      if (this.reconnecting) {
        this.reconnecting = false
        return
      }
      onConnectToInstance(this)

      // Send heartbeat every second
      this.heartbeat = setInterval(() => {
        this.socket.emit(MessageTypes.Heartbeat.toString())
      }, 1000)
    })
  }
}
