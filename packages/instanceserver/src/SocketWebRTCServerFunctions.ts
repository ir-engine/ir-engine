/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Consumer, DataProducer, Producer, TransportInternal, WebRtcTransport } from 'mediasoup/node/lib/types'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { createNetwork, DataChannelType } from '@etherealengine/engine/src/networking/classes/Network'
import { MediaStreamAppData } from '@etherealengine/engine/src/networking/NetworkState'
import { getState } from '@etherealengine/hyperflux'
import { Topic } from '@etherealengine/hyperflux/functions/ActionFunctions'
import { Application } from '@etherealengine/server-core/declarations'
import multiLogger from '@etherealengine/server-core/src/ServerLogger'

import { InstanceServerState } from './InstanceServerState'
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
    messageToPeer: (peerId: PeerID, data: any) => {
      const spark = network.peers.get(peerId)?.spark
      if (spark) spark.write(data)
    },

    messageToAll: (data: any) => {
      for (const peer of Array.from(network.peers.values())) peer.spark?.write(data)
    },

    bufferToPeer: (dataChannelType: DataChannelType, peerID: PeerID, data: any) => {
      /** @todo - for now just send to everyone */
      network.transport.bufferToAll(dataChannelType, data)
    },

    /**
     * We need to specify which data channel type this is
     * @param dataChannelType
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
  (getState(InstanceServerState).isMediaInstance
    ? Engine.instance.mediaNetwork
    : Engine.instance.worldNetwork) as SocketWebRTCServerNetwork
