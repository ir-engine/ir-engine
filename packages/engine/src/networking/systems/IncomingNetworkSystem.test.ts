import assert, { strictEqual } from 'assert'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createWorld } from '../../../src/ecs/classes/World'
import { applyDelayedActions, applyIncomingActions } from '../../../src/networking/systems/IncomingNetworkSystem'
import { NetworkWorldAction } from '../../../src/networking/functions/NetworkWorldAction'
import { ActionRecipients } from '../../../src/networking/interfaces/Action'
import matches from 'ts-matches'

describe('IncomingNetworkSystem Unit Tests', async () => {

	describe('applyDelayedActions', () => {
		
		it('should drain world.delayedActions into all receptors', () => {

			/* mock */
			const world = createWorld()
	
			const tick = 0
	
			world.fixedTick = tick
	
			const action = NetworkWorldAction.spawnObject({
				userId: '0' as UserId,
				prefab: '',
				parameters: {},
				$tick: tick,
				$from: world.hostId,
				$to: '0' as ActionRecipients,
			})
			
			world.delayedActions.add(action)
	
			const recepted: typeof action[] = []
			world.receptors.push(
				(a) => matches(a).when(NetworkWorldAction.spawnObject.matches, (a) => recepted.push(a))
			)
	
			/* run */
			applyDelayedActions(world)
	
			/* assert */
			strictEqual(world.delayedActions.size, 0)
			strictEqual(recepted.length, 1)
	
			const receptedAction = recepted[0]
			strictEqual(receptedAction.userId, "0")

		})
	
	})
	
	describe('applyIncomingActions', () => {

		it('should delay incoming action from the future', () => {

			/* mock */
			const world = createWorld()

			// fixed tick in past
			world.fixedTick = 0

			const action = NetworkWorldAction.spawnObject({
				userId: '0' as UserId,
				prefab: '',
				parameters: {},
				// incoming action from future
				$tick: 1,
				$from: world.hostId,
				$to: '0' as ActionRecipients,
			})
			
			world.incomingActions.add(action)

			const recepted: typeof action[] = []
			world.receptors.push(
				(a) => matches(a).when(NetworkWorldAction.spawnObject.matches, (a) => recepted.push(a))
			)

			/* run */
			applyIncomingActions(world)

			/* assert */
			strictEqual(world.delayedActions.size, 1)
			strictEqual(recepted.length, 0)

		})

		it('should immediately apply incoming action from the past or present', () => {
	
			/* mock */
			const world = createWorld()
	
			// fixed tick in future
			world.fixedTick = 1
	
			const action = NetworkWorldAction.spawnObject({
				userId: '0' as UserId,
				prefab: '',
				parameters: {},
				// incoming action from past
				$tick: 0,
				$from: world.hostId,
				$to: '0' as ActionRecipients,
			})
			
			world.incomingActions.add(action)
	
			const recepted: typeof action[] = []
			world.receptors.push(
				(a) => matches(a).when(NetworkWorldAction.spawnObject.matches, (a) => recepted.push(a))
			)
	
			/* run */
			applyIncomingActions(world)
	
			/* assert */
			strictEqual(world.delayedActions.size, 0)
			strictEqual(recepted.length, 1)
	
		})

	})

})
