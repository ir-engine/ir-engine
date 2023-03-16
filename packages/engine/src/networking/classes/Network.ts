import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { addOutgoingTopicIfNecessary, Topic } from '@etherealengine/hyperflux/functions/ActionFunctions'

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

export interface TransportInterface {
  get peers(): PeerID[]
  messageToPeer: (peerId: PeerID, data: any) => void
  messageToAll: (data: any) => void
  bufferToPeer: (dataChannelType: DataChannelType, peerId: PeerID, data: any) => void
  bufferToAll: (dataChannelType: DataChannelType, ata: any) => void
}

export type DataChannelType = OpaqueType<'DataChannelType'> & string

/** Interface for the Transport. */
export const createNetwork = <Ext>(hostId: UserId, topic: Topic, extension: Ext = {} as Ext) => {
  addOutgoingTopicIfNecessary(topic)
  const network = {
    /** Consumers and producers have separate types on client and server */
    producers: [] as any[],
    consumers: [] as any[],

    /** List of data producer nodes. */
    dataProducers: new Map<string, any>(),

    /** List of data consumer nodes. */
    dataConsumers: new Map<string, any>(),

    /** Buffer holding all incoming Messages. */
    incomingMessageQueueUnreliableIDs: new RingBuffer<PeerID>(100),

    /** Buffer holding all incoming Messages. */
    incomingMessageQueueUnreliable: new RingBuffer<any>(100),

    /** Connected peers */
    peers: new Map() as Map<PeerID, NetworkPeer>,

    /** Map of numerical peer index to peer IDs */
    peerIndexToPeerID: new Map<number, PeerID>(),

    /** Map of peer IDs to numerical peer index */
    peerIDToPeerIndex: new Map<PeerID, number>(),

    /**
     * The index to increment when a new peer connects
     * NOTE: Must only be updated by the host
     */
    peerIndexCount: 0,

    /** Connected users */
    users: new Map() as Map<UserId, PeerID[]>,

    /** Map of numerical user index to user client IDs */
    userIndexToUserID: new Map<number, UserId>(),

    /** Map of user client IDs to numerical user index */
    userIDToUserIndex: new Map<UserId, number>(),

    /** Gets the host peer */
    get hostPeerID() {
      const hostPeers = network.users.get(network.hostId)
      if (!hostPeers) return undefined!
      return hostPeers[0]
    },

    /**
     * The index to increment when a new user joins
     * NOTE: Must only be updated by the host
     */
    userIndexCount: 0,

    /**
     * The UserId of the host
     * - will either be a user's UserId, or an instance server's InstanceId
     * @todo rename to hostUserID to differentiate better from hostPeerID
     */
    hostId,

    /**
     * The PeerID of the current user's instance
     * @todo non null this
     */
    peerID: null! as PeerID,

    /**
     * The network is ready for sending messages and data
     */
    ready: false,

    /**
     * The transport used by this network.
     * @todo non null this
     */
    transport: {
      get peers() {
        return []
      },
      messageToPeer: (peerId: PeerID, data: any) => {},
      messageToAll: (data: any) => {},
      bufferToPeer: (dataChannelType: DataChannelType, peerId: PeerID, data: any) => {},
      bufferToAll: (dataChannelType: DataChannelType, data: any) => {}
    } as TransportInterface,

    /**
     * Check if this user is hosting the world.
     */
    get isHosting() {
      return Engine.instance.userId === network.hostId
    },

    topic
  }
  Object.assign(network, extension)
  return network as typeof network & Ext
}

export type Network = ReturnType<typeof createNetwork>
