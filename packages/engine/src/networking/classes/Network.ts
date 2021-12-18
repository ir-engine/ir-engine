import { RingBuffer } from '../../common/classes/RingBuffer'
import { NetworkTransport } from '../interfaces/NetworkTransport'

/** Component Class for Network. */
export class Network {
  /** Static instance to access everywhere. */
  static instance: Network
  /** Object holding transport details over network. */
  transport: NetworkTransport
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

  /** Buffer holding all incoming Messages. */
  incomingMessageQueueReliable: RingBuffer<any> = new RingBuffer<any>(100)

  /** Buffer holding Mediasoup operations */
  mediasoupOperationQueue: RingBuffer<any> = new RingBuffer<any>(1000)

  /** Disposes the network. */
  dispose(): void {
    // TODO: needs tests
    if (this.transport && typeof this.transport.close === 'function') this.transport.close()
    this.transport = null!
    Network.instance = null!
  }
}
