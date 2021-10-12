import assert, { strictEqual } from 'assert'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createWorld } from '../../../src/ecs/classes/World'
import { addComponent, getComponent, hasComponent } from '../../../src/ecs/functions/ComponentFunctions'
import { createEntity } from '../../../src/ecs/functions/EntityFunctions'
import { Network } from '../../../src/networking/classes/Network'
import { NetworkObjectComponent } from '../../../src/networking/components/NetworkObjectComponent'
import { WorldStateInterface, WorldStateModel } from '../../../src/networking/schema/networkSchema'
import IncomingNetworkSystem, { applyDelayedActions, applyIncomingActions } from '../../../src/networking/systems/IncomingNetworkSystem'
import { NetworkWorldAction } from '../../../src/networking/functions/NetworkWorldAction'
import { Quaternion, Vector3 } from 'three'
import { TransformComponent } from '../../../src/transform/components/TransformComponent'
import { Action, ActionRecipients } from '../../../src/networking/interfaces/Action'
import matches from 'ts-matches'
import { VelocityComponent } from '../../../src/physics/components/VelocityComponent'
import { TestNetworkTransport } from '../TestNetworkTransport'
import { TestNetwork } from '../TestNetwork'
import { Engine } from '../../../src/ecs/classes/Engine'

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
			world.receptors.add(
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
			world.receptors.add(
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
			world.receptors.add(
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

describe('IncomingNetworkSystem Integration Tests', async () => {
	
	let world

	beforeEach(() => {
    /* hoist */
		Network.instance = new TestNetwork()
		world = createWorld()
		Engine.currentWorld = world
	})

	it('should apply pose state to an entity from World.incomingMessageQueueUnreliable', async () => {
		/* mock */

		// make this engine user the host (world.isHosting === true)
    Engine.userId = world.hostId
		
		// mock entity to apply incoming unreliable updates to
		const entity = createEntity()
		const transform = addComponent(entity, TransformComponent, {
			position: new Vector3(),
			rotation: new Quaternion(),
			scale: new Vector3(),
		})
		const velocity = addComponent(entity, VelocityComponent, {
			velocity: new Vector3()
		})
		const networkObject = addComponent(entity, NetworkObjectComponent, {
			userId: '0' as UserId,
			networkId: 0 as NetworkId,
			prefab: '',
			parameters: {},
		})

		// mock incoming server data
		const newPosition = new Vector3(1,2,3)
		const newRotation = new Quaternion(1,2,3,4)
		
		const newWorldState: WorldStateInterface = {
			tick: 0,
			time: Date.now(),
			pose: [
				{
					networkId: 0 as NetworkId,
					position: newPosition.toArray(),
					rotation: newRotation.toArray(),
					linearVelocity: [],
					angularVelocity: [],
				}
			],
			ikPose: [],
      handsPose: []
		}

		const buffer = WorldStateModel.toBuffer(newWorldState)
		
		// todo: Network.instance should ideally be passed into the system as a parameter dependency,
		// instead of an import dependency , but this works for now
		Network.instance.incomingMessageQueueUnreliable.add(buffer)
		Network.instance.incomingMessageQueueUnreliableIDs.add(Engine.userId)
		
		/* run */
		const incomingNetworkSystem = await IncomingNetworkSystem(world)
		
		incomingNetworkSystem()
		
		/* assert */
		assert(transform.position.equals(newPosition))
	})
})