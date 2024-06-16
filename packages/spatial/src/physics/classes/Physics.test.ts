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

import { getComponent, hasComponent, removeComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
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

const Rotation_Zero = { x: 0, y: 0, z: 0, w: 1 }

const Epsilon = 0.001
function assertFloatApproxEq(A: number, B: number, epsilon = Epsilon) {
  assert.ok(Math.abs(A - B) < epsilon, `Numbers are not approximately equal:  ${A} : ${B} : ${A - B}`)
}

function assertFloatApproxNotEq(A: number, B: number, epsilon = Epsilon) {
  assert.ok(Math.abs(A - B) > epsilon, `Numbers are approximately equal:  ${A} : ${B} : ${A - B}`)
}

export function assertVecApproxEq(A, B, elems: number, epsilon = Epsilon) {
  // @note Also used by RigidBodyComponent.test.ts
  assertFloatApproxEq(A.x, B.x, epsilon)
  assertFloatApproxEq(A.y, B.y, epsilon)
  assertFloatApproxEq(A.z, B.z, epsilon)
  if (elems > 3) assertFloatApproxEq(A.w, B.w, epsilon)
}

export function assertVecAllApproxNotEq(A, B, elems: number, epsilon = Epsilon) {
  // @note Also used by RigidBodyComponent.test.ts
  assertFloatApproxNotEq(A.x, B.x, epsilon)
  assertFloatApproxNotEq(A.y, B.y, epsilon)
  assertFloatApproxNotEq(A.z, B.z, epsilon)
  if (elems > 3) assertFloatApproxNotEq(A.w, B.w, epsilon)
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
      const rotation = new Quaternion(0.2, 0.3, 0.5, 0.0).normalize()

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
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic, canSleep: true, gravityScale: 0 })
        RigidBodyComponent.reactorMap.get(testEntity)!.stop()
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
        assertVecApproxEq(body.translation(), position, 3)
      })

      it("should assign the entity's rotation to the rigidBody.rotation property", () => {
        Physics.createRigidBody(testEntity, physicsWorld!)
        const body = Physics._Rigidbodies.get(testEntity)!
        assertVecApproxEq(body!.rotation(), rotation, 4)
      })

      it('should create a body with no Linear Velocity', () => {
        Physics.createRigidBody(testEntity, physicsWorld!)
        const body = Physics._Rigidbodies.get(testEntity)!
        assert.deepEqual(body.linvel(), Vector3_Zero)
      })

      it('should create a body with no Angular Velocity', () => {
        Physics.createRigidBody(testEntity, physicsWorld!)
        const body = Physics._Rigidbodies.get(testEntity)!
        assert.deepEqual(body.angvel(), Vector3_Zero)
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
        RigidBodyComponent.reactorMap.get(testEntity)!.stop()
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
        RigidBodyComponent.reactorMap.get(testEntity)!.stop()
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
        RigidBodyComponent.reactorMap.get(testEntity)!.stop()
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
      const rotation = new Quaternion(0.1, 0.3, 0.7, 0.0).normalize()
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
        RigidBodyComponent.reactorMap.get(testEntity)!.stop()
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

      it("should set the body's Rotation to the given value", () => {
        Physics.setRigidbodyPose(testEntity, position, rotation, linVel, angVel)
        const body = Physics._Rigidbodies.get(testEntity)!
        assertVecApproxEq(body.rotation(), rotation, 4)
      })

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
        RigidBodyComponent.reactorMap.get(testEntity)!.stop()
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

    describe('applyImpulse', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        physicsWorld!.timestep = 1 / 60
        const physicsState = getMutableState(PhysicsState)
        physicsState.physicsWorld!.set(physicsWorld!)
        physicsState.physicsCollisionEventQueue.set(Physics.createCollisionEventQueue())
        /** @ts-ignore  @todo Remove ts-ignore. Hookstate interprets the closure type weirdly */
        physicsState.drainCollisions.set((val) => Physics.drainCollisionEventQueue(physicsWorld!))
        /** @ts-ignore  @todo Remove ts-ignore. Hookstate interprets the closure type weirdly */
        physicsState.drainContacts.set((val) => Physics.drainContactEventQueue(physicsWorld!))

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      const physicsSystemExecute = SystemDefinitions.get(PhysicsSystem)!.execute

      it('should apply the impulse to the RigidBody of the entity', () => {
        const testImpulse = new Vector3(1, 2, 3)
        const beforeBody = Physics._Rigidbodies.get(testEntity)
        assert.ok(beforeBody)
        const before = beforeBody.linvel()
        assert.deepEqual(before, Vector3_Zero)
        Physics.applyImpulse(testEntity, testImpulse)
        physicsSystemExecute()
        const afterBody = Physics._Rigidbodies.get(testEntity)
        assert.ok(afterBody)
        const after = afterBody.linvel()
        assert.notDeepEqual(after, before)
      })
    })

    describe('lockRotations', () => {
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
        RigidBodyComponent.reactorMap.get(testEntity)!.stop()
        Physics.createRigidBody(testEntity, physicsWorld!)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should lock rotations on the entity', () => {
        const ExpectedValue = new Quaternion(0.5, 0.3, 0.2, 0.0).normalize()
        const body = Physics._Rigidbodies.get(testEntity)!
        assert.notDeepEqual(body.rotation(), ExpectedValue)
        Physics.lockRotations(testEntity, true)
        body.setRotation(ExpectedValue, false)
        assert.notDeepEqual(body.rotation(), ExpectedValue)
      })

      it('should disable locked rotations on the entity', () => {
        const ExpectedValue = new Quaternion(0.5, 0.3, 0.2, 0.0).normalize()
        const body = Physics._Rigidbodies.get(testEntity)!
        assert.notDeepEqual(body.rotation(), ExpectedValue)
        Physics.lockRotations(testEntity, true)
        body.setRotation(ExpectedValue, false)
        assert.notDeepEqual(body.rotation(), ExpectedValue)
        Physics.lockRotations(testEntity, true)
        assertVecApproxEq(body.rotation(), ExpectedValue, 4)
      })
    })

    describe('setEnabledRotations', () => {
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
        setComponent(testEntity, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should disable rotations on the X axis for the rigidBody of the entity', () => {
        const testImpulse = new Vector3(1, 2, 3)
        const enabledRotation = [false, true, true] as [boolean, boolean, boolean]
        const body = Physics._Rigidbodies.get(testEntity)!
        const before = body.rotation()
        assert.deepEqual(before, Rotation_Zero)
        Physics.setEnabledRotations(testEntity, enabledRotation)
        Physics.applyImpulse(testEntity, testImpulse)
        const after = body.rotation()
        assert.equal(after.x, 0)
        assert.equal(after.x, before.x)
      })

      it('should disable rotations on the Y axis for the rigidBody of the entity', () => {
        const testImpulse = new Vector3(1, 2, 3)
        const enabledRotation = [true, false, true] as [boolean, boolean, boolean]
        const body = Physics._Rigidbodies.get(testEntity)!
        const before = body.rotation()
        assert.deepEqual(before, Rotation_Zero)
        Physics.setEnabledRotations(testEntity, enabledRotation)
        Physics.applyImpulse(testEntity, testImpulse)
        const after = body.rotation()
        assert.equal(after.y, 0)
        assert.equal(after.y, before.y)
      })

      it('should disable rotations on the Z axis for the rigidBody of the entity', () => {
        const testImpulse = new Vector3(1, 2, 3)
        const enabledRotation = [true, false, true] as [boolean, boolean, boolean]
        const body = Physics._Rigidbodies.get(testEntity)!
        const before = body.rotation()
        assert.deepEqual(before, Rotation_Zero)
        Physics.setEnabledRotations(testEntity, enabledRotation)
        Physics.applyImpulse(testEntity, testImpulse)
        const after = body.rotation()
        assert.equal(after.z, 0)
        assert.equal(after.z, before.z)
      })
    })

    describe('updatePreviousRigidbodyPose', () => {
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
        setComponent(testEntity, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it("should set the previous position of the entity's RigidBodyComponent", () => {
        const Expected = new Vector3(1, 2, 3)
        const body = Physics._Rigidbodies.get(testEntity)!
        body.setTranslation(Expected, false)
        const before = {
          x: RigidBodyComponent.previousPosition.x[testEntity],
          y: RigidBodyComponent.previousPosition.y[testEntity],
          z: RigidBodyComponent.previousPosition.z[testEntity]
        }
        Physics.updatePreviousRigidbodyPose([testEntity])
        const after = {
          x: RigidBodyComponent.previousPosition.x[testEntity],
          y: RigidBodyComponent.previousPosition.y[testEntity],
          z: RigidBodyComponent.previousPosition.z[testEntity]
        }
        assertVecAllApproxNotEq(before, after, 3)
      })

      it("should set the previous rotation of the entity's RigidBodyComponent", () => {
        const Expected = new Quaternion(0.5, 0.3, 0.2, 0.0).normalize()
        const body = Physics._Rigidbodies.get(testEntity)!
        body.setRotation(Expected, false)
        const before = {
          x: RigidBodyComponent.previousRotation.x[testEntity],
          y: RigidBodyComponent.previousRotation.y[testEntity],
          z: RigidBodyComponent.previousRotation.z[testEntity],
          w: RigidBodyComponent.previousRotation.w[testEntity]
        }
        Physics.updatePreviousRigidbodyPose([testEntity])
        const after = {
          x: RigidBodyComponent.previousRotation.x[testEntity],
          y: RigidBodyComponent.previousRotation.y[testEntity],
          z: RigidBodyComponent.previousRotation.z[testEntity],
          w: RigidBodyComponent.previousRotation.w[testEntity]
        }
        assertVecAllApproxNotEq(before, after, 4)
      })
    })

    describe('updateRigidbodyPose', () => {
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
        setComponent(testEntity, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it("should set the position of the entity's RigidBodyComponent", () => {
        const position = new Vector3(1, 2, 3)
        const body = Physics._Rigidbodies.get(testEntity)!
        body.setTranslation(position, false)
        const before = {
          x: RigidBodyComponent.position.x[testEntity],
          y: RigidBodyComponent.position.y[testEntity],
          z: RigidBodyComponent.position.z[testEntity]
        }
        Physics.updateRigidbodyPose([testEntity])
        const after = {
          x: RigidBodyComponent.position.x[testEntity],
          y: RigidBodyComponent.position.y[testEntity],
          z: RigidBodyComponent.position.z[testEntity]
        }
        assertVecAllApproxNotEq(before, after, 3)
      })

      it("should set the rotation of the entity's RigidBodyComponent", () => {
        const rotation = new Quaternion(0.5, 0.3, 0.2, 0.0).normalize()
        const body = Physics._Rigidbodies.get(testEntity)!
        body.setRotation(rotation, false)
        const before = {
          x: RigidBodyComponent.rotation.x[testEntity],
          y: RigidBodyComponent.rotation.y[testEntity],
          z: RigidBodyComponent.rotation.z[testEntity],
          w: RigidBodyComponent.rotation.w[testEntity]
        }
        Physics.updateRigidbodyPose([testEntity])
        const after = {
          x: RigidBodyComponent.rotation.x[testEntity],
          y: RigidBodyComponent.rotation.y[testEntity],
          z: RigidBodyComponent.rotation.z[testEntity],
          w: RigidBodyComponent.rotation.w[testEntity]
        }
        assertVecAllApproxNotEq(before, after, 4)
      })

      it("should set the linearVelocity of the entity's RigidBodyComponent", () => {
        const impulse = new Vector3(1, 2, 3)
        const body = Physics._Rigidbodies.get(testEntity)!
        body.applyImpulse(impulse, false)
        const before = {
          x: RigidBodyComponent.linearVelocity.x[testEntity],
          y: RigidBodyComponent.linearVelocity.y[testEntity],
          z: RigidBodyComponent.linearVelocity.z[testEntity]
        }
        Physics.updateRigidbodyPose([testEntity])
        const after = {
          x: RigidBodyComponent.linearVelocity.x[testEntity],
          y: RigidBodyComponent.linearVelocity.y[testEntity],
          z: RigidBodyComponent.linearVelocity.z[testEntity]
        }
        assertVecAllApproxNotEq(before, after, 3)
      })

      it("should set the angularVelocity of the entity's RigidBodyComponent", () => {
        const impulse = new Vector3(1, 2, 3)
        const body = Physics._Rigidbodies.get(testEntity)!
        body.applyTorqueImpulse(impulse, false)
        const before = {
          x: RigidBodyComponent.angularVelocity.x[testEntity],
          y: RigidBodyComponent.angularVelocity.y[testEntity],
          z: RigidBodyComponent.angularVelocity.z[testEntity]
        }
        Physics.updateRigidbodyPose([testEntity])
        const after = {
          x: RigidBodyComponent.angularVelocity.x[testEntity],
          y: RigidBodyComponent.angularVelocity.y[testEntity],
          z: RigidBodyComponent.angularVelocity.z[testEntity]
        }
        assertVecAllApproxNotEq(before, after, 3)
      })
    })

    describe('setKinematicRigidbodyPose', () => {
      const position = new Vector3(1, 2, 3)
      const rotation = new Quaternion(0.5, 0.3, 0.2, 0.0).normalize()
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
        setComponent(testEntity, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      /**
      // @todo What is missing for these tests to work as expected? Before/After are all 0
      it("should set the nextTranslation property of the entity's Kinematic RigidBody", () => {
        const body = Physics._Rigidbodies.get(testEntity)!
        const before = body.nextTranslation()
        Physics.setKinematicRigidbodyPose(testEntity, position, rotation)
        const after = body.nextTranslation()
        assertVecAllApproxNotEq(before, after, 3)
      })

      it("should set the nextRotation property of the entity's Kinematic RigidBody", () => {
        const body = Physics._Rigidbodies.get(testEntity)!
        const before = body.nextRotation()
        Physics.setKinematicRigidbodyPose(testEntity, position, rotation)
        const after = body.nextRotation()
        assertVecAllApproxNotEq(before, after, 4)
      })
      */
    })
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

    describe('setCollisionLayer', () => {
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
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should set the collider interaction groups to the given value', () => {
        const data = getComponent(testEntity, ColliderComponent)
        const ExpectedLayer = CollisionGroups.Avatars | data.collisionLayer
        const Expected = getInteractionGroups(ExpectedLayer, data.collisionMask)
        const before = Physics._Colliders.get(testEntity)!.collisionGroups()
        Physics.setCollisionLayer(testEntity, ExpectedLayer)
        const after = Physics._Colliders.get(testEntity)!.collisionGroups()
        assert.notEqual(before, Expected)
        assert.equal(after, Expected)
      })

      it('should not modify the collision mask of the collider', () => {
        const data = getComponent(testEntity, ColliderComponent)
        const newLayer = CollisionGroups.Avatars
        const Expected = getInteractionGroups(newLayer, data.collisionMask)
        Physics.setCollisionLayer(testEntity, newLayer)
        const after = Physics._Colliders.get(testEntity)!.collisionGroups()
        assert.equal(after, Expected)
      })

      it('should not add CollisionGroups.Trigger to the collider interaction groups if the entity does not have a TriggerComponent', () => {
        Physics.setCollisionLayer(testEntity, CollisionGroups.Avatars)
        const after = Physics._Colliders.get(testEntity)!.collisionGroups()
        const noTriggerBit = !(after & getInteractionGroups(CollisionGroups.Trigger, 0)) // not collisionLayer contains Trigger
        assert.ok(noTriggerBit)
      })

      it('should not modify the CollisionGroups.Trigger bit in the collider interaction groups if the entity has a TriggerComponent', () => {
        const triggerLayer = getInteractionGroups(CollisionGroups.Trigger, 0) // Create the triggerLayer groups bitmask
        setComponent(testEntity, TriggerComponent)
        const beforeGroups = Physics._Colliders.get(testEntity)!.collisionGroups()
        const before = getInteractionGroups(beforeGroups & triggerLayer, 0) === triggerLayer // beforeGroups.collisionLayer contains Trigger
        Physics.setCollisionLayer(testEntity, CollisionGroups.Avatars)
        const afterGroups = Physics._Colliders.get(testEntity)!.collisionGroups()
        const after = getInteractionGroups(afterGroups & triggerLayer, 0) === triggerLayer // afterGroups.collisionLayer contains Trigger
        assert.equal(before, after)
      })
    }) // setCollisionLayer

    describe('setCollisionMask', () => {
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
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should set the collider mask to the given value', () => {
        const before = getComponent(testEntity, ColliderComponent)
        const Expected = CollisionGroups.Avatars | before.collisionMask
        Physics.setCollisionMask(testEntity, Expected)
        const after = getComponent(testEntity, ColliderComponent)
        assert.equal(after.collisionMask, Expected)
      })

      it('should not modify the collision layer of the collider', () => {
        const before = getComponent(testEntity, ColliderComponent)
        Physics.setCollisionMask(testEntity, CollisionGroups.Avatars)
        const after = getComponent(testEntity, ColliderComponent)
        assert.equal(before.collisionLayer, after.collisionLayer)
      })

      it('should not add CollisionGroups.Trigger to the collider mask if the entity does not have a TriggerComponent', () => {
        Physics.setCollisionMask(testEntity, CollisionGroups.Avatars)
        const after = getComponent(testEntity, ColliderComponent)
        const noTriggerBit = !(after.collisionMask & CollisionGroups.Trigger) // not collisionMask contains Trigger
        assert.ok(noTriggerBit)
      })

      it('should not modify the CollisionGroups.Trigger bit in the collider mask if the entity has a TriggerComponent', () => {
        setComponent(testEntity, TriggerComponent)
        const beforeData = getComponent(testEntity, ColliderComponent)
        const before = beforeData.collisionMask & CollisionGroups.Trigger // collisionMask contains Trigger
        Physics.setCollisionMask(testEntity, CollisionGroups.Avatars)

        const afterData = getComponent(testEntity, ColliderComponent)
        const after = afterData.collisionMask & CollisionGroups.Trigger // collisionMask contains Trigger
        assert.equal(before, after)
      })
    }) // setCollisionMask

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

      it('should return a plane shape', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Plane })
        Physics.createRigidBody(testEntity, physicsWorld!)
        assert.equal(Physics.getShape(testEntity), Shapes.Box) // The Shapes.Plane case is implemented as a box in the engine
      })

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
      // @todo Heightfield is not supported yet. Triggers an Error exception
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
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Box })
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it("should remove the entity's collider", () => {
        const before = Physics._Colliders.get(testEntity)
        assert.notEqual(before, undefined)
        Physics.removeCollider(physicsWorld!, testEntity)
        const after = Physics._Colliders.get(testEntity)
        assert.equal(after, undefined)
      })
    }) // << removeCollider

    describe('removeCollidersFromRigidBody', () => {
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
        setComponent(testEntity, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should remove all Colliders from the RigidBody when called', () => {
        const before = Physics._Rigidbodies.get(testEntity)!
        assert.notEqual(before.numColliders(), 0)
        Physics.removeCollidersFromRigidBody(testEntity, physicsWorld!)
        assert.equal(before.numColliders(), 0)
      })
    }) // << removeCollidersFromRigidBody

    describe('createColliderDesc', () => {
      const Default = {
        // Default values returned by `createColliderDesc` when the default values of the components are not changed
        enabled: true,
        shape: { type: 1, halfExtents: { x: 0.5, y: 0.5, z: 0.5 } },
        massPropsMode: 0,
        density: 1,
        friction: 0.5,
        restitution: 0.5,
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        translation: { x: 0, y: 0, z: 0 },
        isSensor: false,
        collisionGroups: 65543,
        solverGroups: 4294967295,
        frictionCombineRule: 0,
        restitutionCombineRule: 0,
        activeCollisionTypes: 60943,
        activeEvents: 1,
        activeHooks: 0,
        mass: 0,
        centerOfMass: { x: 0, y: 0, z: 0 },
        contactForceEventThreshold: 0,
        principalAngularInertia: { x: 0, y: 0, z: 0 },
        angularInertiaLocalFrame: { x: 0, y: 0, z: 0, w: 1 }
      }

      let physicsWorld: World | undefined = undefined
      let testEntity = UndefinedEntity
      let rootEntity = UndefinedEntity

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        getMutableState(PhysicsState).physicsWorld!.set(physicsWorld!)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent)
        setComponent(testEntity, ColliderComponent)
        rootEntity = createEntity()
        setComponent(rootEntity, TransformComponent)
        setComponent(rootEntity, RigidBodyComponent)
        setComponent(rootEntity, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(testEntity)
        removeEntity(rootEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should return early if the given `rootEntity` does not have a RigidBody', () => {
        removeComponent(rootEntity, RigidBodyComponent)
        const result = Physics.createColliderDesc(testEntity, rootEntity)
        assert.equal(result, undefined)
      })

      it('should return a descriptor with the expected default values', () => {
        const result = Physics.createColliderDesc(testEntity, rootEntity)
        assert.deepEqual(result, Default)
      })

      it('should set the friction to the same value as the ColliderComponent', () => {
        const result = Physics.createColliderDesc(testEntity, rootEntity)
        assert.equal(result.friction, getComponent(testEntity, ColliderComponent).friction)
      })

      it('should set the restitution to the same value as the ColliderComponent', () => {
        const result = Physics.createColliderDesc(testEntity, rootEntity)
        assert.equal(result.restitution, getComponent(testEntity, ColliderComponent).restitution)
      })

      it('should set the collisionGroups to the same value as the ColliderComponent layer and mask', () => {
        const result = Physics.createColliderDesc(testEntity, rootEntity)
        const data = getComponent(testEntity, ColliderComponent)
        assert.equal(result.collisionGroups, getInteractionGroups(data.collisionLayer, data.collisionMask))
      })

      it('should set the sensor property according to whether the entity has a TriggerComponent or not', () => {
        const noTriggerDesc = Physics.createColliderDesc(testEntity, rootEntity)
        assert.equal(noTriggerDesc.isSensor, hasComponent(testEntity, TriggerComponent))
        setComponent(testEntity, TriggerComponent)
        const triggerDesc = Physics.createColliderDesc(testEntity, rootEntity)
        assert.equal(triggerDesc.isSensor, hasComponent(testEntity, TriggerComponent))
      })

      it('should set the shape to a Ball when the ColliderComponent shape is a Sphere', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
        const result = Physics.createColliderDesc(testEntity, rootEntity)
        assert.equal(result.shape.type, ShapeType.Ball)
      })

      it('should set the shape to a Cuboid when the ColliderComponent shape is a Box', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Box })
        const result = Physics.createColliderDesc(testEntity, rootEntity)
        assert.equal(result.shape.type, ShapeType.Cuboid)
      })

      it('should set the shape to a Cuboid when the ColliderComponent shape is a Plane', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Plane })
        const result = Physics.createColliderDesc(testEntity, rootEntity)
        assert.equal(result.shape.type, ShapeType.Cuboid)
      })

      /**
      // @todo Needs a proper MeshComponent object
      it('should set the shape to a TriMesh when the ColliderComponent shape is a Mesh', () => {
        setComponent(testEntity, MeshComponent)
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Mesh })
        const result = Physics.createColliderDesc(testEntity, rootEntity)
        assert.equal(result.shape.type, ShapeType.TriMesh)
      })
      */

      /**
      // @todo Why is this failing? Does it also need a proper MeshComponent object
      it('should set the shape to a ConvexPolyhedron when the ColliderComponent shape is a ConvexHull', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.ConvexHull })
        const result = Physics.createColliderDesc(testEntity, rootEntity)
        assert.equal(result.shape.type, ShapeType.ConvexPolyhedron)
      })
      */

      it('should set the shape to a Cylinder when the ColliderComponent shape is a Cylinder', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Cylinder })
        const result = Physics.createColliderDesc(testEntity, rootEntity)
        assert.equal(result.shape.type, ShapeType.Cylinder)
      })

      /**
      // @todo Test the static resulting values, in order to not repeat the internal function's code (computing relative pos/rot)
      it('should set the position relative to the parent entity', () => {
        const Expected = new Vector3(1, 2, 3)
        const result = Physics.createColliderDesc(testEntity, rootEntity)
        console.log(JSON.stringify(result.position))
        assertVecApproxEq(result.position, 0, 3)
      })
      */

      /**
      // @todo Test the static resulting values, in order to not repeat the internal function's code (computing relative pos/rot)
      it('should set the rotation relative to the parent entity', () => {
        const Expected = new Quaternion(0.5, 0.3, 0.2, 0.0).normalize()
        const result = Physics.createColliderDesc(testEntity, rootEntity)
        console.log(JSON.stringify(result.rotation))
        assertVecApproxEq(result.rotation, 0, 4)
      })
      */
    })

    describe('attachCollider', () => {
      let testEntity = UndefinedEntity
      let rigidbodyEntity = UndefinedEntity
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
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Box })
        rigidbodyEntity = createEntity()
        setComponent(rigidbodyEntity, TransformComponent)
        setComponent(rigidbodyEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(rigidbodyEntity, ColliderComponent, { shape: Shapes.Box })
      })

      afterEach(() => {
        removeEntity(testEntity)
        removeEntity(rigidbodyEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it("should return undefined when rigidBodyEntity doesn't have a RigidBodyComponent", () => {
        removeComponent(rigidbodyEntity, RigidBodyComponent)
        const colliderDesc = Physics.createColliderDesc(testEntity, rigidbodyEntity)
        const result = Physics.attachCollider(physicsWorld!, colliderDesc, rigidbodyEntity, testEntity)
        assert.equal(result, undefined)
      })

      it('should add the collider to the Physics._Colliders map', () => {
        ColliderComponent.reactorMap.get(testEntity)!.stop()
        const colliderDesc = Physics.createColliderDesc(testEntity, rigidbodyEntity)
        const result = Physics.attachCollider(physicsWorld!, colliderDesc, rigidbodyEntity, testEntity)!
        const expected = Physics._Colliders.get(testEntity)
        assert.ok(result)
        assert.ok(expected)
        assert.deepEqual(result.handle, expected.handle)
      })
    })

    describe('setColliderPose', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined
      const position = new Vector3(1, 2, 3)
      const rotation = new Quaternion(0.5, 0.4, 0.1, 0.0).normalize()

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
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Box })
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it("should assign the entity's position to the collider.translation property", () => {
        Physics.setColliderPose(testEntity, position, rotation)
        const collider = Physics._Colliders.get(testEntity)!
        assertVecApproxEq(collider.translation(), position, 3)
      })

      it("should assign the entity's rotation to the collider.rotation property", () => {
        Physics.setColliderPose(testEntity, position, rotation)
        const collider = Physics._Colliders.get(testEntity)!
        assertVecApproxEq(collider.rotation(), rotation, 4)
      })
    })

    describe('setMassCenter', () => {}) /** @todo The function is not implemented. It is annotated with a todo tag */
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
        physicsWorld!.timestep = 1 / 60
        const physicsState = getMutableState(PhysicsState)
        physicsState.physicsWorld!.set(physicsWorld!)
        physicsState.physicsCollisionEventQueue.set(Physics.createCollisionEventQueue())
        /** @ts-ignore  @todo Remove ts-ignore. Hookstate interprets the closure type weirdly */
        physicsState.drainCollisions.set((val) => Physics.drainCollisionEventQueue(physicsWorld!))
        /** @ts-ignore  @todo Remove ts-ignore. Hookstate interprets the closure type weirdly */
        physicsState.drainContacts.set((val) => Physics.drainContactEventQueue(physicsWorld!))

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Box })
        Physics.createCharacterController(testEntity, physicsWorld!, {})
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it("should change the `computedMovement` value for the entity's Character Controller", () => {
        const movement = new Vector3(1, 2, 3)
        const controller = Physics._Controllers.get(testEntity)!
        const before = controller.computedMovement()
        Physics.computeColliderMovement(
          testEntity, // entity: Entity,
          testEntity, // colliderEntity: Entity,
          movement // desiredTranslation: Vector3,
          // filterGroups?: InteractionGroups,
          // filterPredicate?: (collider: Collider) => boolean
        )
        const after = controller.computedMovement()
        assertVecAllApproxNotEq(before, after, 3)
      })
    }) // << computeColliderMovement

    describe('getComputedMovement', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: World | undefined = undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        physicsWorld!.timestep = 1 / 60
        const physicsState = getMutableState(PhysicsState)
        physicsState.physicsWorld!.set(physicsWorld!)
        physicsState.physicsCollisionEventQueue.set(Physics.createCollisionEventQueue())
        /** @ts-ignore  @todo Remove ts-ignore. Hookstate interprets the closure type weirdly */
        physicsState.drainCollisions.set((val) => Physics.drainCollisionEventQueue(physicsWorld!))
        /** @ts-ignore  @todo Remove ts-ignore. Hookstate interprets the closure type weirdly */
        physicsState.drainContacts.set((val) => Physics.drainContactEventQueue(physicsWorld!))

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Box })
      })

      afterEach(() => {
        removeEntity(testEntity)
        physicsWorld = undefined
        return destroyEngine()
      })

      it('should return (0,0,0) when the entity does not have a CharacterController', () => {
        const result = new Vector3(1, 2, 3)
        Physics.getComputedMovement(testEntity, result)
        assert.deepEqual(result, Vector3_Zero)
      })

      it("should return the same value contained in the `computedMovement` value of the entity's Character Controller", () => {
        Physics.createCharacterController(testEntity, physicsWorld!, {})
        const movement = new Vector3(1, 2, 3)
        const controller = Physics._Controllers.get(testEntity)!
        const before = controller.computedMovement()
        Physics.computeColliderMovement(
          testEntity, // entity: Entity,
          testEntity, // colliderEntity: Entity,
          movement // desiredTranslation: Vector3,
          // filterGroups?: InteractionGroups,
          // filterPredicate?: (collider: Collider) => boolean
        )
        const after = controller.computedMovement()
        assertVecAllApproxNotEq(before, after, 3)
        const result = new Vector3()
        Physics.getComputedMovement(testEntity, result)
        assertVecAllApproxNotEq(before, result, 3)
        assertVecApproxEq(after, result, 3)
      })
    }) // << getComputedMovement
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

    /**
    // @todo Double check the `castShape` implementation before implementing this test
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

      // @todo This setup is not hitting. Double check the `castShape` implementation before implementing this test
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
    }) // << castShape
    */
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
      let physicsWorld = undefined as World | undefined
      let testEntity1 = UndefinedEntity
      let testEntity2 = UndefinedEntity

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        physicsWorld.timestep = 1 / 60
        getMutableState(PhysicsState).physicsWorld.set(physicsWorld)

        testEntity1 = createEntity()
        setComponent(testEntity1, TransformComponent)
        setComponent(testEntity1, ColliderComponent)
        setComponent(testEntity1, RigidBodyComponent)

        testEntity2 = createEntity()
        setComponent(testEntity2, TransformComponent)
        setComponent(testEntity2, ColliderComponent)
        setComponent(testEntity2, RigidBodyComponent)
      })

      afterEach(() => {
        physicsWorld = undefined
        return destroyEngine()
      })

      function assertCollisionEventClosure(closure: any) {
        type CollisionEventClosure = (handle1: number, handle2: number, started: boolean) => void
        function hasCollisionEventClosureShape(closure: any): closure is CollisionEventClosure {
          return typeof closure === 'function' && closure.length === 3
        }
        assert.ok(closure)
        assert.ok(hasCollisionEventClosureShape(closure))
      }

      it('should return a function with the correct shape  (handle1: number, handle2: number, started: boolean) => void', () => {
        assert.ok(physicsWorld)
        const event = Physics.drainCollisionEventQueue(physicsWorld)
        assertCollisionEventClosure(event)
      })

      /**
      // @todo Why are the colliders undefined?
      it("should do nothing if any of the collider handles are not found", () => {
        assert.ok(physicsWorld)
        const event = Physics.drainCollisionEventQueue(physicsWorld)
        assertCollisionEventClosure(event)
        physicsWorld.step()
        const collider1 = Physics._Colliders.get(testEntity1)
        const collider2 = Physics._Colliders.get(testEntity2)
        assert.ok(collider1)
        assert.ok(collider2)

        event(collider1.handle, 123456, true)
        assert.ok(!hasComponent(testEntity1, CollisionComponent))
        event(collider2.handle, 123456, true)
        assert.ok(!hasComponent(testEntity2, CollisionComponent))
      })
      */

      // @todo
      // it("should add a CollisionComponent to the entities contained in the userData of the parent rigidBody of each collider  (collider.parent())", () => {})
      // when started: true
      //   should create a CollisionEvents.TRIGGER_START when either of the colliders is a sensor and `started` is true
      //   should create a CollisionEvents.COLLISION_START otherwise if `started` is true
      //   should set entity2 in the CollisionComponent of entity1 if `started` is true
      //   should set entity1 in the CollisionComponent of entity2 if `started` is true
      // when started: false
      //   should create a CollisionEvents.TRIGGER_END when either of the colliders is a sensor and `started` is false
      //   should create a CollisionEvents.COLLISION_END otherwise if `started` is false
      //   should set CollisionEvents.TRIGGER_END to the CollisionComponent.type property of entity1.collision.get(entity2) when either of the colliders is a sensor and `started` is false
      //   should set CollisionEvents.COLLISION_END to the CollisionComponent.type property of entity1.collision.get(entity2) otherwise if `started` is false
      //   should set CollisionEvents.TRIGGER_END to the CollisionComponent.type property of entity2.collision.get(entity1) when either of the colliders is a sensor and `started` is false
      //   should set CollisionEvents.COLLISION_END to the CollisionComponent.type property of entity2.collision.get(entity1) otherwise if `started` is false
    }) // << drainCollisionEventQueue

    describe('drainContactEventQueue', () => {
      let physicsWorld = undefined as World | undefined

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorld = Physics.createWorld()
        physicsWorld.timestep = 1 / 60
        getMutableState(PhysicsState).physicsWorld.set(physicsWorld)
      })

      afterEach(() => {
        physicsWorld = undefined
        return destroyEngine()
      })

      function assertContactEventClosure(closure: any) {
        type ContactEventClosure = (handle1: number, handle2: number, started: boolean) => void
        function hasContactEventClosureShape(closure: any): closure is ContactEventClosure {
          return typeof closure === 'function' && closure.length === 1
        }
        assert.ok(closure)
        assert.ok(hasContactEventClosureShape(closure))
      }

      it('should return a function with the correct shape  (event: TempContactForceEvent) => void', () => {
        assert.ok(physicsWorld)
        const closure = Physics.drainContactEventQueue(physicsWorld)
        assertContactEventClosure(closure)
      })

      // @todo
      // should store event.maxForceDirection() into the CollisionComponent.maxForceDirection of entity1.collision.get(entity2) if the collision exists
      // should store event.maxForceDirection() into the CollisionComponent.maxForceDirection of entity2.collision.get(entity1) if the collision exists
      // should store event.totalForce() into the CollisionComponent.totalForce of entity1.collision.get(entity2) if the collision exists
      // should store event.totalForce() into the CollisionComponent.totalForce of entity2.collision.get(entity1) if the collision exists
    }) // << drainContactEventQueue
  }) // << Collisions
})

/** TODO:
    describe("load", () => {}) // @todo Is there a way to check that the wasmInit() call from rapier.js has been run?
  // Character Controller
    describe("getControllerOffset", () => {})  // @deprecated
  */
