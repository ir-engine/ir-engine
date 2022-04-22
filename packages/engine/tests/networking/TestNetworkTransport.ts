import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'

import { NetworkTransportHandler } from '../../src/networking/classes/Network'
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

  sentActions: Action<'WORLD'>[] = []
  sendActions(actions: Action<'WORLD'>[]): void {
    this.sentActions = [...actions]
  }
  public getSentActions(): Action<'WORLD'>[] {
    return this.sentActions
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
