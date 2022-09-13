import assert from 'assert'
import { Matrix4, Vector3 } from 'three'

import { proxifyQuaternion, proxifyVector3 } from '../src/common/proxies/createThreejsProxy'
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
      proxifyVector3(TransformComponent.position, entity).set(1, 2, 3),
      proxifyQuaternion(TransformComponent.rotation, entity).set(1, 2, 3, 4)
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
