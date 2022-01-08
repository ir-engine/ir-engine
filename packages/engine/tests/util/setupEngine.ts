import { UserId } from '@xrengine/common/src/interfaces/UserId'
import '@xrengine/engine/src/patchEngineNode'

import { EngineSystemPresets, InitializeOptions } from '../../src/initializationOptions'
import { Network, NetworkTransportHandler } from '../../src/networking/classes/Network'
import { NetworkTransport } from '../../src/networking/interfaces/NetworkTransport'

export class DummyTransport implements NetworkTransport {
  request = (message: string, data?: any) => null!
  initialize = () => null!
  sendData = () => null!
  sendActions = () => null!
  close = () => null!
}

export class DummyTransportHandler implements NetworkTransportHandler<DummyTransport, DummyTransport> {
  worldTransports = new Map<UserId, DummyTransport>()
  mediaTransports = new Map<UserId, DummyTransport>()
  constructor() {
    this.worldTransports.set('server' as UserId, new DummyTransport())
    this.mediaTransports.set('media' as UserId, new DummyTransport())
  }
  getWorldTransport() {
    return this.worldTransports.get('server' as UserId)!
  }
  getMediaTransport() {
    return this.mediaTransports.get('media' as UserId)!
  }
}

export const engineTestSetup: InitializeOptions = {
  type: EngineSystemPresets.SERVER,
  publicPath: '',
  systems: []
}
