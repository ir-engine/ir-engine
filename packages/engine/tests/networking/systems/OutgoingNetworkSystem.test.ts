import assert, { strictEqual } from 'assert'
import { Engine } from '../../../src/ecs/classes/Engine'
import { Network } from '../../../src/networking/classes/Network'
import OutgoingNetworkSystem from '../../../src/networking/systems/OutgoingNetworkSystem'
import { createWorld, World } from '../../../src/ecs/classes/World'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createEntity } from '../../../src/ecs/functions/EntityFunctions'
import { addComponent } from '../../../src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../../src/transform/components/TransformComponent'
import { Vector3 } from 'three'
import { NetworkObjectComponent } from '../../../src/networking/components/NetworkObjectComponent'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { TestNetwork } from '../TestNetwork'
import { deserialize } from '../../../src/networking/systems/IncomingNetworkSystem'
import { createQuaternionProxy, createVector3Proxy } from '../../../src/common/proxies/three'

describe('OutgoingNetworkSystem Integration Tests', async () => {
	
  let world

	beforeEach(() => {
    /* hoist */
		Network.instance = new TestNetwork()
		world = createWorld()
		Engine.currentWorld = world
	})

  it('should serialize and send poses', async () => {
    /* mock */
    // make this engine user the host (world.isHosting === true)
    Engine.userId = world.hostId

		const entity = createEntity()
    
		const transform = addComponent(entity, TransformComponent, {
			position: createVector3Proxy(TransformComponent.position, entity),
			rotation: createQuaternionProxy(TransformComponent.rotation, entity),
			scale: new Vector3(),
		})
    
    transform.position.set(1,2,3)

		const networkObject = addComponent(entity, NetworkObjectComponent, {
      // the host is the owner
			userId: Engine.userId as UserId,
			networkId: 0 as NetworkId,
			prefab: '',
			parameters: {},
		})

    /* run */
    // todo: passing world into the constructor makes the system stateful
    // ideally we want stateless systems
    const outgoingNetworkSystem = await OutgoingNetworkSystem(world)

    outgoingNetworkSystem()

    const datum = (Network.instance as TestNetwork).transport.getSentData()
    
    const packet = datum[0]
    
    transform.position.set(0,0,0)
    
    const deserializedEntities = deserialize(world, packet)
    
    /* assert */
    strictEqual(datum.length, 1)
    strictEqual(packet.byteLength, 139)
    
    strictEqual(deserializedEntities.length, 1)
    strictEqual(deserializedEntities[0], entity)

    strictEqual(TransformComponent.position.x[entity], 1)
    strictEqual(TransformComponent.position.y[entity], 2)
    strictEqual(TransformComponent.position.z[entity], 3)

    strictEqual(transform.position.x, 1)
    strictEqual(transform.position.y, 2)
    strictEqual(transform.position.z, 3)

  })

})