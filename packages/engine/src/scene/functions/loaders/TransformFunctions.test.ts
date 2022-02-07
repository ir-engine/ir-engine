import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import assert from 'assert'
import { Euler, Quaternion } from 'three'
import { Engine } from '../../../ecs/classes/Engine'
import { createWorld } from '../../../ecs/classes/World'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { deserializeTransform } from './TransformFunctions'

// need to control for rounding point errors with SoA
const EPSILON = 10e-5

describe('TransformFunctions', () => {
  it('deserializeTransform', () => {
    const world = createWorld()
    Engine.currentWorld = world
    const entity = createEntity()

    const quat = new Quaternion().random()
    const euler = new Euler().setFromQuaternion(quat, 'XYZ')
    const sceneComponentData = {
      position: { x: 1, y: 2, z: 3 },
      rotation: { x: euler.x, y: euler.y, z: euler.z },
      scale: { x: 0.1, y: 0.2, z: 0.3 }
    }
    const sceneComponent: ComponentJson = {
      name: 'transform',
      props: sceneComponentData
    }

    deserializeTransform(entity, sceneComponent)

    assert(hasComponent(entity, TransformComponent))
    const { position, rotation, scale } = getComponent(entity, TransformComponent)
    assert.equal(position.x, 1)
    assert.equal(position.y, 2)
    assert.equal(position.z, 3)

    // must compare absolute as negative quaternions represent equivalent rotations
    assert(Math.abs(rotation.x) - Math.abs(quat.x) < EPSILON)
    assert(Math.abs(rotation.y) - Math.abs(quat.y) < EPSILON)
    assert(Math.abs(rotation.z) - Math.abs(quat.z) < EPSILON)
    assert(Math.abs(rotation.w) - Math.abs(quat.w) < EPSILON)

    assert(scale.x - 0.1 < EPSILON)
    assert(scale.y - 0.2 < EPSILON)
    assert(scale.z - 0.3 < EPSILON)
  })
})
