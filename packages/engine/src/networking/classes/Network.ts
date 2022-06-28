import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { addTopic } from '@xrengine/hyperflux'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'

import { RingBuffer } from '../../common/classes/RingBuffer'
import { Engine } from '../../ecs/classes/Engine'
import { NetworkPeer } from '../interfaces/NetworkPeer'

export const NetworkTypes = {
  world: 'world' as const,
  media: 'media' as const
}

export type NetworkType = typeof NetworkTypes[keyof typeof NetworkTypes]

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
   * Send actions through reliable channel
   */
  sendActions(actions: Action[]) {}

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

  /** Connected clients */
  peers = new Map() as Map<UserId, NetworkPeer>

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
  hostId = null! as UserId

  /**
   * Check if this user is hosting the world.
   */
  get isHosting() {
    return Engine.instance.userId === this.hostId
  }

  constructor(hostId) {
    this.hostId = hostId
    addTopic(hostId)
  }
}
