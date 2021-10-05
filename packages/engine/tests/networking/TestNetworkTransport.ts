import { Action } from '../../src/networking/interfaces/Action'
import { NetworkTransport } from '../../src/networking/interfaces/NetworkTransport'

export class TestNetworkTransport implements NetworkTransport {
  handleKick(socket: any) {
    throw new Error('Method not implemented.')
  }
  initialize(address?: string, port?: number, instance?: boolean, opts?: Object): void | Promise<void> {
    throw new Error('Method not implemented.')
  }
  sendData(data: any): void {
    throw new Error('Method not implemented.')
  }
  sendReliableData(data: any): void {
    throw new Error('Method not implemented.')
  }
  sendActions(actions: Set<Action>): void {
    throw new Error('Method not implemented.')
  }
  close(): void {
    throw new Error('Method not implemented.')
  }
}
