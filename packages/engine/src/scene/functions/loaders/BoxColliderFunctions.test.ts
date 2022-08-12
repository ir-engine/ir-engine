import assert from 'assert'
import { Quaternion, Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

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
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import {
  deserializeBoxCollider,
  parseBoxColliderProperties,
  SCENE_COMPONENT_BOX_COLLIDER,
  SCENE_COMPONENT_BOX_COLLIDER_DEFAULT_VALUES,
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

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_BOX_COLLIDER,
    props: sceneComponentData
  }

  describe('deserializeBoxCollider()', () => {
    it('creates RigidBodyComponent and RigidBodyFixedTagComponent', () => {
      deserializeBoxCollider(entity, sceneComponent)

      assert(hasComponent(entity, RigidBodyComponent))
      assert(hasComponent(entity, RigidBodyFixedTagComponent))
    })

    it('will include this component into EntityNodeComponent', () => {
      addComponent(entity, EntityNodeComponent, { components: [] })

      deserializeBoxCollider(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_BOX_COLLIDER))
    })

    it('creates Object3d Component', () => {
      deserializeBoxCollider(entity, sceneComponent)
      assert(getComponent(entity, Object3DComponent)?.value)
    })
  })

  describe('updateBoxCollider()', () => {
    it('should not update collider body', () => {
      deserializeBoxCollider(entity, sceneComponent)
      updateBoxCollider(entity, { isTrigger: true })

      const body = getComponent(entity, RigidBodyComponent).body
      const transform = getComponent(entity, TransformComponent)
      assert(vector3EqualsEpsilon(body.translation() as Vector3, transform.position))
      assert(quaternionEqualsEpsilon(body.rotation() as Quaternion, transform.rotation))
    })
  })

  describe('serializeBoxCollider()', () => {
    it('should properly serialize boxcollider', () => {
      deserializeBoxCollider(entity, sceneComponent)
      assert.deepEqual(serializeBoxCollider(entity), {
        ...sceneComponent,
        props: { isTrigger: sceneComponentData.isTrigger }
      })
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
