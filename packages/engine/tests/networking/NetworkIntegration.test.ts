
 import { initializeEngine, shutdownEngine } from '../../src/initializeEngine'
 import { useEngine } from '../../src/ecs/classes/Engine'
 import assert from 'assert'

import { Network } from '../../src/networking/classes/Network'
import { TestNetwork } from './TestNetwork'
import { EngineSystemPresets, InitializeOptions } from '../../src/initializationOptions'
import { DefaultNetworkSchema } from '../../src/networking/templates/DefaultNetworkSchema'

describe('Network Integration Tests', async () => {
  
  before(async () => {
    /* hoist */
    Network.instance = new TestNetwork()
    await initializeEngine({
      type: EngineSystemPresets.SERVER,
      networking: {
        schema: DefaultNetworkSchema,
        transport: Network.instance.transport
      },
      systems: [
      ],
    })
  })
  
  // force close until we can reset the engine properly
  after(async () => {
    await shutdownEngine()
    setTimeout(() => process.exit(0), 1000)
  })

  it('should forward incoming actions', () => {

  })

})
