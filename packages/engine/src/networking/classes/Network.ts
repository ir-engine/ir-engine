import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'

import { RingBuffer } from '../../common/classes/RingBuffer'

export const TransportTypes = {
  world: 'world',
  media: 'media'
}

export type TransportType = typeof TransportTypes[keyof typeof TransportTypes]

/** Interface for the Transport. */
export interface NetworkTransport {
  /**
   * Initialize the transport.
   * @param address Address of this transport.
   * @param port Port of this transport.
   * @param instance Whether this is a connection to an instance server or not (i.e. channel server)
   * @param opts Options.
   */
  initialize(any): void | Promise<void>

  /**
   * Send data over transport.
   * @param data Data to be sent.
   */
  sendData(data: any): void

  /**
   * Send actions through reliable channel
   */
  sendActions(actions: Action<'WORLD'>[]): void

  /**
   * Sends a message across the connection and resolves with the reponse
   * @param message
   */
  request(message: string, data?: any): Promise<any>

  /**
   * Closes all the media soup transports
   */
  close(instance?: boolean, channel?: boolean): void
}

export interface NetworkTransportHandler<W extends NetworkTransport, M extends NetworkTransport> {
  worldTransports: Map<UserId, W>
  getWorldTransport(transport?: UserId): W
  mediaTransports: Map<UserId, M>
  getMediaTransport(transport?: UserId): M
}

/** Component Class for Network. */
export class Network {
  /** Static instance to access everywhere. */
  static instance: Network
  /** Object holding transport details over network. */
  transportHandler: NetworkTransportHandler<NetworkTransport, NetworkTransport>
  /** Transport connection promises */
  transportsConnectPending = [] as Promise<any>[]
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

  /** Buffer holding Mediasoup operations */
  mediasoupOperationQueue: RingBuffer<any> = new RingBuffer<any>(1000)
}

globalThis.Network = Network
