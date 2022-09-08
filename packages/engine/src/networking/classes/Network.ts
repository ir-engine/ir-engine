import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Topic } from '@xrengine/hyperflux/functions/ActionFunctions'

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
export class Network {
  /**
   * Initialize the transport.
   * @param address Address of this transport.
   * @param port Port of this transport.
   * @param instance Whether this is a connection to an instance server or not (i.e. channel server)
   * @param opts Options.
   */
  initialize(args: any) {}

  /**
   * Send data over transport.
   * @param data Data to be sent.
   */
  sendData(data: any) {}

  /**
   * Send outgoing actions through reliable channel
   */
  sendActions() {}

  /**
   * Sends a message across the connection and resolves with the reponse
   * @param message
   */
  async request(message: string, data?: any): Promise<any> {}

  /**
   * Closes all the media soup transports
   */
  close(instance?: boolean, channel?: boolean) {}

  /** Consumers and producers have separate types on client and server */
  producers = [] as any[]
  consumers = [] as any[]

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

  /** Connected peers */
  peers = new Map() as Map<UserId, NetworkPeer>

  /** Publish to connected peers that peer information has changed */
  updatePeers() {}

  /** Map of numerical user index to user client IDs */
  userIndexToUserId = new Map<number, UserId>()

  /** Map of user client IDs to numerical user index */
  userIdToUserIndex = new Map<UserId, number>()

  /**
   * The index to increment when a new user joins
   * NOTE: Must only be updated by the host
   */
  userIndexCount = 0

  /**
   * The UserId of the host
   * - will either be a user's UserId, or an instance server's InstanceId
   */
  hostId: UserId

  /**
   * The network is ready for sending messages and data
   */
  ready: boolean

  /**
   * Check if this user is hosting the world.
   */
  get isHosting() {
    return Engine.instance.userId === this.hostId
  }

  topic: Topic

  constructor(hostId: UserId, topic: Topic) {
    this.hostId = hostId
    this.topic = topic
  }
}
