import { Schema } from '../../assets/superbuffer'
import { RingBuffer } from '../../common/classes/RingBuffer'
import { Entity } from '../../ecs/classes/Entity'
import { NetworkObjectList } from '../interfaces/NetworkObjectList'
import { NetworkSchema } from '../interfaces/NetworkSchema'
import { NetworkTransport, ActionType } from '../interfaces/NetworkTransport'
import { AvatarProps } from '../interfaces/WorldState'
import { Snapshot } from '../types/SnapshotDataTypes'
import SocketIO from 'socket.io'

export interface NetworkClientList {
  // Key is socket ID
  [key: string]: {
    userId?: string
    name?: string
    socket?: SocketIO.Socket
    socketId?: string
    lastSeenTs?: any
    joinTs?: any
    media?: {}
    consumerLayers?: {}
    stats?: {}
    instanceSendTransport?: any
    instanceRecvTransport?: any
    channelSendTransport?: any
    channelRecvTransport?: any
    dataConsumers?: Map<string, any> // Key => id of data producer
    dataProducers?: Map<string, any> // Key => label of data channel}
    avatarDetail?: AvatarProps
    networkId?: any // to easily retrieve the network object correspending to this client
    subscribedChatUpdates: string[]
  }
}

/** Component Class for Network. */
export class Network {
  /** Static instance to access everywhere. */
  static instance: Network = null

  /** Indication of whether the network is initialized or not. */
  isInitialized: boolean
  /** Whether to apply compression on packet or not. */
  packetCompression = true
  /** we dont senr unit64 now, then its a value to -minus from time to get a little value for unit32 */
  timeSnaphotCorrection = Date.now()
  /** Object holding transport details over network. */
  transport: NetworkTransport
  /** Network transports. */
  transports = []
  /** Schema of the component. */
  schema: NetworkSchema
  /** Clients connected over this network. */
  clients: NetworkClientList = {}
  /** List of data producer nodes. */
  dataProducers = new Map<string, any>()
  /** List of data consumer nodes. */
  dataConsumers = new Map<string, any>()
  /** Incoming actions */
  incomingActions = [] as ActionType[]
  /** Outgoing actions */
  outgoingActions = [] as ActionType[]

  /** Map of Network Objects. */
  networkObjects: NetworkObjectList = {}
  localClientEntity: Entity = null
  /** Socket id of the network instance connection. */
  instanceSocketId: string
  /** Socket id of the network channel connection. */
  channelSocketId: string
  /** User id hosting this network. */
  userId: string
  /** Access tocken of the User. */
  accessToken: string
  /** Snapshot of the network. */
  snapshot: Snapshot

  /** ID of last network created. */
  private static availableNetworkId = 0

  /** Get next network id. */
  static getNetworkId(): number {
    return ++this.availableNetworkId
  }

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

  /** Tick of the network. */
  tick: any = 0

  /** Disposes the network. */
  dispose(): void {
    // TODO: needs tests
    this.clients = {}
    if (this.transport && typeof this.transport.close === 'function') this.transport.close()
    this.transport = null
    Network.availableNetworkId = 0
    Network.instance = null
  }
}
