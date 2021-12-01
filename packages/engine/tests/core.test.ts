/**
 * tests
 */
import { initializeEngine, shutdownEngine } from '../src/initializeEngine'
import { createEngine, Engine, useEngine } from '../src/ecs/classes/Engine'
import { engineTestSetup } from './util/setupEngine'
import assert from 'assert'

/**
 * tests
 */
describe.skip('Core', () => {

  after(() => {
    useEngine().currentWorld = null!
    useEngine().defaultWorld = null!
    Engine.instance = null!
    delete (globalThis as any).PhysX
  })

  describe('Initialise Engine', () => {
    it('Can initialise engine', async () => {
      createEngine()
      await initializeEngine(engineTestSetup)
      assert.equal(useEngine().isInitialized, true)
    })

    it('Can shutdown engine', async () => {
      await shutdownEngine()
      assert.equal(useEngine().isInitialized, false)
    })
  })

})