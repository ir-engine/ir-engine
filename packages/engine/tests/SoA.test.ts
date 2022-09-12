import assert from 'assert'
import { Matrix4, Vector3 } from 'three'

import { createQuaternionProxy, createVector3Proxy } from '../src/common/proxies/three'
import { addComponent } from '../src/ecs/functions/ComponentFunctions'
import { createEntity } from '../src/ecs/functions/EntityFunctions'
import { createEngine } from '../src/initializeEngine'
import { setTransformComponent, TransformComponent } from '../src/transform/components/TransformComponent'

describe('Structure of Array Synchronization', () => {
  it('should synchronize values between transform objects and SoA data', () => {
    /* mock */
    createEngine()

    const entity = createEntity()
    const transform = setTransformComponent(
      entity,
      createVector3Proxy(TransformComponent.position, entity).set(1, 2, 3),
      createQuaternionProxy(TransformComponent.rotation, entity).set(1, 2, 3, 4)
    )

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
