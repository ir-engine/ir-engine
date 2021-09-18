/**
 * tests
 */
import { initializeEngine, shutdownEngine } from '../src/initializeEngine'
import { Engine } from '../src/ecs/classes/Engine'
import { engineTestSetup } from './util/setupEngine'

/**
 * tests
 */
describe('Core', () => {

  // force close until we can reset the engine properly
  afterAll(() => setTimeout(() => process.exit(0), 1000))

  describe('Initialise Engine', () => {
    test('Can initialise engine', async () => {
      await initializeEngine(engineTestSetup)
      expect(Engine.isInitialized).toBe(true)
    })

    test('Can shutdown engine', async () => {
      await shutdownEngine()
      expect(Engine.isInitialized).toBe(false)
    })
  })

})