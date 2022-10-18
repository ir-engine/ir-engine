import * as mediasoupClient from 'mediasoup-client'
import { Consumer, DataProducer, Transport as MediaSoupTransport, Producer } from 'mediasoup-client/lib/types'
import { io as ioclient, Socket } from 'socket.io-client'

import { instanceserverHost } from '@xrengine/common/src/config'
import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import multiLogger from '@xrengine/common/src/logger'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { clearOutgoingActions, dispatchAction } from '@xrengine/hyperflux'
import ActionFunctions, { Action, Topic } from '@xrengine/hyperflux/functions/ActionFunctions'

import {
  accessLocationInstanceConnectionState,
  LocationInstanceConnectionAction,
  LocationInstanceConnectionService
} from '../common/services/LocationInstanceConnectionService'
import {
  accessMediaInstanceConnectionState,
  MediaInstanceConnectionAction,
  MediaInstanceConnectionService
} from '../common/services/MediaInstanceConnectionService'
import { accessChatState } from '../social/services/ChatService'
import { accessLocationState } from '../social/services/LocationService'
import { accessAuthState } from '../user/services/AuthService'
import { onConnectToInstance } from './SocketWebRTCClientFunctions'

const logger = multiLogger.child({ component: 'client-core:SocketWebRTCClientNetwork' })

// import { encode, decode } from 'msgpackr'

// Adds support for Promise to socket.io-client
const promisedRequest = (socket: Socket) => {
  return function request(type: any, data = {}): any {
    return new Promise((resolve) => socket.emit(type, data, resolve))
  }
}

const handleFailedConnection = (locationConnectionFailed) => {
  if (locationConnectionFailed) {
    const currentLocation = accessLocationState().currentLocation.location
    const locationInstanceConnectionState = accessLocationInstanceConnectionState()
    const instanceId = Engine.instance.currentWorld._worldHostId ?? ''
    if (!locationInstanceConnectionState.instances[instanceId]?.connected?.value) {
      dispatchAction(LocationInstanceConnectionAction.disconnect({ instanceId }))
      LocationInstanceConnectionService.provisionServer(
        currentLocation.id.value,
        instanceId || undefined,
        currentLocation.sceneId.value
      )
    }
  } else {
    const mediaInstanceConnectionState = accessMediaInstanceConnectionState()
    const instanceId = Engine.instance.currentWorld._mediaHostId ?? ''
    if (!mediaInstanceConnectionState.instances[instanceId]?.connected?.value) {
      dispatchAction(MediaInstanceConnectionAction.disconnect({ instanceId }))
      const authState = accessAuthState()
      const selfUser = authState.user
      const chatState = accessChatState()
      const channelState = chatState.channels
      const channels = channelState.channels.value as Channel[]
      const channelEntries = Object.values(channels).filter((channel) => !!channel) as any
      const instanceChannel = channelEntries.find(
        (entry) => entry.instanceId === Engine.instance.currentWorld.worldNetwork?.hostId
      )
      if (instanceChannel) {
        MediaInstanceConnectionService.provisionServer(instanceChannel?.id!, true)
      } else {
        const partyChannel = Object.values(chatState.channels.channels.value).find(
          (channel) => channel.channelType === 'party' && channel.partyId === selfUser.partyId.value
        )
        MediaInstanceConnectionService.provisionServer(partyChannel?.id!, false)
      }
    }
  }
  return
}

export class SocketWebRTCClientNetwork extends Network {
  constructor(hostId: UserId, topic: Topic) {
    super(hostId, topic)
    ActionFunctions.addOutgoingTopicIfNecessary(topic)
  }

  mediasoupDevice = new mediasoupClient.Device(Engine.instance.isBot ? { handlerName: 'Chrome74' } : undefined)
  reconnecting = false
  recvTransport: MediaSoupTransport
  sendTransport: MediaSoupTransport
  socket: Socket = null!
  request: ReturnType<typeof promisedRequest>

  dataProducer: DataProducer
  heartbeat: NodeJS.Timer // is there an equivalent browser type for this?

  producers = [] as Producer[]
  consumers = [] as Consumer[]

  sendActions() {
    if (!this.ready) return
    const actions = [...Engine.instance.store.actions.outgoing[this.topic].queue]
    if (actions.length && this.socket) {
      this.socket.emit(MessageTypes.ActionData.toString(), /*encode(*/ actions) //)
      clearOutgoingActions(this.topic)
    }
  }

  // This sends message on a data channel (data channel creation is now handled explicitly/default)
  sendData(data: ArrayBuffer): void {
    if (this.dataProducer && this.dataProducer.closed !== true && this.dataProducer.readyState === 'open')
      this.dataProducer.send(data)
  }

  close() {
    logger.info('SocketWebRTCClientNetwork close')
    this.recvTransport?.close()
    this.sendTransport?.close()
    this.recvTransport = null!
    this.sendTransport = null!
    this.heartbeat && clearInterval(this.heartbeat)
    this.socket?.removeAllListeners()
    this.socket?.close()
    this.socket = null!
  }

  public async initialize(args: {
    ipAddress: string
    port: string
    locationId?: string | null
    channelId?: string | null
    roomCode?: string | null
  }): Promise<void> {
    this.reconnecting = false
    if (this.socket) {
      return logger.error(new Error('Network already initialized'))
    }
    logger.info('Initialising transport with args %o', args)
    const { ipAddress, port, locationId, channelId, roomCode } = args

    const authState = accessAuthState()
    const token = authState.authUser.accessToken.value

    const query = {
      locationId,
      channelId,
      roomCode,
      token
    }

    if (locationId) delete query.channelId
    if (channelId) delete query.locationId
    if (!roomCode) delete query.roomCode

    try {
      if (globalThis.process.env['VITE_LOCAL_BUILD'] === 'true') {
        this.socket = ioclient(`https://${ipAddress as string}:${port.toString()}`, {
          query
        })
      } else if (process.env.APP_ENV === 'development' && process.env.VITE_LOCAL_NGINX !== 'true') {
        this.socket = ioclient(`${ipAddress as string}:${port.toString()}`, {
          query
        })
      } else {
        this.socket = ioclient(instanceserverHost, {
          path: `/socket.io/${ipAddress as string}/${port.toString()}`,
          query
        })
      }
    } catch (err) {
      logger.error(err)
      return handleFailedConnection(locationId != null)
    }
    this.request = promisedRequest(this.socket)

    const connectionFailTimeout = setTimeout(() => {
      return handleFailedConnection(locationId != null)
    }, 3000)

    this.socket.on('connect', () => {
      clearTimeout(connectionFailTimeout)
      if (this.reconnecting) {
        this.reconnecting = false
        ;(this.socket as any)._connected = false
        return
      }

      if ((this.socket as any)._connected) return
      ;(this.socket as any)._connected = true

      logger.info('CONNECT to port %o', { port, locationId })
      onConnectToInstance(this)

      // Send heartbeat every second
      this.heartbeat = setInterval(() => {
        this.socket.emit(MessageTypes.Heartbeat.toString())
      }, 1000)
    })
  }
}
