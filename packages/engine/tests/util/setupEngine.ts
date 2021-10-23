/**
 * engine utils & polyfills
 */
import { EngineSystemPresets, InitializeOptions } from '../../src/initializationOptions'
import { XMLHttpRequest } from 'xmlhttprequest'
import { NetworkSchema } from '../../src/networking/interfaces/NetworkSchema'
import { Network } from '../../src/networking/classes/Network'
;(globalThis as any).XMLHttpRequest = XMLHttpRequest
;(globalThis as any).self = globalThis

class DummyTransport {
  handleKick = () => {}
  initialize = () => {}
  sendData = () => {}
  sendReliableData = () => {}
  sendActions = () => {}
  close = () => {}
}

Network.instance.transport = new DummyTransport()
Network.instance.transport.initialize()

export const engineTestSetup: InitializeOptions = {
  type: EngineSystemPresets.SERVER,
  publicPath: '',
  systems: []
}
