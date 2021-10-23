import { RingBuffer } from '../../src/common/classes/RingBuffer'
import { Network } from '../../src/networking/classes/Network'
import { NetworkSchema } from '../../src/networking/interfaces/NetworkSchema'
import { NetworkTransport } from '../../src/networking/interfaces/NetworkTransport'
import { TestNetworkTransport } from './TestNetworkTransport'

export class TestNetwork implements Network {
  isInitialized: boolean
  packetCompression: boolean
  transport: TestNetworkTransport = new TestNetworkTransport()
  transports: any[]
  schema: NetworkSchema
  dataProducers: Map<string, any>
  dataConsumers: Map<string, any>
  instanceSocketId: string
  channelSocketId: string
  accessToken: string
  incomingMessageQueueUnreliableIDs: RingBuffer<string>
  incomingMessageQueueUnreliable: RingBuffer<any>
  incomingMessageQueueReliable: RingBuffer<any>
  mediasoupOperationQueue: RingBuffer<any>
  constructor() {
    this.incomingMessageQueueUnreliableIDs = new RingBuffer<string>(100)
    this.incomingMessageQueueUnreliable = new RingBuffer<any>(100)
    this.incomingMessageQueueReliable = new RingBuffer<string>(100)
    this.mediasoupOperationQueue = new RingBuffer<string>(100)
  }
  dispose(): void {}
}
