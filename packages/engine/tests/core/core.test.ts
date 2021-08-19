/**
 * tests
 */
import { initializeEngineTest } from "./core.initialiseEngine.test";

/**
 * engine utils & polyfills
 */
import { EngineSystemPresets } from '../../src/initializationOptions'
import path from 'path'
import Worker from 'web-worker'
import { XMLHttpRequest } from 'xmlhttprequest'
;(globalThis as any).XMLHttpRequest = XMLHttpRequest
;(globalThis as any).self = globalThis

const currentPath = (process.platform === 'win32' ? 'file:///' : '') + path.dirname(__filename)

const options = {
  type: EngineSystemPresets.SERVER,
  publicPath: '',
  physics: {
    physxWorker: () => new Worker(currentPath + '/physx/loadPhysXNode.ts')
  },
  systems: []
}

/**
 * tests
 */
describe('Core', () => {  
  initializeEngineTest(options)
})