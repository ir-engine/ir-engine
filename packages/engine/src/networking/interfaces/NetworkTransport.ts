import { Action } from './Action'

/** Interface for the Transport. */
export interface NetworkTransport {
  /**
   * Handle kick event.
   * @param socket Socket on which this event occurred.
   */
  handleKick(socket: any)

  /**
   * Initialize the transport.
   * @param address Address of this transport.
   * @param port Port of this transport.
   * @param instance Whether this is a connection to an instance server or not (i.e. channel server)
   * @param opts Options.
   */
  initialize(address?: string, port?: number, instance?: boolean, opts?: Object): void | Promise<void>

  /**
   * Send data over transport.
   * @param data Data to be sent.
   */
  sendData(data: any): void

  /**
   * Send data through reliable channel over transport.
   * @param data Data to be sent.
   */
  sendReliableData(data: any): void

  /**
   * Send actions through reliable channel
   */
  sendActions(actions: Set<Action>): void

  /**
   * Closes all the media soup transports
   */
  close(): void
}
