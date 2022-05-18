import { RingBuffer } from '../../src/common/classes/RingBuffer'
import { Network } from '../../src/networking/classes/Network'
import { DummyTransportHandler } from '../util/setupEngine'

export class TestNetwork implements Network {
  transports: any[]
  dataProducers: Map<string, any>
  dataConsumers: Map<string, any>
  incomingMessageQueueUnreliableIDs: RingBuffer<string>
  incomingMessageQueueUnreliable: RingBuffer<any>
  mediasoupOperationQueue: RingBuffer<any>
  constructor() {
    this.incomingMessageQueueUnreliableIDs = new RingBuffer<string>(100)
    this.incomingMessageQueueUnreliable = new RingBuffer<any>(100)
    this.mediasoupOperationQueue = new RingBuffer<string>(100)
  }
  transportHandler = new DummyTransportHandler()
  dispose(): void {}
}
