import {
  Consumer,
  DataProducer,
  DirectTransport,
  Producer,
  Router,
  TransportInternal,
  WebRtcTransport,
  Worker
} from 'mediasoup/node/lib/types'

import { MediaStreamAppData } from '@etherealengine/common/src/interfaces/MediaStreamConstants'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { createNetwork, DataChannelType, Network } from '@etherealengine/engine/src/networking/classes/Network'
import { Topic } from '@etherealengine/hyperflux/functions/ActionFunctions'
import { Application } from '@etherealengine/server-core/declarations'
import multiLogger from '@etherealengine/server-core/src/ServerLogger'

import { startWebRTC } from './WebRTCFunctions'

const logger = multiLogger.child({ component: 'instanceserver:webrtc:network' })

export type WebRTCTransportExtension = Omit<WebRtcTransport, 'appData'> & {
  appData: MediaStreamAppData
  internal: TransportInternal
}
export type ProducerExtension = Omit<Producer, 'appData'> & { appData: MediaStreamAppData }
export type ConsumerExtension = Omit<Consumer, 'appData'> & { appData: MediaStreamAppData }

export const initializeNetwork = async (app: Application, hostId: UserId, topic: Topic) => {
  const { workers, routers } = await startWebRTC()

  const outgoingDataTransport = await routers.instance[0].createDirectTransport()
  logger.info('Server transport initialized.')

  const transport = {
    get peers() {
      return Object.keys(app.primus.connections) as PeerID[]
    },

    messageToPeer: (peerId: PeerID, data: any) => {
      const spark = app.primus.connections[peerId]
      if (spark) spark.write(data)
    },

    messageToAll: (data: any) => {
      for (const spark of Object.values(app.primus.connections)) spark.write(data)
    },

    bufferToPeer: (dataChannelType: DataChannelType, peerID: PeerID, data: any) => {
      /** noop */
    },

    /**
     * We need a to specify which data channel type this is
     * @param data
     */
    bufferToAll: (dataChannelType: DataChannelType, data: any) => {
      const dataProducer = network.outgoingDataProducers[dataChannelType]
      if (!dataProducer) return
      dataProducer.send(Buffer.from(new Uint8Array(data)))
    }
  }

  const network = createNetwork(hostId, topic, {
    workers,
    routers,
    transport,
    outgoingDataTransport,
    outgoingDataProducers: {} as { [key: DataChannelType]: DataProducer },
    mediasoupTransports: [] as WebRTCTransportExtension[],
    transportsConnectPending: [] as Promise<void>[],
    producers: [] as ProducerExtension[],
    consumers: [] as ConsumerExtension[]
  })

  return network
}

export type SocketWebRTCServerNetwork = Awaited<ReturnType<typeof initializeNetwork>>

export const getServerNetwork = (app: Application) =>
  (app.isChannelInstance ? Engine.instance.mediaNetwork : Engine.instance.worldNetwork) as SocketWebRTCServerNetwork
