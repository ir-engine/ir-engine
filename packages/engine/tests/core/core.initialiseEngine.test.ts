// Patch XHR for FileLoader in threejs
import { initializeEngine } from '../../src/initializeEngine'
import { InitializeOptions } from '../../src/initializationOptions'
import { Engine } from '../../src/ecs/classes/Engine'


export function initializeEngineTest (options: InitializeOptions) {

  describe('Initialise Engine', () => {
    
    test('Can initialise engine', async () => {
      await initializeEngine(options)
      expect(Engine.isInitialized).toBe(true)
    })
  })
}


