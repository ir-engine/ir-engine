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

  /** List of data producer nodes. */
  dataProducers: Map<string, any>

  /** List of data consumer nodes. */
  dataConsumers: Map<string, any>

  /** Buffer holding all incoming Messages. */
  incomingMessageQueueUnreliableIDs: RingBuffer<string>

  /** Buffer holding all incoming Messages. */
  incomingMessageQueueUnreliable: RingBuffer<any>

  /** Buffer holding Mediasoup operations */
  mediasoupOperationQueue: RingBuffer<any>
}

export class Network<T extends NetworkTransport> {
  static instance: Network<NetworkTransport>
  transports = new Map<UserId, T>()
  /**
   * @todo: getTransport(transport: UserId) {
   */
  getTransport(transport: string) {
    return this.transports.get(transport as UserId)!
  }
}

globalThis.Network = Network
