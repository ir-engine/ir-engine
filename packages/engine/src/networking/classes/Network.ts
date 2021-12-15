import { Schema } from '../../assets/superbuffer'
import { RingBuffer } from '../../common/classes/RingBuffer'
import { NetworkSchema } from '../interfaces/NetworkSchema'
import { NetworkTransport } from '../interfaces/NetworkTransport'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'

/** Component Class for Network. */
export class Network {
  /** Static instance to access everywhere. */
  static instance: Network = new Network()

  /** Indication of whether the network is initialized or not. */
  isInitialized: boolean
  /** Whether to apply compression on packet or not. */
  packetCompression = true
  /** Object holding transport details over network. */
  transport: NetworkTransport
  /** Network transports. */
  transports = [] as any[]
  /** Schema of the component. */
  schema: NetworkSchema
  /** List of data producer nodes. */
  dataProducers = new Map<string, any>()
  /** List of data consumer nodes. */
  dataConsumers = new Map<string, any>()
  /** Socket id of the network instance connection. */
  instanceSocketId: string
  /** Socket id of the network channel connection. */
  channelSocketId: string
  /** Access tocken of the User. */
  accessToken: string

  /** Schema of the network. */
  static _schemas: Map<string, Schema> = new Map()

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
