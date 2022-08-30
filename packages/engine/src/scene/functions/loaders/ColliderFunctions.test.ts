import assert from 'assert'
import { Quaternion, Vector3 } from 'three'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { Physics } from '../../../physics/classes/Physics'
import { RigidBodyComponent, RigidBodyFixedTagComponent } from '../../../physics/components/RigidBodyComponent'
import { CollisionGroups, DefaultCollisionMask } from '../../../physics/enums/CollisionGroups'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES } from '../../components/ColliderComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { deserializeCollider, parseColliderProperties, serializeCollider } from './ColliderFunctions'

describe('ColliderFunctions', () => {
  // let entity: Entity
  // beforeEach(async () => {
  //   createEngine()
  //   entity = createEntity()
  //   addComponent(entity, TransformComponent, {
  //     position: new Vector3(Math.random(), Math.random(), Math.random()),
  //     rotation: new Quaternion(Math.random(), Math.random(), Math.random(), Math.random()),
  //     scale: new Vector3(Math.random(), Math.random(), Math.random())
  //   })
  //   await Physics.load()
  //   Engine.instance.currentWorld.physicsWorld = Physics.createWorld()
  // })
  // const sceneComponentData = {
  //   isTrigger: true,
  //   removeMesh: true,
  //   collisionLayer: DefaultCollisionMask,
  //   collisionMask: CollisionGroups.Avatars
  // }
  // describe('deserializeBoxCollider()', () => {
  //   it('creates RigidBodyComponent and RigidBodyFixedTagComponent', () => {
  //     deserializeCollider(entity, sceneComponentData)
  //     assert(hasComponent(entity, RigidBodyComponent))
  //     assert(hasComponent(entity, RigidBodyFixedTagComponent))
  //   })
  //   it('creates Object3d Component', () => {
  //     deserializeCollider(entity, sceneComponentData)
  //     assert(getComponent(entity, Object3DComponent)?.value)
  //   })
  // })
  // describe('serializeBoxCollider()', () => {
  //   it('should properly serialize boxcollider', () => {
  //     deserializeCollider(entity, sceneComponentData)
  //     assert.deepEqual(serializeCollider(entity), { isTrigger: sceneComponentData.isTrigger })
  //   })
  //   it('should return undefine if there is no boxcollider component', () => {
  //     assert(serializeCollider(entity) === undefined)
  //   })
  // })
  // describe('parseBoxColliderProperties()', () => {
  //   it('should use default component values', () => {
  //     const componentData = parseColliderProperties({})
  //     assert.deepEqual(componentData, SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES)
  //   })
  //   it('should use passed values', () => {
  //     const componentData = parseColliderProperties({ ...sceneComponentData })
  //     assert.deepEqual(componentData, sceneComponentData)
  //   })
  // })
})
