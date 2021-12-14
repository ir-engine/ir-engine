import assert, { strictEqual } from 'assert'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createWorld } from '../../../src/ecs/classes/World'
import { addComponent } from '../../../src/ecs/functions/ComponentFunctions'
import { createEntity } from '../../../src/ecs/functions/EntityFunctions'
import { Network } from '../../../src/networking/classes/Network'
import { NetworkObjectComponent } from '../../../src/networking/components/NetworkObjectComponent'
import IncomingNetworkSystem, { applyIncomingActions } from '../../../src/networking/systems/IncomingNetworkSystem'
import { Quaternion, Vector3 } from 'three'
import { TransformComponent } from '../../../src/transform/components/TransformComponent'
import { VelocityComponent } from '../../../src/physics/components/VelocityComponent'
import { TestNetwork } from '../TestNetwork'
import { Engine } from '../../../src/ecs/classes/Engine'
import { WorldStateInterface, WorldStateModel } from '../../../src/networking/schema/networkSchema'

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
    Engine.hasJoinedWorld = true
		
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
			ownerId: '0' as UserId,
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
					ownerId: '0' as UserId,
					networkId: 0 as NetworkId,
					position: newPosition.toArray(),
					rotation: newRotation.toArray(),
					linearVelocity: [],
					angularVelocity: [],
				}
			],
			controllerPose: [],
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