import assert, { strictEqual } from 'assert'
import { Engine } from '../../../src/ecs/classes/Engine'
import { Network } from '../../../src/networking/classes/Network'
import OutgoingNetworkSystem, { queueEntityTransform, queueUnchangedPosesClient, queueUnchangedPosesServer } from '../../../src/networking/systems/OutgoingNetworkSystem'
import { createWorld } from '../../../src/ecs/classes/World'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createEntity } from '../../../src/ecs/functions/EntityFunctions'
import { addComponent } from '../../../src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../../src/transform/components/TransformComponent'
import { Quaternion, Vector3 } from 'three'
import { NetworkObjectComponent } from '../../../src/networking/components/NetworkObjectComponent'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { TestNetwork } from '../TestNetwork'
import { WorldStateModel } from '../../../src/networking/schema/networkSchema'
import { TestNetworkTransport, TestNetworkTransportHandler } from '../TestNetworkTransport'

describe('OutgoingNetworkSystem Integration Tests', async () => {
	
  let world

	beforeEach(() => {
    /* hoist */
		Network.instance = new TestNetwork()
    Network.instance.transportHandler = new TestNetworkTransportHandler()
		world = createWorld()
		Engine.currentWorld = world
		Engine.isInitialized = true
	})

  it('should serialize and send poses', async () => {
    /* mock */
    // make this engine user the host (world.isHosting === true)
    Engine.userId = world.hostId
    Engine.hasJoinedWorld = true

    world.clients.set(Engine.userId, {
      userId: Engine.userId,
      name: Engine.userId,
      subscribedChatUpdates: []
    })

		const entity = createEntity()
		const transform = addComponent(entity, TransformComponent, {
			position: new Vector3(1,2,3),
			rotation: new Quaternion(),
			scale: new Vector3(),
		})
		const networkObject = addComponent(entity, NetworkObjectComponent, {
      // the host is the owner
			ownerId: Engine.userId as UserId,
			networkId: 0 as NetworkId,
			prefab: '',
			parameters: {},
		})

    /* run */
    // todo: passing world into the constructor makes the system stateful
    // ideally we want stateless systems
    const outgoingNetworkSystem = await OutgoingNetworkSystem(world)

    outgoingNetworkSystem()

    /* assert */
    const datum = (Network.instance.transportHandler.getWorldTransport() as TestNetworkTransport).getSentData()
    strictEqual(datum.length, 1)

    const data0 = WorldStateModel.fromBuffer(datum[0])
    strictEqual(data0.pose[0].position[0], 1)
    strictEqual(data0.pose[0].position[1], 2)
    strictEqual(data0.pose[0].position[2], 3)
  })

})