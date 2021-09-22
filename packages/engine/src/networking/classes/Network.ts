import { Schema } from '../../assets/superbuffer'
import { RingBuffer } from '../../common/classes/RingBuffer'
import { Snapshot } from '../types/SnapshotDataTypes'
import { OpaqueType } from '../../common/types/OpaqueType'
import { NetworkClient } from '../interfaces/NetworkClient'
import { NetworkSchema } from '../interfaces/NetworkSchema'
import { NetworkTransport } from '../interfaces/NetworkTransport'

export type UserId = OpaqueType<'userId'> & string
export type HostUserId = UserId & { readonly __host: true }
export type NetworkId = OpaqueType<'networkId'> & number

/** Component Class for Network. */
export class Network {
  /** Static instance to access everywhere. */
  static instance: Network = null!

  /** Indication of whether the network is initialized or not. */
  isInitialized: boolean
  /** Whether to apply compression on packet or not. */
  packetCompression = true
  /** we dont senr unit64 now, then its a value to -minus from time to get a little value for unit32 */
  timeSnaphotCorrection = Date.now()
  /** Object holding transport details over network. */
  transport: NetworkTransport
  /** Network transports. */
  transports = [] as any[]
  /** Schema of the component. */
  schema: NetworkSchema
  /** Map of clients connected over this network. */
  clients = new Map<UserId, NetworkClient>()
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
  /** Snapshot of the network. */
  snapshot: Snapshot // TODO: REMOVE

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

  /** ID of last network created. */
  private static availableNetworkId = 0 as NetworkId

  /** Get next network id. */
  static getNetworkId(): NetworkId {
    return ++this.availableNetworkId as NetworkId
  }

  /** Disposes the network. */
  dispose(): void {
    // TODO: needs tests
    this.clients.clear()
    if (this.transport && typeof this.transport.close === 'function') this.transport.close()
    this.transport = null!
    Network.instance = null!
  }
}
