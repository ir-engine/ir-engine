/**
 * tests
 */
import { initializeEngineTest } from "./core.initialiseEngine.test";

/**
 * engine utils & polyfills
 */
import { EngineSystemPresets, InitializeOptions } from '../../src/initializationOptions'
import path from 'path'
import Worker from 'web-worker'
import { XMLHttpRequest } from 'xmlhttprequest'
;import { NetworkSchema } from "../../src/networking/interfaces/NetworkSchema";
(globalThis as any).XMLHttpRequest = XMLHttpRequest
;(globalThis as any).self = globalThis

const currentPath = (process.platform === 'win32' ? 'file:///' : '') + path.dirname(__filename)

class DummyTransport {
  handleKick = () => {}
  initialize = () => {}
  sendData = () => {}
  sendReliableData = () => {}
  sendActions = () => {}
  close = () => {}
}

const options: InitializeOptions = {
  type: EngineSystemPresets.SERVER,
  publicPath: '',
  networking: {
    schema: {
      transport: DummyTransport,
      app: {}
    } as any as NetworkSchema
  },
  physics: {
    physxWorker: () => new Worker(currentPath + '/physx/loadPhysXNode.ts')
  },
  systems: []
}

/**
 * tests
 */
describe('Core', () => {

  // force close until we can reset the engine properly
  afterAll(() => setTimeout(() => process.exit(), 1000))
  initializeEngineTest(options)
})