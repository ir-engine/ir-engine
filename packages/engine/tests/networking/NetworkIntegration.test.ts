import assert from 'assert'
import { Network } from '../../src/networking/classes/Network'
import { TestNetworkTransport } from './TestNetworkTransport'

describe('Network Integration Tests', () => {
   before(() => {
       // const testNetworkInstance = new TestNetwork()
       Network.instance.transport = new TestNetworkTransport()
   })
   it('should IncomingNetworkingSystem & OutgoingNetworkSystem', () => {

   })
})