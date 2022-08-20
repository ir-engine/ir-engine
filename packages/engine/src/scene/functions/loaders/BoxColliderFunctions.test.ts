import assert from 'assert'
import { Quaternion, Vector3 } from 'three'

import { quaternionEqualsEpsilon, vector3EqualsEpsilon } from '../../../../tests/util/MathTestUtils'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { Physics } from '../../../physics/classes/Physics'
import { RigidBodyComponent } from '../../../physics/components/RigidBodyComponent'
import { RigidBodyFixedTagComponent } from '../../../physics/components/RigidBodyFixedTagComponent'
import { CollisionGroups, DefaultCollisionMask } from '../../../physics/enums/CollisionGroups'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { SCENE_COMPONENT_BOX_COLLIDER_DEFAULT_VALUES } from '../../components/BoxColliderComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import {
  deserializeBoxCollider,
  parseBoxColliderProperties,
  serializeBoxCollider,
  updateBoxCollider
} from './BoxColliderFunctions'

describe('BoxColliderFunctions', () => {
  let entity: Entity

  beforeEach(async () => {
    createEngine()
    entity = createEntity()
    addComponent(entity, TransformComponent, {
      position: new Vector3(Math.random(), Math.random(), Math.random()),
      rotation: new Quaternion(Math.random(), Math.random(), Math.random(), Math.random()),
      scale: new Vector3(Math.random(), Math.random(), Math.random())
    })
    await Physics.load()
    Engine.instance.currentWorld.physicsWorld = Physics.createWorld()
  })

  const sceneComponentData = {
    isTrigger: true,
    removeMesh: true,
    collisionLayer: DefaultCollisionMask,
    collisionMask: CollisionGroups.Avatars
  }

  describe('deserializeBoxCollider()', () => {
    it('creates RigidBodyComponent and RigidBodyFixedTagComponent', () => {
      deserializeBoxCollider(entity, sceneComponentData)

      assert(hasComponent(entity, RigidBodyComponent))
      assert(hasComponent(entity, RigidBodyFixedTagComponent))
    })

    it('creates Object3d Component', () => {
      deserializeBoxCollider(entity, sceneComponentData)
      assert(getComponent(entity, Object3DComponent)?.value)
    })
  })

  describe('serializeBoxCollider()', () => {
    it('should properly serialize boxcollider', () => {
      deserializeBoxCollider(entity, sceneComponentData)
      assert.deepEqual(serializeBoxCollider(entity), { isTrigger: sceneComponentData.isTrigger })
    })

    it('should return undefine if there is no boxcollider component', () => {
      assert(serializeBoxCollider(entity) === undefined)
    })
  })

  describe('parseBoxColliderProperties()', () => {
    it('should use default component values', () => {
      const componentData = parseBoxColliderProperties({})
      assert.deepEqual(componentData, SCENE_COMPONENT_BOX_COLLIDER_DEFAULT_VALUES)
    })

    it('should use passed values', () => {
      const componentData = parseBoxColliderProperties({ ...sceneComponentData })
      assert.deepEqual(componentData, sceneComponentData)
    })
  })
})
