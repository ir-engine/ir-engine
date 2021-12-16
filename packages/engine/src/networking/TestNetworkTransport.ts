import { Action } from '../../src/networking/interfaces/Action'
import { NetworkTransport } from '../../src/networking/interfaces/NetworkTransport'

export class TestNetworkTransport implements NetworkTransport {
  handleKick(socket: any) {
    throw new Error('Method not implemented.')
  }
  initialize(address?: string, port?: number, instance?: boolean, opts?: Object): void | Promise<void> {
    throw new Error('Method not implemented.')
  }

  packets: ArrayBuffer[] = []
  sendData(data: ArrayBuffer): void {
    this.packets.push(data)
  }
  public getSentData(): ArrayBuffer[] {
    return this.packets
  }

  sendReliableData(data: any): void {
    throw new Error('Method not implemented.')
  }

  actions: Action[] = []
  sendActions(actions: Set<Action>): void {
    actions.forEach((a) => actions.add(a))
  }
  public getSentActions(): Action[] {
    return this.actions
  }

  close(): void {
    throw new Error('Method not implemented.')
  }
}
