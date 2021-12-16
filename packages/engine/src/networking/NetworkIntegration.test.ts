
 import { initializeEngine } from '../../src/initializeEngine'

import { Network } from '../../src/networking/classes/Network'
import { TestNetwork } from './TestNetwork'
import { EngineSystemPresets } from '../../src/initializationOptions'
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

  it('should', () => {

  })

})
