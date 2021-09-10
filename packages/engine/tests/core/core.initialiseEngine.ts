import { initializeEngine, shutdownEngine } from '../../src/initializeEngine'
import { InitializeOptions } from '../../src/initializationOptions'
import { Engine } from '../../src/ecs/classes/Engine'

const maxTimeout = 30 * 1000

export function initializeEngineTest(options: InitializeOptions) {
  describe('Initialise Engine', () => {
    test(
      'Can initialise engine',
      async () => {
        await initializeEngine(options)
        expect(Engine.isInitialized).toBe(true)
      },
      maxTimeout
    )

    test('Can shutdown engine', async () => {
      await shutdownEngine()
      expect(Engine.isInitialized).toBe(false)
    })
  })
}
