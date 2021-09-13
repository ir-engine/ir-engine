/**
 * engine utils & polyfills
 */
import { EngineSystemPresets, InitializeOptions } from '../../src/initializationOptions'
import { XMLHttpRequest } from 'xmlhttprequest'
import { NetworkSchema } from '../../src/networking/interfaces/NetworkSchema'
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

export const engineTestSetup: InitializeOptions = {
  type: EngineSystemPresets.SERVER,
  publicPath: '',
  networking: {
    schema: {
      transport: DummyTransport,
      app: {}
    } as any as NetworkSchema
  },
  systems: []
}
