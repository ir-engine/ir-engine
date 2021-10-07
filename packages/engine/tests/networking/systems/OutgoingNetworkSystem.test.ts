import { initializeEngine, shutdownEngine } from '../../../src/initializeEngine'
import { Engine } from '../../../src/ecs/classes/Engine'
import { engineTestSetup } from '../../util/setupEngine'
import assert, { strictEqual } from 'assert'
import { Network } from '../../../src/networking/classes/Network'
import { forwardIncomingActionsFromOthersIfHost, rerouteActions, sendActionsOnTransport } from '../../../src/networking/systems/OutgoingNetworkSystem'
import { CreateWorld, World } from '../../../src/ecs/classes/World'
import { Action, ActionRecipients } from '../../../src/networking/interfaces/Action'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { NetworkWorldAction } from '../../../src/networking/functions/NetworkWorldAction'
import matches from 'ts-matches'

describe('OutgoingNetworkSystem Unit Tests', () => {
  it('should forwardIncomingActionsFromOthersIfHost', () => {
		/* mock */
		const world = World[CreateWorld]()

    // make this engine user the host
    // world.isHosting === true
    Engine.userId = world.hostId

		const tick = 0

		world.fixedTick = tick

		const action = NetworkWorldAction.spawnObject({
      userId: '0' as UserId,
			prefab: '',
			parameters: {},
			$tick: tick,
      // make action come from another user
			$from: '2' as UserId,
      // send to server
			$to: 'server' as ActionRecipients,
		})
		
		world.incomingActions.add(action)

		// const recepted: typeof action[] = []
		// world.receptors.add(
		// 	(a) => matches(a).when(NetworkWorldAction.spawnObject.matches, (a) => recepted.push(a))
		// )

		/* run */
    forwardIncomingActionsFromOthersIfHost(world)

		/* assert */
    strictEqual(world.incomingActions.size, 0)
    strictEqual(world.outgoingActions.size, 1)
  })
})

describe('OutgoingNetworkSystem Integration Tests', () => {
  it('should ', () => {
    
  })
})