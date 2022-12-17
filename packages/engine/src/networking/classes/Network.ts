import { PeerID } from '@xrengine/common/src/interfaces/PeerID'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { hookstate } from '@xrengine/hyperflux'
import { addOutgoingTopicIfNecessary, Topic } from '@xrengine/hyperflux/functions/ActionFunctions'

import { RingBuffer } from '../../common/classes/RingBuffer'
import { Engine } from '../../ecs/classes/Engine'
import { NetworkPeer } from '../interfaces/NetworkPeer'

/**
 * Network topics are classes of networks. Topics are used to disitinguish between multiple networks of the same type.
 */
export const NetworkTopics = {
  world: 'world' as Topic,
  media: 'media' as Topic
}

/** Interface for the Transport. */
export interface Network {
  sockets: Map<PeerID, any>

  sendData: (network: Network, data: ArrayBuffer) => void

  /** Consumers and producers have separate types on client and server */
  producers: any[]
  consumers: any[]

  /** List of data producer nodes. */
  dataProducers: Map<string, any>

  /** List of data consumer nodes. */
  dataConsumers: Map<string, any>

  /** Buffer holding all incoming Messages. */
  incomingMessageQueueUnreliableIDs: RingBuffer<PeerID>

  /** Buffer holding all incoming Messages. */
  incomingMessageQueueUnreliable: RingBuffer<any>

  /** Buffer holding Mediasoup operations */
  mediasoupOperationQueue: RingBuffer<any>

  /** Connected peers */
  peers: Map<PeerID, NetworkPeer>

  /** Map of numerical user index to user client IDs */
  userIndexToUserID: Map<number, UserId>

  /** Map of user client IDs to numerical user index */
  userIDToUserIndex: Map<UserId, number>

  /** Map of numerical peer index to peer IDs */
  peerIndexToPeerID: Map<number, PeerID>

  /** Map of peer IDs to numerical peer index */
  peerIDToPeerIndex: Map<PeerID, number>

  /**
   * The index to increment when a new user joins
   * NOTE: Must only be updated by the host
   */
  userIndexCount: number

  /**
   * The index to increment when a new peer connects
   * NOTE: Must only be updated by the host
   */
  peerIndexCount: number

  /**
   * The UserId of the host
   * - will either be a user's UserId, or an instance server's InstanceId
   */
  hostId: UserId

  /**
   * The PeerID of the current user's instance
   */
  peerID: PeerID

  /**
   * The network is ready for sending messages and data
   */
  ready: boolean

  /**
   * True if this user is hosting the world.
   */
  isHosting: boolean

  topic: Topic
}

type MandatoryNetworkProps = {
  hostId: UserId
  topic: Topic
}

export const createNetwork = <S extends MandatoryNetworkProps>(extensionProps = {} as S) => {
  addOutgoingTopicIfNecessary(extensionProps.topic)
  return {
    sockets: new Map(),
    sendData: () => {},
    producers: [],
    consumers: [],
    dataProducers: new Map(),
    dataConsumers: new Map(),
    incomingMessageQueueUnreliableIDs: new RingBuffer<PeerID>(100),
    incomingMessageQueueUnreliable: new RingBuffer(100),
    mediasoupOperationQueue: new RingBuffer(100),
    peers: new Map(),
    userIndexToUserID: new Map(),
    userIDToUserIndex: new Map(),
    peerIndexToPeerID: new Map(),
    peerIDToPeerIndex: new Map(),
    userIndexCount: 0,
    peerIndexCount: 0,
    peerID: null! as PeerID,
    ready: false,
    get isHosting() {
      return Engine.instance.userId === this.hostId
    },
    ...extensionProps
  } as Network & S
}
