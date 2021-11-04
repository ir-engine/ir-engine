import assert, { strictEqual } from 'assert'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Vector3, Quaternion } from 'three'
import { Engine } from '../src/ecs/classes/Engine'
import { createEntity } from '../src/ecs/functions/EntityFunctions'
import { Network } from '../src/networking/classes/Network'
import { NetworkObjectComponent } from '../src/networking/components/NetworkObjectComponent'
import { WorldStateInterface, WorldStateModel } from '../src/networking/schema/networkSchema'
import IncomingNetworkSystem from '../src/networking/systems/IncomingNetworkSystem'
import { VelocityComponent } from '../src/physics/components/VelocityComponent'
import { TransformComponent } from '../src/transform/components/TransformComponent'
import { TestNetwork } from './networking/TestNetwork'
import { createWorld } from '../src/ecs/classes/World'
import { addComponent } from '../src/ecs/functions/ComponentFunctions'
import { createQuaternionProxy, createVector3Proxy } from '../src/common/proxies/three'

describe('Structure of Array Synchronization', () => {
	it('should synchronize values between transform objects and SoA data', () => {
		/* mock */
    Engine.currentWorld = createWorld()

		const entity = createEntity()
		const transform = addComponent(entity, TransformComponent, {
			position: createVector3Proxy(TransformComponent.position, entity).set(1,2,3),
			rotation: createQuaternionProxy(TransformComponent.rotation, entity).set(1,2,3,4),
			scale: new Vector3(),
		})

		/* assert */
		assert.strictEqual(transform.position.x, TransformComponent.position.x[entity])
		assert.strictEqual(transform.position.y, TransformComponent.position.y[entity])
		assert.strictEqual(transform.position.z, TransformComponent.position.z[entity])

		assert.strictEqual(transform.rotation.x, TransformComponent.rotation.x[entity])
		assert.strictEqual(transform.rotation.y, TransformComponent.rotation.y[entity])
		assert.strictEqual(transform.rotation.z, TransformComponent.rotation.z[entity])
		assert.strictEqual(transform.rotation.w, TransformComponent.rotation.w[entity])
	})
})