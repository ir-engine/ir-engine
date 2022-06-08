import * as mediasoupClient from 'mediasoup-client'
import { DataProducer, Transport as MediaSoupTransport } from 'mediasoup-client/lib/types'
import { io as ioclient, Socket } from 'socket.io-client'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Network, NetworkType } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'

import { accessAuthState } from '../user/services/AuthService'
import { instanceserverHost } from '../util/config'
import { onConnectToInstance } from './SocketWebRTCClientFunctions'

// import { encode, decode } from 'msgpackr'

// Adds support for Promise to socket.io-client
const promisedRequest = (socket: Socket) => {
  return function request(type: any, data = {}): any {
    return new Promise((resolve) => socket.emit(type, data, resolve))
  }
}

export class SocketWebRTCClientNetwork extends Network {
  type: NetworkType
  constructor(hostId: string, type: NetworkType) {
    super(hostId)
    this.type = type
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

  sendActions(actions: Action[]) {
    if (!actions.length) return
    for (const action of actions) action.$topic = undefined!
    this.socket?.emit(MessageTypes.ActionData.toString(), /*encode(*/ actions) //)
  }

  // This sends message on a data channel (data channel creation is now handled explicitly/default)
  sendData(data: ArrayBuffer): void {
    if (this.dataProducer && this.dataProducer.closed !== true && this.dataProducer.readyState === 'open')
      this.dataProducer.send(data)
  }

  close() {
    console.log('SocketWebRTCClientNetwork close')
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
    if (this.socket) return console.error('[SocketWebRTCClientNetwork]: already initialized')
    console.log('[SocketWebRTCClientNetwork]: Initialising transport with args', args)
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
      this.socket = ioclient(instanceserverHost, {
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
