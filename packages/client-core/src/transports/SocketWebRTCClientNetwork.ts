import * as mediasoupClient from 'mediasoup-client'
import { Consumer, DataProducer, Transport as MediaSoupTransport, Producer } from 'mediasoup-client/lib/types'
import Primus from 'primus-client'

import config from '@etherealengine/common/src/config'
import { Channel } from '@etherealengine/common/src/interfaces/Channel'
import { MediaStreamAppData } from '@etherealengine/common/src/interfaces/MediaStreamConstants'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import multiLogger from '@etherealengine/common/src/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Network } from '@etherealengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@etherealengine/engine/src/networking/enums/MessageTypes'
import { clearOutgoingActions, dispatchAction } from '@etherealengine/hyperflux'
import { addOutgoingTopicIfNecessary, Topic } from '@etherealengine/hyperflux/functions/ActionFunctions'

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

export type WebRTCTransportExtension = Omit<MediaSoupTransport, 'appData'> & { appData: MediaStreamAppData }
export type ProducerExtension = Omit<Producer, 'appData'> & { appData: MediaStreamAppData }
export type ConsumerExtension = Omit<Consumer, 'appData'> & { appData: MediaStreamAppData; producerPaused: boolean }

let id = 0

// import { encode, decode } from 'msgpackr'

// Adds support for Promise to Primus client
// Each 'data' listener function needs to be named something unique in order for removeListener to
// not remove all 'data' listener functions
const promisedRequest = (primus: Primus) => {
  return function request(type: any, data = {}): any {
    return new Promise((resolve) => {
      const responseFunction = (data) => {
        if (data.type.toString() === message.type.toString() && message.id === data.id) {
          resolve(data.data)
          primus.removeListener('data', responseFunction)
        }
      }
      Object.defineProperty(responseFunction, 'name', { value: `responseFunction${id}`, writable: true })
      let message = {
        type: type,
        data: data,
        id: id++
      }
      primus.write(message)

      primus.on('data', responseFunction)
    })
  }
}

const handleFailedConnection = (locationConnectionFailed) => {
  if (locationConnectionFailed) {
    const currentLocation = accessLocationState().currentLocation.location
    const locationInstanceConnectionState = accessLocationInstanceConnectionState()
    const instanceId = Engine.instance.currentWorld.hostIds.world.value ?? ''
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
    const instanceId = Engine.instance.currentWorld.hostIds.media.value ?? ''
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
    addOutgoingTopicIfNecessary(topic)
  }

  mediasoupDevice = new mediasoupClient.Device(Engine.instance.isBot ? { handlerName: 'Chrome74' } : undefined)
  reconnecting = false
  recvTransport: MediaSoupTransport
  sendTransport: MediaSoupTransport
  primus: Primus = null!
  request: ReturnType<typeof promisedRequest>

  dataProducer: DataProducer
  heartbeat: NodeJS.Timer // is there an equivalent browser type for this?

  producers = [] as ProducerExtension[]
  consumers = [] as ConsumerExtension[]

  sendActions() {
    if (!this.ready) return
    const actions = [...Engine.instance.store.actions.outgoing[this.topic].queue]
    if (actions.length && this.primus) {
      this.primus.write({ type: MessageTypes.ActionData.toString(), /*encode(*/ data: actions }) //)
      clearOutgoingActions(this.topic)
    }
  }

  // This sends message on a data channel (data channel creation is now handled explicitly/default)
  sendData(data: ArrayBuffer): void {
    if (this.dataProducer && !this.dataProducer.closed && this.dataProducer.readyState === 'open')
      this.dataProducer.send(data)
  }

  close() {
    logger.info('SocketWebRTCClientNetwork close')
    this.recvTransport?.close()
    this.sendTransport?.close()
    this.recvTransport = null!
    this.sendTransport = null!
    this.heartbeat && clearInterval(this.heartbeat)
    this.primus?.removeAllListeners()
    this.primus?.end()
    this.primus = null!
  }

  public async initialize(args: {
    ipAddress: string
    port: string
    locationId?: string | null
    channelId?: string | null
    roomCode?: string | null
  }): Promise<void> {
    this.reconnecting = false
    if (this.primus) {
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
    } as {
      locationId?: string
      channelId?: string
      roomCode?: string
      address?: string
      port?: string
      token: string
    }

    if (locationId) delete query.channelId
    if (channelId) delete query.locationId
    if (!roomCode) delete query.roomCode

    try {
      if (
        config.client.localBuild === 'true' ||
        (config.client.appEnv === 'development' && config.client.localNginx !== 'true')
      ) {
        const queryString = new URLSearchParams(query).toString()
        this.primus = new Primus(`https://${ipAddress as string}:${port.toString()}?${queryString}`)
      } else {
        query.address = ipAddress
        query.port = port.toString()
        const queryString = new URLSearchParams(query).toString()
        this.primus = new Primus(`${config.client.instanceserverUrl}?${queryString}`)
      }
    } catch (err) {
      logger.error(err)
      return handleFailedConnection(locationId != null)
    }
    this.request = promisedRequest(this.primus)

    const connectionFailTimeout = setTimeout(() => {
      return handleFailedConnection(locationId != null)
    }, 3000)

    this.primus.on('incoming::open', (event) => {
      clearTimeout(connectionFailTimeout)
      if (this.reconnecting) {
        this.reconnecting = false
        ;(this.primus as any)._connected = false
        return
      }

      if ((this.primus as any)._connected) return
      ;(this.primus as any)._connected = true

      logger.info('CONNECT to port %o', { port, locationId })
      onConnectToInstance(this)

      // Send heartbeat every second
      this.heartbeat = setInterval(() => {
        this.primus.write({ type: MessageTypes.Heartbeat.toString() })
      }, 1000)
    })
  }
}
