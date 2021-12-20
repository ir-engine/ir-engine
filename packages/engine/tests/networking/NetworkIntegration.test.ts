
import { initializeEngine } from '../../src/initializeEngine'
import { Network } from '../../src/networking/classes/Network'
import { TestNetwork } from './TestNetwork'
import { EngineSystemPresets } from '../../src/initializationOptions'

describe('Network Integration Tests', async () => {

  before(async () => {
    /* hoist */
    Network.instance = new TestNetwork()
    await initializeEngine({
      type: EngineSystemPresets.SERVER,
      systems: [],
    })
  })

  it('should', () => {

  })

})
