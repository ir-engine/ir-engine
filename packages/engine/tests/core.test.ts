/**
 * tests
 */
import { initializeEngine, shutdownEngine } from '../src/initializeEngine'
import { Engine } from '../src/ecs/classes/Engine'
import { DummyTransportHandler, engineTestSetup } from './util/setupEngine'
import assert from 'assert'
import { Network } from '../src/networking/classes/Network'

/**
 * tests
 */
describe('Core', () => {

  // force close until we can reset the engine properly
  after(() => setTimeout(() => process.exit(0), 1000))

  describe('Initialise Engine', () => {
    it('Can initialise engine', async () => {
      Network.instance = new Network()
      Network.instance.transportHandler = new DummyTransportHandler()
      await initializeEngine(engineTestSetup)
      assert.equal(Engine.isInitialized, true)
    })

    it('Can shutdown engine', async () => {
      await shutdownEngine()
      assert.equal(Engine.isInitialized, false)
    })
  })

})