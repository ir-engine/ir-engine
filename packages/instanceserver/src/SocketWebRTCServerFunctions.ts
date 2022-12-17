import {
  Consumer,
  DataProducer,
  Producer,
  Router,
  Transport,
  TransportInternal,
  WebRtcTransport,
  Worker
} from 'mediasoup/node/lib/types'
import { Socket } from 'socket.io'

import { MediaStreamAppData } from '@xrengine/common/src/interfaces/MediaStreamConstants'
import { PeerID, PeersUpdateType } from '@xrengine/common/src/interfaces/PeerID'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { createNetwork, Network } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { WorldState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { clearOutgoingActions, getState, State } from '@xrengine/hyperflux'
import { Action, addOutgoingTopicIfNecessary, Topic } from '@xrengine/hyperflux/functions/ActionFunctions'
import { Application } from '@xrengine/server-core/declarations'
import multiLogger from '@xrengine/server-core/src/ServerLogger'

import { setupSubdomain } from './NetworkFunctions'
import { startWebRTC } from './WebRTCFunctions'

const logger = multiLogger.child({ component: 'instanceserver:webrtc:network' })

export type WebRTCTransportExtension = Omit<WebRtcTransport, 'appData'> & {
  appData: MediaStreamAppData
  internal: TransportInternal
}
export type ProducerExtension = Omit<Producer, 'appData'> & { appData: MediaStreamAppData }
export type ConsumerExtension = Omit<Consumer, 'appData'> & { appData: MediaStreamAppData }

type ServerProperties = {
  workers: Worker[]
  routers: Record<string, Router[]>
  transport: Transport
  sockets: Map<PeerID, Socket>
  app: Application
  outgoingDataTransport: Transport
  outgoingDataProducer: DataProducer
  mediasoupTransports: WebRTCTransportExtension[]
  transportsConnectPending: Promise<void>[]
  producers: ProducerExtension[]
  consumers: ConsumerExtension[]
}

export const createServerNetwork = (hostId: UserId, topic: Topic, app: Application) => {
  return createNetwork({
    get sockets() {
      return app.io.of('/').sockets
    },
    sendData,
    hostId,
    topic,
    app,
    workers: [] as Worker[],
    routers: {} as Record<string, Router[]>,
    transport: null! as Transport,
    outgoingDataTransport: null! as Transport,
    outgoingDataProducer: null! as DataProducer,
    mediasoupTransports: [] as WebRTCTransportExtension[],
    transportsConnectPending: [] as Promise<void>[],
    producers: [] as ProducerExtension[],
    consumers: [] as ConsumerExtension[]
  })
}

export type SocketWebRTCServerNetwork = Omit<Network, 'sockets'> & ServerProperties

export const updatePeers = (network: SocketWebRTCServerNetwork) => {
  const userNames = getState(WorldState).userNames
  const peers = Array.from(network.peers.values()).map((peer) => {
    return {
      peerID: peer.peerID,
      peerIndex: peer.peerIndex,
      userID: peer.userId,
      userIndex: peer.userIndex,
      name: userNames[peer.userId].value
    }
  }) as Array<PeersUpdateType>
  if (peers.length)
    for (const [socketID, socket] of network.sockets) socket.emit(MessageTypes.UpdatePeers.toString(), peers)
}

export const sendReliableData = (network: SocketWebRTCServerNetwork, message: any) => {
  for (const [socketID, socket] of network.sockets) socket.emit(MessageTypes.ReliableMessage.toString(), message)
}

export const sendData = (network: SocketWebRTCServerNetwork, data: Buffer) => {
  if (network.outgoingDataProducer != null) network.outgoingDataProducer.send(Buffer.from(new Uint8Array(data)))
}

export const close = (network: SocketWebRTCServerNetwork) => {
  if (network.transport && typeof network.transport.close === 'function') network.transport.close()
}

export const initializeServerNetwork = async (network: SocketWebRTCServerNetwork) => {
  await setupSubdomain(network)
  await startWebRTC(network)

  network.outgoingDataTransport = await network.routers.instance[0].createDirectTransport()
  const options = {
    ordered: false,
    label: 'outgoingProducer',
    protocol: 'raw',
    appData: { peerID: 'outgoingProducer' }
  }
  network.outgoingDataProducer = await network.outgoingDataTransport.produceData(options)

  const currentRouter = network.routers.instance[0]

  await Promise.all(
    (network.routers.instance as any).map(async (router) => {
      if (router.id !== currentRouter.id)
        return currentRouter.pipeToRouter({ dataProducerId: network.outgoingDataProducer.id, router: router })
      else return Promise.resolve()
    })
  )
  logger.info('Server transport initialized.')
}
