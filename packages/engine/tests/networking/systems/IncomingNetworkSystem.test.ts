import assert, { strictEqual } from 'assert'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { World, CreateWorld } from '../../../src/ecs/classes/World'
import { addComponent, getComponent } from '../../../src/ecs/functions/ComponentFunctions'
import { createEntity } from '../../../src/ecs/functions/EntityFunctions'
import { Network } from '../../../src/networking/classes/Network'
import { NetworkObjectComponent } from '../../../src/networking/components/NetworkObjectComponent'
import { WorldStateInterface, WorldStateModel } from '../../../src/networking/schema/networkSchema'
import IncomingNetworkSystem, { applyDelayedActions } from '../../../src/networking/systems/IncomingNetworkSystem'
import { NetworkWorldAction } from '../../../src/networking/functions/NetworkWorldAction'
import { Quaternion, Vector3 } from 'three'
import { TransformComponent } from '../../../src/transform/components/TransformComponent'
import { Action, ActionRecipients } from '../../../src/networking/interfaces/Action'
import matches from 'ts-matches'
import { VelocityComponent } from '../../../src/physics/components/VelocityComponent'

describe('IncomingNetworkSystem Unit Tests', async () => {
	it('should apply delayed actions', () => {
		/* mock */
		const world = World[CreateWorld]()

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

describe('IncomingNetworkSystem Integration Tests', async () => {
	it('should apply pose state to an avatar from World.incomingMessageQueueUnreliable', async () => {
		
		/* mock */
		
		// mock avatar entity to apply incoming unreliable updates to
		const world = World[CreateWorld]()
		const action = NetworkWorldAction.spawnAvatar({
			userId: '0' as UserId,
			parameters: {
				position: new Vector3(),
				rotation: new Quaternion(),
			},
		})
		const entity = createEntity(world)
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

		// mock incoming data that would be coming from the server
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
			ikPose: []
		}

		const buffer = WorldStateModel.toBuffer(newWorldState)
		
		// todo: Network should ideally be passed into the system as a parameter dependency,
		// instead of an import dependency, but this works for now
		console.log(Network.instance)
		Network.instance.incomingMessageQueueUnreliable.add(buffer)
		Network.instance.incomingMessageQueueUnreliableIDs.add("0")
		
		/* run */
		const incomingNetworkSystem = await IncomingNetworkSystem(world)
		
		incomingNetworkSystem()
		
		/* assert */
		assert(transform.position.equals(newPosition))
	})
})