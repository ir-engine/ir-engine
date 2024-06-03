/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { RigidBodyType, ShapeType, World } from '@dimforge/rapier3d-compat'
import assert from 'assert'
import { Quaternion, Vector3 } from 'three'

import { getComponent, removeComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import { createEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { getMutableState, getState } from '@etherealengine/hyperflux'

import { ObjectDirection, Vector3_Zero } from '../../common/constants/MathConstants'
import { createEngine } from '../../initializeEngine'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { computeTransformMatrix } from '../../transform/systems/TransformSystem'
import { ColliderComponent } from '../components/ColliderComponent'
import { CollisionComponent } from '../components/CollisionComponent'
import {
  RigidBodyComponent,
  RigidBodyFixedTagComponent,
  getTagComponentForRigidBody
} from '../components/RigidBodyComponent'
import { TriggerComponent } from '../components/TriggerComponent'
import { AllCollisionMask, CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'
import { getInteractionGroups } from '../functions/getInteractionGroups'
import { PhysicsState } from '../state/PhysicsState'

import { SystemDefinitions, UndefinedEntity, removeEntity } from '@etherealengine/ecs'
import { PhysicsSystem } from '../PhysicsModule'
import { BodyTypes, ColliderDescOptions, CollisionEvents, SceneQueryType, Shapes } from '../types/PhysicsTypes'
import { Physics } from './Physics'

function assertFloatApproxEq(A: number, B: number, epsilon = 0.001) {
  assert.ok(Math.abs(A - B) < epsilon, `Numbers are not approximately equal:  ${A} : ${B} : ${A - B}`)
}

function assertFloatApproxNotEq(A: number, B: number, epsilon = 0.001) {
  assert.ok(Math.abs(A - B) > epsilon, `Numbers are approximately equal:  ${A} : ${B} : ${A - B}`)
}

export const boxDynamicConfig = {
  shapeType: ShapeType.Cuboid,
  bodyType: RigidBodyType.Fixed,
  collisionLayer: CollisionGroups.Default,
  collisionMask: DefaultCollisionMask | CollisionGroups.Avatars | CollisionGroups.Ground,
  friction: 1,
  restitution: 0,
  isTrigger: false,
  spawnPosition: new Vector3(0, 0.25, 5),
  spawnScale: new Vector3(0.5, 0.25, 0.5)
} as ColliderDescOptions

describe('Physics', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    const physicsWorld = Physics.createWorld()
    getMutableState(PhysicsState).physicsWorld.set(physicsWorld)
    physicsWorld.timestep = 1 / 60
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should create & remove rigidBody', async () => {
    const physicsWorld = getState(PhysicsState).physicsWorld

    const entity = createEntity()
    setComponent(entity, TransformComponent)
    setComponent(entity, RigidBodyComponent, { type: BodyTypes.Dynamic })
    setComponent(entity, ColliderComponent, { shape: Shapes.Sphere })

    assert.deepEqual(physicsWorld.bodies.len(), 1)
    assert.deepEqual(physicsWorld.colliders.len(), 1)

    removeComponent(entity, RigidBodyComponent)

    assert.deepEqual(physicsWorld.bodies.len(), 0)
  })

  it('component type should match rigid body type', async () => {
    const entity = createEntity()

    setComponent(entity, TransformComponent)
    setComponent(entity, RigidBodyComponent, { type: BodyTypes.Fixed })
    setComponent(entity, ColliderComponent, { shape: Shapes.Sphere })

    const rigidBodyComponent = getTagComponentForRigidBody(BodyTypes.Fixed)
    assert.deepEqual(rigidBodyComponent, RigidBodyFixedTagComponent)
  })

  // it('should create collider desc from input config data', async () => {
  //   const geometry = new BoxGeometry(1, 1, 1)
  //   const material = new MeshBasicMaterial()
  //   const mesh = new Mesh(geometry, material)
  //   mesh.translateX(10)
  //   mesh.rotateX(3.1415918)
  //   mesh.updateMatrixWorld(true)

  //   const collisionGroup = 0x0001
  //   const collisionMask = 0x0003
  //   boxDynamicConfig.collisionLayer = collisionGroup
  //   boxDynamicConfig.collisionMask = collisionMask
  //   boxDynamicConfig.isTrigger = true

  //   const boxColliderDesc = Physics.createColliderDescFromMesh(mesh, boxDynamicConfig)!
  //   const interactionGroups = getInteractionGroups(collisionGroup, collisionMask)

  //   assert.deepEqual(boxColliderDesc.shape.type, boxDynamicConfig.shapeType)
  //   assert.deepEqual(boxColliderDesc.collisionGroups, interactionGroups)
  //   assert.deepEqual(boxColliderDesc.isSensor, boxDynamicConfig.isTrigger)
  //   assert.deepEqual(boxColliderDesc.friction, boxDynamicConfig.friction)
  //   assert.deepEqual(boxColliderDesc.restitution, boxDynamicConfig.restitution)
  //   assert.deepEqual(boxColliderDesc.activeEvents, ActiveEvents.COLLISION_EVENTS)
  //   assert.deepEqual(boxColliderDesc.activeCollisionTypes, ActiveCollisionTypes.ALL)
  //   assert.deepEqual(boxColliderDesc.translation.x, 0)
  //   assert.deepEqual(boxColliderDesc.translation.y, 0)
  //   assert.deepEqual(boxColliderDesc.translation.z, 0)
  //   assert.deepEqual(boxColliderDesc.rotation.x, 0)
  //   assert.deepEqual(boxColliderDesc.rotation.y, 0)
  //   assert.deepEqual(boxColliderDesc.rotation.z, 0)
  //   assert.deepEqual(boxColliderDesc.rotation.w, 1)
  // })

  // it('should create collider desc from input config data in nested mesh', async () => {
  //   const geometry = new BoxGeometry(1, 1, 1)
  //   const material = new MeshBasicMaterial()
  //   const root = new Mesh(geometry, material)
  //   const mesh = new Mesh(geometry, material)
  //   root.add(mesh)
  //   mesh.position.set(1, 2, 3)
  //   mesh.rotateX(3.1415918)
  //   mesh.updateMatrixWorld(true)

  //   const collisionGroup = 0x0001
  //   const collisionMask = 0x0003
  //   boxDynamicConfig.collisionLayer = collisionGroup
  //   boxDynamicConfig.collisionMask = collisionMask
  //   boxDynamicConfig.isTrigger = true

  //   const boxColliderDesc = Physics.createColliderDescFromMesh(mesh, boxDynamicConfig, root)!
  //   const interactionGroups = getInteractionGroups(collisionGroup, collisionMask)

  //   assert.deepEqual(boxColliderDesc.shape.type, boxDynamicConfig.shapeType)
  //   assert.deepEqual(boxColliderDesc.collisionGroups, interactionGroups)
  //   assert.deepEqual(boxColliderDesc.isSensor, boxDynamicConfig.isTrigger)
  //   assert.deepEqual(boxColliderDesc.friction, boxDynamicConfig.friction)
  //   assert.deepEqual(boxColliderDesc.restitution, boxDynamicConfig.restitution)
  //   assert.deepEqual(boxColliderDesc.activeEvents, ActiveEvents.COLLISION_EVENTS)
  //   assert.deepEqual(boxColliderDesc.activeCollisionTypes, ActiveCollisionTypes.ALL)
  //   assert.deepEqual(boxColliderDesc.translation.x, mesh.position.x)
  //   assert.deepEqual(boxColliderDesc.translation.y, mesh.position.y)
  //   assert.deepEqual(boxColliderDesc.translation.z, mesh.position.z)
  //   assert.deepEqual(boxColliderDesc.rotation.x, mesh.quaternion.x)
  //   assert.deepEqual(boxColliderDesc.rotation.y, mesh.quaternion.y)
  //   assert.deepEqual(boxColliderDesc.rotation.z, mesh.quaternion.z)
  //   assert.deepEqual(boxColliderDesc.rotation.w, mesh.quaternion.w)
  // })

  // it('should change rigidBody type', async () => {
  //   const physicsWorld = getState(PhysicsState).physicsWorld

  //   const entity = createEntity()
  //   setComponent(entity, TransformComponent)
  //   setComponent(entity, RigidBodyComponent, { type: BodyTypes.Dynamic })

  //   const rigidBodyDesc = RigidBodyDesc.dynamic()
  //   const colliderDesc = ColliderDesc.ball(1)

  //   const rigidBody = Physics.createRigidBody(entity, physicsWorld, rigidBodyDesc)
  //   physicsWorld.createCollider(colliderDesc, rigidBody)

  //   assert.deepEqual(physicsWorld.bodies.len(), 1)
  //   assert.deepEqual(rigidBody.bodyType(), RigidBodyType.Dynamic)

  //   Physics.setRigidBodyType(entity, BodyTypes.Fixed)
  //   assert.deepEqual(rigidBody.bodyType(), RigidBodyType.Fixed)
  // })

  it('should create accurate InteractionGroups', async () => {
    const collisionGroup = 0x0001
    const collisionMask = 0x0003
    const interactionGroups = getInteractionGroups(collisionGroup, collisionMask)

    assert.deepEqual(interactionGroups, 65539)
  })

  it('should generate a collision event', async () => {
    const physicsWorld = getState(PhysicsState).physicsWorld

    const entity1 = createEntity()
    const entity2 = createEntity()
    setComponent(entity1, TransformComponent)
    setComponent(entity2, TransformComponent)

    setComponent(entity1, RigidBodyComponent, { type: BodyTypes.Dynamic })
    setComponent(entity2, RigidBodyComponent, { type: BodyTypes.Dynamic })
    setComponent(entity1, ColliderComponent, {
      shape: Shapes.Sphere,
      collisionLayer: CollisionGroups.Default,
      collisionMask: DefaultCollisionMask
    })
    setComponent(entity2, ColliderComponent, {
      shape: Shapes.Sphere,
      collisionLayer: CollisionGroups.Default,
      collisionMask: DefaultCollisionMask
    })

    const collisionEventQueue = Physics.createCollisionEventQueue()
    const drainCollisions = Physics.drainCollisionEventQueue(physicsWorld)

    physicsWorld.step(collisionEventQueue)
    collisionEventQueue.drainCollisionEvents(drainCollisions)

    const rigidBody1 = Physics._Rigidbodies.get(entity1)!
    const rigidBody2 = Physics._Rigidbodies.get(entity2)!

    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.bodySelf, rigidBody1)
    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.bodyOther, rigidBody2)
    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.shapeSelf, rigidBody1.collider(0))
    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.shapeOther, rigidBody2.collider(0))
    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.type, CollisionEvents.COLLISION_START)

    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.bodySelf, rigidBody2)
    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.bodyOther, rigidBody1)
    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.shapeSelf, rigidBody2.collider(0))
    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.shapeOther, rigidBody1.collider(0))
    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.type, CollisionEvents.COLLISION_START)

    rigidBody2.setTranslation({ x: 0, y: 0, z: 15 }, true)

    physicsWorld.step(collisionEventQueue)
    collisionEventQueue.drainCollisionEvents(drainCollisions)

    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.bodySelf, rigidBody1)
    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.bodyOther, rigidBody2)
    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.shapeSelf, rigidBody1.collider(0))
    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.shapeOther, rigidBody2.collider(0))
    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.type, CollisionEvents.COLLISION_END)

    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.bodySelf, rigidBody2)
    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.bodyOther, rigidBody1)
    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.shapeSelf, rigidBody2.collider(0))
    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.shapeOther, rigidBody1.collider(0))
    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.type, CollisionEvents.COLLISION_END)
  })

  it('should generate a trigger event', async () => {
    const physicsWorld = getState(PhysicsState).physicsWorld

    const entity1 = createEntity()
    const entity2 = createEntity()

    setComponent(entity1, CollisionComponent)
    setComponent(entity2, CollisionComponent)

    setComponent(entity1, TransformComponent)
    setComponent(entity2, TransformComponent)

    setComponent(entity1, RigidBodyComponent, { type: BodyTypes.Dynamic })
    setComponent(entity2, RigidBodyComponent, { type: BodyTypes.Dynamic })
    setComponent(entity1, ColliderComponent, {
      shape: Shapes.Sphere,
      collisionLayer: CollisionGroups.Default,
      collisionMask: AllCollisionMask
    })
    setComponent(entity2, ColliderComponent, {
      shape: Shapes.Sphere,
      collisionLayer: CollisionGroups.Default,
      collisionMask: AllCollisionMask
    })
    setComponent(entity2, TriggerComponent)

    const collisionEventQueue = Physics.createCollisionEventQueue()
    const drainCollisions = Physics.drainCollisionEventQueue(physicsWorld)

    physicsWorld.step(collisionEventQueue)
    collisionEventQueue.drainCollisionEvents(drainCollisions)

    const rigidBody1 = Physics._Rigidbodies.get(entity1)!
    const rigidBody2 = Physics._Rigidbodies.get(entity2)!

    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.bodySelf, rigidBody1)
    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.bodyOther, rigidBody2)
    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.shapeSelf, rigidBody1.collider(0))
    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.shapeOther, rigidBody2.collider(0))
    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.type, CollisionEvents.TRIGGER_START)

    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.bodySelf, rigidBody2)
    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.bodyOther, rigidBody1)
    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.shapeSelf, rigidBody2.collider(0))
    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.shapeOther, rigidBody1.collider(0))
    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.type, CollisionEvents.TRIGGER_START)

    rigidBody2.setTranslation({ x: 0, y: 0, z: 15 }, true)

    physicsWorld.step(collisionEventQueue)
    collisionEventQueue.drainCollisionEvents(drainCollisions)

    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.bodySelf, rigidBody1)
    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.bodyOther, rigidBody2)
    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.shapeSelf, rigidBody1.collider(0))
    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.shapeOther, rigidBody2.collider(0))
    assert.equal(getComponent(entity1, CollisionComponent).get(entity2)?.type, CollisionEvents.TRIGGER_END)

    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.bodySelf, rigidBody2)
    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.bodyOther, rigidBody1)
    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.shapeSelf, rigidBody2.collider(0))
    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.shapeOther, rigidBody1.collider(0))
    assert.equal(getComponent(entity2, CollisionComponent).get(entity1)?.type, CollisionEvents.TRIGGER_END)
  })
})

describe('PhysicsAPI', () => {
  describe('createWorld', () => {
    beforeEach(async () => {
      createEngine()
      await Physics.load()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should create a new world object successfully', () => {
      const world = Physics.createWorld()
      assert.ok(world instanceof World, 'The create world has an incorrect type.')
    })

    it('should create a world object with the default gravity when not specified', () => {
      const world = Physics.createWorld()
      const gravity = new Vector3(0.0, -9.81, 0.0)
      assert.deepEqual(world.gravity, gravity, 'The physics world was initialized with an unexpected gravity value')
    })

    it('should create a world object with a different gravity value when specified', () => {
      const expected = new Vector3(1.0, 2.0, 3.0)
      const world = Physics.createWorld(expected)
      assert.deepEqual(world.gravity, expected, 'The physics world was initialized with an unexpected gravity value')
    })
  })

  describe('Rigidbodies', () => {
    describe('createRigidBody', () => {
      const position = new Vector3(1, 2, 3)
      const rotation = new Quaternion(0.4, 0.5, 0.6, 0.0)

      const scale = new Vector3(10, 10, 10)
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent, { position: position, scale: scale, rotation: rotation })
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should create a rigidBody successfully', () => {
        Physics.createRigidBody(testEntity, physicsWorld!)
        const body = Physics._Rigidbodies.get(testEntity)
        assert.ok(body)
      })

      it("shouldn't mark the entity transform as dirty", () => {
        Physics.createRigidBody(testEntity, physicsWorld!)
        assert.ok(TransformComponent.dirtyTransforms[testEntity] == false)
      })

      it('should assign the correct RigidBodyType enum', () => {
        Physics.createRigidBody(testEntity, physicsWorld!)
        const body = Physics._Rigidbodies.get(testEntity)!
        assert.equal(body.bodyType(), RigidBodyType.Dynamic)
      })

      it("should assign the entity's position to the rigidBody.translation property", () => {
        Physics.createRigidBody(testEntity, physicsWorld!)
        const body = Physics._Rigidbodies.get(testEntity)!
        assert.deepEqual(body.translation(), position)
      })

      /**
      // @todo How to check rotations?
      it("should assign the entity's rotation to the rigidBody.rotation property", () => {
        Physics.createRigidBody(testEntity, physicsWorld!)
        const body = Physics._Rigidbodies.get(testEntity)!
        assert.deepEqual(body!.rotation(), {
          w: 0.0,
          x: 0.4,
          y: 0.5,
          z: 0.6
        })
      })
      */

      it('should create a body with no Linear Velocity', () => {
        Physics.createRigidBody(testEntity, physicsWorld!)
        const body = Physics._Rigidbodies.get(testEntity)!
        assert.deepEqual(body.linvel(), Vector3_Zero)
      })

      it('should create a body with no Angular Velocity', () => {
        Physics.createRigidBody(testEntity, physicsWorld!)
        const body = Physics._Rigidbodies.get(testEntity)!
        const result = new Vector3(body.angvel().x, body.angvel().y, body.angvel().z)
        assert.equal(result.x, Vector3_Zero.x)
        assert.equal(result.y, Vector3_Zero.y)
        assert.equal(result.z, Vector3_Zero.z)
      })

      it("should store the entity in the body's userData property", () => {
        Physics.createRigidBody(testEntity, physicsWorld!)
        const body = Physics._Rigidbodies.get(testEntity)!
        assert.deepEqual(body.userData, { entity: testEntity })
      })
    })

    describe('removeRigidbody', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        Physics.createRigidBody(testEntity, physicsWorld!)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should successfully remove the body from the RigidBodies map', () => {
        let body = Physics._Rigidbodies.get(testEntity)
        assert.ok(body)
        Physics.removeRigidbody(testEntity, physicsWorld!)
        body = Physics._Rigidbodies.get(testEntity)
        assert.equal(body, undefined)
      })
    })

    describe('isSleeping', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        Physics.createRigidBody(testEntity, physicsWorld!)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should return the correct values', () => {
        const noBodyEntity = createEntity()
        assert.equal(Physics.isSleeping(noBodyEntity), true, 'Returns true when the entity does not have a RigidBody')
        assert.equal(
          Physics.isSleeping(testEntity),
          false,
          "Returns false when the entity is first created and physics haven't been simulated yet"
        )
      })
    })

    describe('setRigidBodyType', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        Physics.createRigidBody(testEntity, physicsWorld!)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it("should assign the correct RigidBodyType to the entity's body", () => {
        let body = Physics._Rigidbodies.get(testEntity)!
        assert.equal(body.bodyType(), RigidBodyType.Dynamic)
        // Check change to fixed
        Physics.setRigidBodyType(testEntity, BodyTypes.Fixed)
        body = Physics._Rigidbodies.get(testEntity)!
        assert.notEqual(body.bodyType(), RigidBodyType.Dynamic, "The RigidBody's type was not changed")
        assert.equal(body.bodyType(), RigidBodyType.Fixed, "The RigidBody's type was not changed to Fixed")
        // Check change to dynamic
        Physics.setRigidBodyType(testEntity, BodyTypes.Dynamic)
        body = Physics._Rigidbodies.get(testEntity)!
        assert.notEqual(body.bodyType(), RigidBodyType.Fixed, "The RigidBody's type was not changed")
        assert.equal(body.bodyType(), RigidBodyType.Dynamic, "The RigidBody's type was not changed to Dynamic")
        // Check change to kinematic
        Physics.setRigidBodyType(testEntity, BodyTypes.Kinematic)
        body = Physics._Rigidbodies.get(testEntity)!
        assert.notEqual(body.bodyType(), RigidBodyType.Dynamic, "The RigidBody's type was not changed")
        assert.equal(
          body.bodyType(),
          RigidBodyType.KinematicPositionBased,
          "The RigidBody's type was not changed to KinematicPositionBased"
        )
      })
    })

    describe('setRigidbodyPose', () => {
      const position = new Vector3(1, 2, 3)
      const rotation = new Quaternion(0.4, 0.5, 0.6, 0.0)
      const linVel = new Vector3(7, 8, 9)
      const angVel = new Vector3(0, 1, 2)
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        Physics.createRigidBody(testEntity, physicsWorld!)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it("should set the body's Translation to the given Position", () => {
        Physics.setRigidbodyPose(testEntity, position, rotation, linVel, angVel)
        const body = Physics._Rigidbodies.get(testEntity)!
        assert.deepEqual(body.translation(), position)
      })

      /*
    // @todo How to check rotations?
    it("should set the body's Rotation to the given value", () => {
      Physics.setRigidbodyPose(testEntity, position, rotation, linVel, angVel)
      const body = Physics._Rigidbodies.get(testEntity)!
      assert.deepEqual(body.rotation(), rotation)
    })
    */

      it("should set the body's Linear Velocity to the given value", () => {
        Physics.setRigidbodyPose(testEntity, position, rotation, linVel, angVel)
        const body = Physics._Rigidbodies.get(testEntity)!
        assert.deepEqual(body.linvel(), linVel)
      })

      it("should set the body's Angular Velocity to the given value", () => {
        Physics.setRigidbodyPose(testEntity, position, rotation, linVel, angVel)
        const body = Physics._Rigidbodies.get(testEntity)!
        assert.deepEqual(body.angvel(), angVel)
      })
    })

    describe('enabledCcd', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        Physics.createRigidBody(testEntity, physicsWorld!)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should enable Continuous Collision Detection on the entity', () => {
        const body = Physics._Rigidbodies.get(testEntity)!
        assert.equal(body.isCcdEnabled(), false)
        Physics.enabledCcd(testEntity, true)
        assert.equal(body.isCcdEnabled(), true)
      })

      it('should disable CCD on the entity when passing `false` to the `enabled` property', () => {
        const body = Physics._Rigidbodies.get(testEntity)!
        Physics.enabledCcd(testEntity, true)
        assert.equal(body.isCcdEnabled(), true)
        Physics.enabledCcd(testEntity, false)
        assert.equal(body.isCcdEnabled(), false)
      })
    })

    // @todo How to check for the impulse of an entity?
    describe('applyImpulse', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        Physics.createRigidBody(testEntity, physicsWorld!)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      // @todo Why is the system failing?
      const physicsSystemExecute = SystemDefinitions.get(PhysicsSystem)!.execute
      // @todo
      //  Existing tests above use physicsWorld.step().
      //  Is that how the physics are run for applyImpulse, instead of the system's execute?

      it('should apply the impulse to the RigidBody of the entity', () => {
        const testImpulse = new Vector3(1, 2, 3)
        const body = Physics._Rigidbodies.get(testEntity)
        assert.ok(body)
        console.log(JSON.stringify(body.linvel()))
        console.log(JSON.stringify(body.angvel()))
        Physics.applyImpulse(testEntity, testImpulse)
        // physicsWorld!.step()
        // physicsSystemExecute()
        console.log(JSON.stringify(body.linvel()))
        console.log(JSON.stringify(body.angvel()))
      })
      /**
       */
    })

    /**
  // @todo How to check rotations?
  describe("lockRotations", () => {
    let testEntity = UndefinedEntity
    let physicsWorld :World | undefined= undefined

    beforeEach(async () => {
      createEngine()
      await Physics.load()
      physicsWorld  = Physics.createWorld()
      getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
      physicsWorld!.timestep = 1 / 60

      // Create the entity
      testEntity = createEntity()
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
      Physics.createRigidBody(testEntity, physicsWorld!)
    })

    afterEach(() => {
      removeEntity(testEntity)
      physicsWorld = undefined
      return destroyEngine()
    })

    it("should lock rotations on the entity", () => {
      const ExpectedValue = {x: 0.4, y: 0.3, z: 0.2, w: 0.0} as Rotation
      const body = Physics._Rigidbodies.get(testEntity)!
      assert.notDeepEqual(body.rotation(), ExpectedValue)
      Physics.lockRotations(testEntity, true)
      body.setRotation(ExpectedValue, false)
      assert.notDeepEqual(body.rotation(), ExpectedValue)
    })

    it("should disable locked rotations on the entity", () => {
      const ExpectedValue = {x: 0.4, y: 0.3, z: 0.2, w: 0.0} as Rotation
      const body = Physics._Rigidbodies.get(testEntity)!
      assert.notDeepEqual(body.rotation(), ExpectedValue)
      Physics.lockRotations(testEntity, true)
      body.setRotation(ExpectedValue, false)
      assert.notDeepEqual(body.rotation(), ExpectedValue)
      Physics.lockRotations(testEntity, true)
      assert.deepEqual(body.rotation(), ExpectedValue)
    })
  })
  */

    /**
  // @todo How to check rotations?
  describe("setEnabledRotations", () => {})
  describe("updatePreviousRigidbodyPose", () => {})
  describe("updateRigidbodyPose", () => {})
  describe("setKinematicRigidbodyPose", () => {})
  */
  }) // << Rigidbodies

  describe('Colliders', () => {
    describe('setTrigger', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
        Physics.createRigidBody(testEntity, physicsWorld!)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should mark the collider of the entity as a sensor', () => {
        const collider = Physics._Colliders.get(testEntity)!
        Physics.setTrigger(testEntity, true)
        assert.ok(collider.isSensor())
      })

      it('should add CollisionGroup.trigger to the interaction groups of the collider when `isTrigger` is passed as true', () => {
        const collider = Physics._Colliders.get(testEntity)!
        Physics.setTrigger(testEntity, true)
        const triggerInteraction = getInteractionGroups(CollisionGroups.Trigger, 0) // Shift the Trigger bits into the interaction bits, so they don't match with the mask
        const hasTriggerInteraction = Boolean(collider.collisionGroups() & triggerInteraction) // If interactionGroups contains the triggerInteraction bits
        assert.ok(hasTriggerInteraction)
      })

      it('should not add CollisionGroup.trigger to the interaction groups of the collider when `isTrigger` is passed as false', () => {
        const collider = Physics._Colliders.get(testEntity)!
        Physics.setTrigger(testEntity, false)
        const triggerInteraction = getInteractionGroups(CollisionGroups.Trigger, 0) // Shift the Trigger bits into the interaction bits, so they don't match with the mask
        const notTriggerInteraction = !(collider.collisionGroups() & triggerInteraction) // If interactionGroups does not contain the triggerInteraction bits
        assert.ok(notTriggerInteraction)
      })
    }) // << setTrigger
    /**
     */

    describe('setFriction', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
        Physics.createRigidBody(testEntity, physicsWorld!)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should set the friction value on the entity', () => {
        const ExpectedValue = 42
        const collider = Physics._Colliders.get(testEntity)!
        assert.notEqual(collider.friction(), ExpectedValue)
        Physics.setFriction(testEntity, ExpectedValue)
        assert.equal(collider.friction(), ExpectedValue)
      })
    }) // << setFriction

    describe('setRestitution', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
        Physics.createRigidBody(testEntity, physicsWorld!)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should set the restitution value on the entity', () => {
        const ExpectedValue = 42
        const collider = Physics._Colliders.get(testEntity)!
        assert.notEqual(collider.restitution(), ExpectedValue)
        Physics.setRestitution(testEntity, ExpectedValue)
        assert.equal(collider.restitution(), ExpectedValue)
      })
    }) // << setRestitution

    describe('setMass', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
        Physics.createRigidBody(testEntity, physicsWorld!)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should set the mass value on the entity', () => {
        const ExpectedValue = 42
        const collider = Physics._Colliders.get(testEntity)!
        assert.notEqual(collider.mass(), ExpectedValue)
        Physics.setMass(testEntity, ExpectedValue)
        assert.equal(collider.mass(), ExpectedValue)
      })
    }) // << setMass

    describe('getShape', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should return a sphere shape', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
        Physics.createRigidBody(testEntity, physicsWorld!)
        assert.equal(Physics.getShape(testEntity), Shapes.Sphere)
      })

      it('should return a capsule shape', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Capsule })
        Physics.createRigidBody(testEntity, physicsWorld!)
        assert.equal(Physics.getShape(testEntity), Shapes.Capsule)
      })

      it('should return a cylinder shape', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Cylinder })
        Physics.createRigidBody(testEntity, physicsWorld!)
        assert.equal(Physics.getShape(testEntity), Shapes.Cylinder)
      })

      it('should return a box shape', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Box })
        Physics.createRigidBody(testEntity, physicsWorld!)
        assert.equal(Physics.getShape(testEntity), Shapes.Box)
      })

      /**
      // @todo Why is it returning a Box for the Plane case?
      it("should return a plane shape", () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Plane })
        Physics.createRigidBody(testEntity, physicsWorld!)
        assert.equal(Physics.getShape(testEntity), Shapes.Plane)
      })
      */

      it('should return undefined for the convex_hull case', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.ConvexHull })
        Physics.createRigidBody(testEntity, physicsWorld!)
        assert.equal(Physics.getShape(testEntity), undefined /** @todo Shapes.ConvexHull */)
      })

      it('should return undefined for the mesh case', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Mesh })
        Physics.createRigidBody(testEntity, physicsWorld!)
        assert.equal(Physics.getShape(testEntity), undefined /** @todo Shapes.Mesh */)
      })

      /**
      // @todo The heightfield triggers an Error exception
      it("should return undefined for the heightfield case", () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Heightfield })
        Physics.createRigidBody(testEntity, physicsWorld!)
        assert.equal(Physics.getShape(testEntity), Shapes.Heightfield)
      })
      */
    }) // << getShape

    describe('removeCollider', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Mesh })
        Physics.createRigidBody(testEntity, physicsWorld!)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      /**
      // @todo Why is before undefined?
      it("should remove the entity's collider", () => {
        const before = Physics._Colliders.get(testEntity)
        assert.ok(before !== undefined)
        Physics.removeCollider(physicsWorld!, testEntity)
        const after = Physics._Colliders.get(testEntity)
        assert.equal(after, undefined)
      })
      */
    }) // << removeCollider
  }) // << Colliders

  describe('CharacterControllers', () => {
    describe('createCharacterController', () => {
      const Default = {
        offset: 0.01,
        maxSlopeClimbAngle: (60 * Math.PI) / 180,
        minSlopeSlideAngle: (30 * Math.PI) / 180,
        autoStep: { maxHeight: 0.5, minWidth: 0.01, stepOverDynamic: true },
        enableSnapToGround: 0.1 as number | false
      }

      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Mesh })
        Physics.createRigidBody(testEntity, physicsWorld!)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should store a character controller in the Controllers map', () => {
        const before = Physics._Controllers.get(testEntity)
        assert.equal(before, undefined)
        Physics.createCharacterController(testEntity, physicsWorld!, {})
        const after = Physics._Controllers.get(testEntity)
        assert.ok(after)
      })

      it('should create a the character controller with the expected defaults when they are omitted', () => {
        Physics.createCharacterController(testEntity, physicsWorld!, {})
        const controller = Physics._Controllers.get(testEntity)
        assert.ok(controller)
        assertFloatApproxEq(controller.offset(), Default.offset)
        assertFloatApproxEq(controller.maxSlopeClimbAngle(), Default.maxSlopeClimbAngle)
        assertFloatApproxEq(controller.minSlopeSlideAngle(), Default.minSlopeSlideAngle)
        assertFloatApproxEq(controller.autostepMaxHeight()!, Default.autoStep.maxHeight)
        assertFloatApproxEq(controller.autostepMinWidth()!, Default.autoStep.minWidth)
        assert.equal(controller.autostepEnabled(), Default.autoStep.stepOverDynamic)
        assert.equal(controller.snapToGroundEnabled(), !!Default.enableSnapToGround)
      })

      it('should create a the character controller with values different than the defaults when they are specified', () => {
        const Expected = {
          offset: 0.05,
          maxSlopeClimbAngle: (20 * Math.PI) / 180,
          minSlopeSlideAngle: (60 * Math.PI) / 180,
          autoStep: { maxHeight: 0.1, minWidth: 0.05, stepOverDynamic: false },
          enableSnapToGround: false as number | false
        }
        Physics.createCharacterController(testEntity, physicsWorld!, Expected)
        const controller = Physics._Controllers.get(testEntity)
        assert.ok(controller)
        // Compare against the specified values
        assertFloatApproxEq(controller.offset(), Expected.offset)
        assertFloatApproxEq(controller.maxSlopeClimbAngle(), Expected.maxSlopeClimbAngle)
        assertFloatApproxEq(controller.minSlopeSlideAngle(), Expected.minSlopeSlideAngle)
        assertFloatApproxEq(controller.autostepMaxHeight()!, Expected.autoStep.maxHeight)
        assertFloatApproxEq(controller.autostepMinWidth()!, Expected.autoStep.minWidth)
        assert.equal(controller.autostepIncludesDynamicBodies(), Expected.autoStep.stepOverDynamic)
        assert.equal(controller.snapToGroundEnabled(), !!Expected.enableSnapToGround)
        // Compare against the defaults
        assertFloatApproxNotEq(controller.offset(), Default.offset)
        assertFloatApproxNotEq(controller.maxSlopeClimbAngle(), Default.maxSlopeClimbAngle)
        assertFloatApproxNotEq(controller.minSlopeSlideAngle(), Default.minSlopeSlideAngle)
        assertFloatApproxNotEq(controller.autostepMaxHeight()!, Default.autoStep.maxHeight)
        assertFloatApproxNotEq(controller.autostepMinWidth()!, Default.autoStep.minWidth)
        assert.notEqual(controller.autostepIncludesDynamicBodies(), Default.autoStep.stepOverDynamic)
        assert.notEqual(controller.snapToGroundEnabled(), !!Default.enableSnapToGround)
      })
    })

    describe('removeCharacterController', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Mesh })
        Physics.createRigidBody(testEntity, physicsWorld!)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should remove the character controller from the Controllers map', () => {
        const before = Physics._Controllers.get(testEntity)
        assert.equal(before, undefined)
        Physics.createCharacterController(testEntity, physicsWorld!, {})
        const created = Physics._Controllers.get(testEntity)
        assert.ok(created)
        Physics.removeCharacterController(testEntity, physicsWorld!)
        const after = Physics._Controllers.get(testEntity)
        assert.equal(after, undefined)
      })
    })

    describe('computeColliderMovement', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Mesh })
        Physics.createRigidBody(testEntity, physicsWorld!)
        Physics.createCharacterController(testEntity, physicsWorld!, {})
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      /**
      // @todo Why is the system failing?
      const physicsSystemExecute = SystemDefinitions.get(PhysicsSystem)!.execute

      it("dummy", () => {
        const movement = new Vector3(1,2,3)
        // const collider = Physics._Colliders.get(testEntity)
        const controller = Physics._Controllers.get(testEntity)!
        const before = controller.computedMovement()
        Physics.computeColliderMovement(
           testEntity,  // entity: Entity,
           testEntity,  // colliderEntity: Entity,
           movement,    // desiredTranslation: Vector3,
           // filterGroups?: InteractionGroups,
           // filterPredicate?: (collider: Collider) => boolean
        )
        physicsSystemExecute()
        const after = controller.computedMovement()
        assert.notDeepEqual(before, after)
      })
      */
    }) // << computeColliderMovement

    /**
    // @todo After test for Physics.computeColliderMovement is done
    describe("getComputedMovement", () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Mesh })
        Physics.createRigidBody(testEntity, physicsWorld!)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it("should return (0,0,0) when the entity does not have a CharacterController", () => {
        const result = new Vector3(1,2,3)
        Physics.getComputedMovement(testEntity, result)
        assert.deepEqual(result, Vector3_Zero)
      })

      it("should not return (0,0,0) when the entity has a moving CharacterController", () => {
        const result = new Vector3(1,2,3)
        const Expected = { x: 4, y: 5, z: 6 }
        const Vector_Zero = { x: 0, y: 0, z: 0 }
        Physics.createCharacterController(testEntity, physicsWorld!, {})
        Physics.getComputedMovement(testEntity, result)
        const controller = Physics._Controllers.get(testEntity)!
        assert.notDeepEqual(controller.computedMovement(), Vector_Zero)
      })
    })
    */
  }) // << CharacterControllers

  describe('Raycasts', () => {
    describe('castRay', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent, {
          position: new Vector3(10, 0, 0),
          scale: new Vector3(10, 10, 10)
        })
        computeTransformMatrix(testEntity)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Fixed })
        setComponent(testEntity, ColliderComponent, {
          shape: Shapes.Box,
          collisionLayer: CollisionGroups.Default,
          collisionMask: DefaultCollisionMask
        })
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should cast a ray and hit a rigidbody', async () => {
        physicsWorld!.step()

        const raycastComponentData = {
          type: SceneQueryType.Closest,
          origin: new Vector3().set(0, 0, 0),
          direction: ObjectDirection.Right,
          maxDistance: 20,
          groups: getInteractionGroups(CollisionGroups.Default, CollisionGroups.Default)
        }
        const hits = Physics.castRay(physicsWorld!, raycastComponentData)

        assert.deepEqual(hits.length, 1)
        assert.deepEqual(hits[0].normal.x, -1)
        assert.deepEqual(hits[0].distance, 5)
        assert.deepEqual((hits[0].body.userData as any)['entity'], testEntity)
      })
    })

    describe('castRayFromCamera', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent, {
          position: new Vector3(10, 0, 0),
          scale: new Vector3(10, 10, 10)
        })
        computeTransformMatrix(testEntity)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Fixed })
        setComponent(testEntity, ColliderComponent, {
          shape: Shapes.Box,
          collisionLayer: CollisionGroups.Default,
          collisionMask: DefaultCollisionMask
        })
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      /*
      it('should cast a ray from a camera and hit a rigidbody', async () => {
        physicsWorld!.step()
        assert.ok(1)
      })
      */
    }) // << castRayFromCamera

    describe('castShape', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent, {
          position: new Vector3(10, 0, 0),
          scale: new Vector3(10, 10, 10)
        })
        computeTransformMatrix(testEntity)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Fixed })
        setComponent(testEntity, ColliderComponent, {
          shape: Shapes.Box,
          collisionLayer: CollisionGroups.Default,
          collisionMask: DefaultCollisionMask
        })
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      /**
      // @todo Why is it not hitting
      it('should cast a shape and hit a rigidbody', () => {
        physicsWorld!.step()

        const collider = Physics._Colliders.get(testEntity)!
        const hits = [] as RaycastHit[]
        const shapecastComponentData :ShapecastArgs= {
          type: SceneQueryType.Closest,  // type: SceneQueryType
          hits: hits, // hits: RaycastHit[]
          collider: collider, // collider: Collider
          direction: ObjectDirection.Right,  // direction: Vector3
          maxDistance: 20,  // maxDistance: number
          collisionGroups: getInteractionGroups(CollisionGroups.Default, CollisionGroups.Default),  // collisionGroups: InteractionGroups
        }
        Physics.castShape(physicsWorld!, shapecastComponentData)

        assert.deepEqual(hits.length, 1, "The length of the hits array is incorrect.")
        assert.deepEqual(hits[0].normal.x, -1)
        assert.deepEqual(hits[0].distance, 5)
        assert.deepEqual((hits[0].body.userData as any)['entity'], testEntity)
      })
      */
    }) // << castShape
  }) // << Raycasts

  describe('Collisions', () => {
    describe('createCollisionEventQueue', () => {
      beforeEach(async () => {
        createEngine()
        await Physics.load()
      })

      afterEach(() => {
        return destroyEngine()
      })

      it('should create a collision event queue successfully', () => {
        const queue = Physics.createCollisionEventQueue()
        assert(queue)
      })
    })

    describe('drainCollisionEventQueue', () => {
      beforeEach(async () => {
        createEngine()
        await Physics.load()
      })

      afterEach(() => {
        return destroyEngine()
      })

      it('dummy', () => {
        assert.ok(1)
      })
    }) // << drainCollisionEventQueue

    describe('drainContactEventQueue', () => {
      beforeEach(async () => {
        createEngine()
        await Physics.load()
      })

      afterEach(() => {
        return destroyEngine()
      })

      it('dummy', () => {
        assert.ok(1)
      })
    }) // << drainContactEventQueue
  }) // << Collisions
})

/** TODO:
    describe("load", () => {})
  // Colliders
    describe("createColliderDesc", () => {})  // @todo How does ColliderDesc work?
    describe("attachCollider", () => {})  // @todo How does ColliderDesc work?
    describe("setColliderPose", () => {})  // @todo How to check rotations?
    describe("setMassCenter", () => {})  // @todo The function is not implemented. It is annotated with a todo tag
    describe("setCollisionLayer", () => {})  // @todo How to check for `CollisionGroups` behavior?
    describe("setCollisionMask", () => {})  // @todo How to check for `CollisionGroups` behavior?
    describe("removeCollidersFromRigidBody", () => {})  // @todo How to check that the colliders were removed? Is it possible without calling Rapier directly?
  // Character Controller
    describe("getControllerOffset", () => {})  // @deprecated
  // Collisions
  */
