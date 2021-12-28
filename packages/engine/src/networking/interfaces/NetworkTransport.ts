import { Action } from './Action'

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
  sendActions(actions: Set<Action>): void

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
