import { Consumer, Producer, TransportInternal, WebRtcTransport } from 'mediasoup/node/lib/types'

import { MediaStreamAppData } from '@etherealengine/common/src/interfaces/MediaStreamConstants'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { createNetwork } from '@etherealengine/engine/src/networking/classes/Network'
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
  const options = {
    ordered: false,
    label: 'outgoingProducer',
    protocol: 'raw',
    appData: { peerID: 'outgoingProducer' }
  }
  const outgoingDataProducer = await outgoingDataTransport.produceData(options)

  const currentRouter = routers.instance[0]

  await Promise.all(
    (routers.instance as any).map(async (router) => {
      if (router.id !== currentRouter.id)
        return currentRouter.pipeToRouter({ dataProducerId: outgoingDataProducer.id, router: router })
      else return Promise.resolve()
    })
  )
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

    bufferToPeer: (peerID: PeerID, data: any) => {
      /** noop */
    },

    bufferToAll: (data: any) => {
      network.outgoingDataProducer.send(Buffer.from(new Uint8Array(data)))
    }
  }

  const network = {
    ...createNetwork(hostId, topic),
    workers,
    routers,
    transport,
    outgoingDataTransport,
    outgoingDataProducer,
    mediasoupTransports: [] as WebRTCTransportExtension[],
    transportsConnectPending: [] as Promise<void>[],
    producers: [] as ProducerExtension[],
    consumers: [] as ConsumerExtension[]
  }

  return network
}

export type SocketWebRTCServerNetwork = Awaited<ReturnType<typeof initializeNetwork>>

export const getServerNetwork = (app: Application) =>
  (app.isChannelInstance ? Engine.instance.mediaNetwork : Engine.instance.worldNetwork) as SocketWebRTCServerNetwork
