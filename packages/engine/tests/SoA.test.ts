import assert from 'assert'
import { Vector3 } from 'three'
import { Engine } from '../src/ecs/classes/Engine'
import { createEntity } from '../src/ecs/functions/EntityFunctions'
import { TransformComponent } from '../src/transform/components/TransformComponent'
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