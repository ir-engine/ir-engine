import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { RingBuffer } from '../../common/classes/RingBuffer'
import { NetworkTransport } from '../interfaces/NetworkTransport'

export const TransportTypes = {
  world: 'world',
  media: 'media'
}

export type TransportType = typeof TransportTypes[keyof typeof TransportTypes]

export interface NetworkTransportHandler<W extends NetworkTransport, M extends NetworkTransport> {
  worldTransports: Map<UserId, W>
  getWorldTransport(transport?: UserId): W
  mediaTransports: Map<UserId, M>
  getMediaTransport(transport?: UserId): M
}

/** Component Class for Network. */
export class Network {
  /** Static instance to access everywhere. */
  static instance: Network
  /** Object holding transport details over network. */
  transportHandler: NetworkTransportHandler<NetworkTransport, NetworkTransport>
  /** Object holding transport details over network. */
  // transport: NetworkTransport
  /** Network transports. */
  transports = [] as any[]
  /** List of data producer nodes. */
  dataProducers = new Map<string, any>()
  /** List of data consumer nodes. */
  dataConsumers = new Map<string, any>()

  /** Buffer holding all incoming Messages. */
  incomingMessageQueueUnreliableIDs: RingBuffer<string> = new RingBuffer<string>(100)

  /** Buffer holding all incoming Messages. */
  incomingMessageQueueUnreliable: RingBuffer<any> = new RingBuffer<any>(100)

  /** Buffer holding Mediasoup operations */
  mediasoupOperationQueue: RingBuffer<any> = new RingBuffer<any>(1000)
}
