import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { NetworkTransportHandler } from '../../src/networking/classes/Network'
import { Action } from '../../src/ecs/functions/Action'
import { NetworkTransport } from '../../src/networking/interfaces/NetworkTransport'

export class TestNetworkTransport implements NetworkTransport {
  request(message: string, data?: any): Promise<any> {
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

export class TestNetworkTransportHandler
  implements NetworkTransportHandler<TestNetworkTransport, TestNetworkTransport>
{
  worldTransports = new Map<UserId, TestNetworkTransport>()
  mediaTransports = new Map<UserId, TestNetworkTransport>()
  constructor() {
    this.worldTransports.set('server' as UserId, new TestNetworkTransport())
    this.mediaTransports.set('media' as UserId, new TestNetworkTransport())
  }
  getWorldTransport() {
    return this.worldTransports.get('server' as UserId)!
  }
  getMediaTransport() {
    return this.mediaTransports.get('media' as UserId)!
  }
}
