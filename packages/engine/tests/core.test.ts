/**
 * tests
 */
import { initializeEngine, shutdownEngine } from '../src/initializeEngine'
import { useEngine } from '../src/ecs/classes/Engine'
import { engineTestSetup } from './util/setupEngine'
import assert from 'assert'

/**
 * tests
 */
describe('Core', () => {

  // force close until we can reset the engine properly
  after(() => setTimeout(() => process.exit(0), 1000))

  describe('Initialise Engine', () => {
    it('Can initialise engine', async () => {
      await initializeEngine(engineTestSetup)
      assert.equal(useEngine().isInitialized, true)
    })

    it('Can shutdown engine', async () => {
      await shutdownEngine()
      assert.equal(useEngine().isInitialized, false)
    })
  })

})