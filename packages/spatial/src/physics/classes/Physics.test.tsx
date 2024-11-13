/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { RigidBodyType, ShapeType, TempContactForceEvent, Vector, World } from '@dimforge/rapier3d-compat'
import assert from 'assert'
import sinon from 'sinon'
import { BoxGeometry, Mesh, Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'

import {
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { createEntity } from '@ir-engine/ecs/src/EntityFunctions'
import { getState } from '@ir-engine/hyperflux'

import { ObjectDirection, Q_IDENTITY, Vector3_Zero } from '../../common/constants/MathConstants'
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

import { Entity, EntityUUID, SystemDefinitions, UUIDComponent, UndefinedEntity, removeEntity } from '@ir-engine/ecs'
import { NetworkObjectComponent } from '@ir-engine/network'
import { act, render } from '@testing-library/react'
import React from 'react'
import {
  assertFloatApproxEq,
  assertFloatApproxNotEq,
  assertVecAllApproxNotEq,
  assertVecApproxEq
} from '../../../tests/util/mathAssertions'
import { smootheLerpAlpha } from '../../common/functions/MathLerpFunctions'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { SceneComponent } from '../../renderer/components/SceneComponents'
import '../../transform/TransformModule'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import '../PhysicsModule'
import { PhysicsSystem } from '../systems/PhysicsSystem'
import {
  BodyTypes,
  ColliderDescOptions,
  ColliderHitEvent,
  CollisionEvents,
  SceneQueryType,
  Shapes
} from '../types/PhysicsTypes'
import { Physics, PhysicsWorld, RapierWorldState } from './Physics'

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

describe('Physics : External API', () => {
  let physicsWorld: PhysicsWorld
  let physicsWorldEntity: Entity

  beforeEach(async () => {
    createEngine()
    await Physics.load()
    physicsWorldEntity = createEntity()
    setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
    setComponent(physicsWorldEntity, SceneComponent)
    setComponent(physicsWorldEntity, TransformComponent)
    setComponent(physicsWorldEntity, EntityTreeComponent)
    physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))
    physicsWorld.timestep = 1 / 60
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should create & remove rigidBody', async () => {
    const entity = createEntity()
    setComponent(entity, TransformComponent)
    setComponent(entity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
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
    setComponent(entity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
    setComponent(entity, RigidBodyComponent, { type: BodyTypes.Fixed })
    setComponent(entity, ColliderComponent, { shape: Shapes.Sphere })

    const rigidBodyComponent = getTagComponentForRigidBody(BodyTypes.Fixed)
    assert.deepEqual(rigidBodyComponent, RigidBodyFixedTagComponent)
  })

  /**
  // @todo External API test for `setRigidBodyType`
  it("should change the entity's RigidBody type", async () => {})
  */

  it('should create accurate InteractionGroups', async () => {
    const collisionGroup = 0x0001
    const collisionMask = 0x0003
    const interactionGroups = getInteractionGroups(collisionGroup, collisionMask)

    assert.deepEqual(interactionGroups, 65539)
  })

  it('should generate a collision event', async () => {
    const entity1 = createEntity()
    const entity2 = createEntity()
    setComponent(entity1, TransformComponent)
    setComponent(entity1, EntityTreeComponent, { parentEntity: physicsWorldEntity })
    setComponent(entity2, TransformComponent)
    setComponent(entity2, EntityTreeComponent, { parentEntity: physicsWorldEntity })

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

    const rigidBody1 = physicsWorld.Rigidbodies.get(entity1)!
    const rigidBody2 = physicsWorld.Rigidbodies.get(entity2)!

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
    //force nested reactors to run
    const { rerender, unmount } = render(<></>)

    const entity1 = createEntity()
    const entity2 = createEntity()

    setComponent(entity1, CollisionComponent)
    setComponent(entity2, CollisionComponent)

    setComponent(entity1, EntityTreeComponent, { parentEntity: physicsWorldEntity })
    setComponent(entity1, TransformComponent)
    setComponent(entity2, EntityTreeComponent, { parentEntity: physicsWorldEntity })
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

    await act(() => rerender(<></>))

    const collisionEventQueue = Physics.createCollisionEventQueue()
    const drainCollisions = Physics.drainCollisionEventQueue(physicsWorld)

    physicsWorld.step(collisionEventQueue)
    collisionEventQueue.drainCollisionEvents(drainCollisions)

    const rigidBody1 = physicsWorld.Rigidbodies.get(entity1)!
    const rigidBody2 = physicsWorld.Rigidbodies.get(entity2)!

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

describe('Physics : Rapier->ECS API', () => {
  describe('createWorld', () => {
    beforeEach(async () => {
      createEngine()
      await Physics.load()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should create a world object with the default gravity when not specified', () => {
      const world = Physics.createWorld('world' as EntityUUID)
      assert(getState(RapierWorldState)['world'])
      assert.ok(world instanceof World, 'The create world has an incorrect type.')
      const Expected = new Vector3(0.0, -9.81, 0.0)
      assertVecApproxEq(world.gravity, Expected, 3)
      Physics.destroyWorld('world' as EntityUUID)
      assert(!getState(RapierWorldState)['world'])
    })

    it('should create a world object with a different gravity value when specified', () => {
      const expected = { x: 0.0, y: -5.0, z: 0.0 }
      const world = Physics.createWorld('world' as EntityUUID, { gravity: expected, substeps: 2 })
      assertVecApproxEq(world.gravity, expected, 3)
      assert.equal(world.substeps, 2)
    })
  }) //:: createWorld

  describe('smoothKinematicBody', () => {
    // Epsilon Constants for Interpolation
    const LerpEpsilon = 0.000001
    /** @note three.js Quat.slerp fails tests at 6 significant figures, but passes at 5 */
    const SLerpEpsilon = 0.00001

    const Quaternion_Zero = new Quaternion(0, 0, 0, 1).normalize()

    /** @description Pair of `deltaTime` and `substep` values that will be used during an interpolation test */
    type Step = { dt: number; substep: number }
    /** @description Creates a Step object. @note Just a clarity/readability alias */
    function createStep(dt: number, substep: number): Step {
      return { dt, substep }
    }

    const DeltaTime = 1 / 60
    const Start = {
      position: new Vector3(1, 2, 3),
      rotation: new Quaternion(0.5, 0.3, 0.2, 0.0).normalize()
    }
    const Final = {
      position: new Vector3(4, 5, 6),
      rotation: new Quaternion(0.0, 0.2, 0.8, 0.0).normalize()
    }

    /** @description List of steps that will be tested against for both the linear and smoooth interpolation tests */
    const Step = {
      Tenth: createStep(DeltaTime, 0.1),
      Quarter: createStep(DeltaTime, 0.25),
      Half: createStep(DeltaTime, 0.5),
      One: createStep(DeltaTime, 1),
      Two: createStep(DeltaTime, 2)
    }

    /** @description {@link Step} list, in array form */
    const Steps = [Step.Tenth, Step.Quarter, Step.Half, Step.One, Step.Two]

    /** @description List of non-zero values that {@link RigidbodyComponent.targetKinematicLerpMultiplier} will be set to during the gradual smoothing tests */
    const KinematicMultiplierCases = [0.5, 0.25, 0.1, 0.01, 0.001, 0.0001, 2, 3, 4, 5]

    /**
     *  @section Initialize/Terminate the engine, entities and physics
     */
    let testEntity = UndefinedEntity
    let physicsWorld: PhysicsWorld
    let physicsWorldEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await Physics.load()
      physicsWorldEntity = createEntity()
      setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
      setComponent(physicsWorldEntity, SceneComponent)
      setComponent(physicsWorldEntity, TransformComponent)
      setComponent(physicsWorldEntity, EntityTreeComponent)
      physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))

      testEntity = createEntity()
      setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, RigidBodyComponent)
      // Set the Start..Final values for interpolation
      const body = getComponent(testEntity, RigidBodyComponent)
      body.previousPosition.set(Start.position.x, Start.position.y, Start.position.z)
      body.previousRotation.set(Start.rotation.x, Start.rotation.y, Start.rotation.z, Start.rotation.w)
      body.targetKinematicPosition.set(Final.position.x, Final.position.y, Final.position.z)
      body.targetKinematicRotation.set(Final.rotation.x, Final.rotation.y, Final.rotation.z, Final.rotation.w)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    describe('when RigidbodyComponent.targetKinematicLerpMultiplier is set to 0 ...', () => {
      /** @description Calculates the Deterministic Lerp value for the `@param entity`, as expected by the tests, based on the given {@link Step.substep} value  */
      function computeLerp(entity: Entity, step: Step) {
        const body = getComponent(entity, RigidBodyComponent)
        const result = {
          position: body.previousPosition.clone().lerp(body.targetKinematicPosition.clone(), step.substep).clone(),
          rotation: body.previousRotation.clone().slerp(body.targetKinematicRotation.clone(), step.substep).clone()
        }
        return result
      }
      /** @description Set the {@link RigidBodyComponent.targetKinematicLerpMultiplier} to 0 for all of the linear interpolation tests */
      beforeEach(() => {
        getMutableComponent(testEntity, RigidBodyComponent).targetKinematicLerpMultiplier.set(0)
      })

      it('... should apply deterministic linear interpolation to the position of the KinematicBody of the given entity', () => {
        // Check data before
        const body = getComponent(testEntity, RigidBodyComponent)
        const before = body.position.clone()
        assertVecApproxEq(before, Vector3_Zero, 3, LerpEpsilon)

        // Run and Check resulting data
        Physics.smoothKinematicBody(physicsWorld, testEntity, Step.Quarter.dt, Step.Quarter.substep)
        const after = body.position.clone()
        assertVecAllApproxNotEq(before, after, 3, LerpEpsilon)
        assertVecApproxEq(after, computeLerp(testEntity, Step.Quarter).position, 3, LerpEpsilon)
        // Check the other Step cases
        getComponent(testEntity, RigidBodyComponent).position.set(0, 0, 0) // reset for next case
        Physics.smoothKinematicBody(physicsWorld, testEntity, Step.Tenth.dt, Step.Tenth.substep)
        assertVecApproxEq(body.position.clone(), computeLerp(testEntity, Step.Tenth).position, 3, LerpEpsilon)
        getComponent(testEntity, RigidBodyComponent).position.set(0, 0, 0) // reset for next case
        Physics.smoothKinematicBody(physicsWorld, testEntity, Step.Half.dt, Step.Half.substep)
        assertVecApproxEq(body.position.clone(), computeLerp(testEntity, Step.Half).position, 3, LerpEpsilon)
        getComponent(testEntity, RigidBodyComponent).position.set(0, 0, 0) // reset for next case
        Physics.smoothKinematicBody(physicsWorld, testEntity, Step.One.dt, Step.One.substep)
        assertVecApproxEq(body.position.clone(), computeLerp(testEntity, Step.One).position, 3, LerpEpsilon)
        getComponent(testEntity, RigidBodyComponent).position.set(0, 0, 0) // reset for next case
        Physics.smoothKinematicBody(physicsWorld, testEntity, Step.Two.dt, Step.Two.substep)
        assertVecApproxEq(body.position.clone(), computeLerp(testEntity, Step.Two).position, 3, LerpEpsilon)
        // Check substep precision Step cases
        const TestCount = 1_000_000
        for (let divider = 1; divider <= TestCount; divider += 1_000) {
          const step = createStep(DeltaTime, 1 / divider)
          getComponent(testEntity, RigidBodyComponent).position.set(0, 0, 0) // reset for next case
          Physics.smoothKinematicBody(physicsWorld, testEntity, step.dt, step.substep)
          assertVecApproxEq(body.position.clone(), computeLerp(testEntity, step).position, 3, LerpEpsilon)
        }
      })

      it('... should apply deterministic spherical linear interpolation to the rotation of the KinematicBody of the given entity', () => {
        // Check data before
        const body = getComponent(testEntity, RigidBodyComponent)
        const before = body.rotation.clone()
        assertVecApproxEq(before, new Quaternion(0, 0, 0, 1), 3, SLerpEpsilon)

        // Run and Check resulting data
        Physics.smoothKinematicBody(physicsWorld, testEntity, Step.Quarter.dt, Step.Quarter.substep)
        const after = body.rotation.clone()
        assertVecAllApproxNotEq(before, after, 4, SLerpEpsilon)
        assertVecApproxEq(after, computeLerp(testEntity, Step.Quarter).rotation, 4, SLerpEpsilon)
        // Check the other Step cases
        getComponent(testEntity, RigidBodyComponent).rotation.set(0, 0, 0, 1) // reset for next case
        Physics.smoothKinematicBody(physicsWorld, testEntity, Step.Tenth.dt, Step.Tenth.substep)
        assertVecApproxEq(body.rotation.clone(), computeLerp(testEntity, Step.Tenth).rotation, 4, SLerpEpsilon)
        getComponent(testEntity, RigidBodyComponent).rotation.set(0, 0, 0, 1) // reset for next case
        Physics.smoothKinematicBody(physicsWorld, testEntity, Step.Half.dt, Step.Half.substep)
        assertVecApproxEq(body.rotation.clone(), computeLerp(testEntity, Step.Half).rotation, 4, SLerpEpsilon)
        getComponent(testEntity, RigidBodyComponent).rotation.set(0, 0, 0, 1) // reset for next case
        Physics.smoothKinematicBody(physicsWorld, testEntity, Step.One.dt, Step.One.substep)
        assertVecApproxEq(body.rotation.clone(), computeLerp(testEntity, Step.One).rotation, 4, SLerpEpsilon)
        getComponent(testEntity, RigidBodyComponent).rotation.set(0, 0, 0, 1) // reset for next case
        Physics.smoothKinematicBody(physicsWorld, testEntity, Step.Two.dt, Step.Two.substep)
        assertVecApproxEq(body.rotation.clone(), computeLerp(testEntity, Step.Two).rotation, 4, SLerpEpsilon)
        // Check substep precision Step cases
        const TestCount = 1_000_000
        for (let divider = 1; divider <= TestCount; divider += 1_000) {
          const step = createStep(DeltaTime, 1 / divider)
          getComponent(testEntity, RigidBodyComponent).rotation.set(0, 0, 0, 1) // reset for next case
          Physics.smoothKinematicBody(physicsWorld, testEntity, step.dt, step.substep)
          assertVecApproxEq(body.rotation.clone(), computeLerp(testEntity, step).rotation, 4, SLerpEpsilon)
        }
      })
    })

    describe('when RigidbodyComponent.targetKinematicLerpMultiplier is set to a value other than 0 ...', () => {
      type LerpData = {
        position: { start: Vector3; final: Vector3 }
        rotation: { start: Quaternion; final: Quaternion }
      }

      /**
       *  @description Sets the entity's {@link RigidBodyComponent.targetKinematicLerpMultiplier} property to `@param mult`
       *  @returns The `@param mult` itself  */
      function setMultiplier(entity: Entity, mult: number): number {
        getMutableComponent(entity, RigidBodyComponent).targetKinematicLerpMultiplier.set(mult)
        return mult
      }
      /**
       *  @description Sets the entity's {@link RigidBodyComponent.targetKinematicLerpMultiplier} property to `@param mult` and calculates its smooth lerp alpha
       *  @returns The exponentially smootheed Lerp Alpha value to use as `dt` in {@link smoothKinematicBody}  */
      function getAlphaWithMultiplier(entity: Entity, dt: number, mult: number): number {
        return smootheLerpAlpha(setMultiplier(entity, mult), dt)
      }

      /** @description Computes the lerp of the (`@param start`,`@param final`) input Vectors without mutating their values */
      function lerpNoRef(start: Vector3, final: Vector3, dt: number) {
        return start.clone().lerp(final.clone(), dt).clone()
      }
      /** @description Computes the fastSlerp of the (`@param start`,`@param final`) input Quaternions without mutating their values */
      function fastSlerpNoRef(start: Quaternion, final: Quaternion, dt: number) {
        return start.clone().fastSlerp(final.clone(), dt).clone()
      }

      /** @description Calculates the Exponential Lerp value for the `@param data`, as expected by the tests, based on the given `@param dt` alpha value  */
      function computeELerp(data: LerpData, alpha: number) {
        return {
          position: lerpNoRef(data.position.start, data.position.final, alpha),
          rotation: fastSlerpNoRef(data.rotation.start, data.rotation.final, alpha)
        }
      }

      it('... should apply gradual smoothing (aka exponential interpolation) to the position of the KinematicBody of the given entity', () => {
        // Check data before
        const body = getComponent(testEntity, RigidBodyComponent)
        const before = body.position.clone()
        assertVecApproxEq(before, Vector3_Zero, 3, LerpEpsilon)

        // Run and Check resulting data
        // ... Infinite smoothing case
        const MultInfinite = 1 // Multiplier 1 shouldn't change the position (aka. infinite smoothing)
        setMultiplier(testEntity, MultInfinite)
        Physics.smoothKinematicBody(physicsWorld, testEntity, DeltaTime, /*substep*/ 1)
        assertVecApproxEq(before, body.position, 3, LerpEpsilon)

        // ... Hardcoded case
        setMultiplier(testEntity, 0.12345)
        Physics.smoothKinematicBody(physicsWorld, testEntity, 1 / 60, 1)
        const ExpectedHardcoded = { x: 0.1370581001805662, y: 0.17132262522570774, z: 0.20558715027084928 }
        assertVecApproxEq(body.position.clone(), ExpectedHardcoded, 3)

        // ... Check the other Step cases
        for (const multiplier of KinematicMultiplierCases) {
          for (const step of Steps) {
            getComponent(testEntity, RigidBodyComponent).position.set(0, 0, 0) // reset for next case
            const alpha = getAlphaWithMultiplier(testEntity, step.dt, multiplier)
            const before = {
              position: { start: body.position.clone(), final: body.targetKinematicPosition.clone() },
              rotation: { start: body.rotation.clone(), final: body.targetKinematicRotation.clone() }
            }
            Physics.smoothKinematicBody(physicsWorld, testEntity, step.dt, step.substep)
            assertVecApproxEq(body.position, computeELerp(before, alpha).position, 3, LerpEpsilon)
          }
        }
      })

      it('... should apply gradual smoothing (aka exponential interpolation) to the rotation of the KinematicBody of the given entity', () => {
        // Check data before
        const body = getComponent(testEntity, RigidBodyComponent)
        const before = body.rotation.clone()
        assertVecApproxEq(before, Quaternion_Zero, 4, SLerpEpsilon)

        // Run and Check resulting data
        // ... Infinite smoothing case
        const MultInfinite = 1 // Multiplier 1 shouldn't change the rotation (aka. infinite smoothing)
        setMultiplier(testEntity, MultInfinite)
        Physics.smoothKinematicBody(physicsWorld, testEntity, DeltaTime, /*substep*/ 1)
        assertVecApproxEq(before, body.rotation, 3, SLerpEpsilon)

        // ... Hardcoded case
        setMultiplier(testEntity, 0.12345)
        Physics.smoothKinematicBody(physicsWorld, testEntity, 1 / 60, 1)
        const ExpectedHardcoded = new Quaternion(0, 0.013047535062645674, 0.052190140250582696, 0.9985524073985961)
        assertVecApproxEq(body.rotation.clone(), ExpectedHardcoded, 4)

        // ... Check the other Step cases
        for (const multiplier of KinematicMultiplierCases) {
          for (const step of Steps) {
            getComponent(testEntity, RigidBodyComponent).rotation.set(0, 0, 0, 1) // reset for next case
            const alpha = getAlphaWithMultiplier(testEntity, step.dt, multiplier)
            const before = {
              position: { start: body.position.clone(), final: body.targetKinematicPosition.clone() },
              rotation: { start: body.rotation.clone(), final: body.targetKinematicRotation.clone() }
            } as LerpData
            Physics.smoothKinematicBody(physicsWorld, testEntity, step.dt, step.substep)
            assertVecApproxEq(body.rotation, computeELerp(before, alpha).rotation, 3, SLerpEpsilon)
          }
        }
      })
    })
  }) //:: smoothKinematicBody

  describe('Rigidbodies', () => {
    describe('createRigidBody', () => {
      const position = new Vector3(1, 2, 3)
      const rotation = new Quaternion(0.2, 0.3, 0.5, 0.0).normalize()

      const scale = new Vector3(10, 10, 10)
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld
      let physicsWorldEntity: Entity

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        physicsWorldEntity = createEntity()
        setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
        physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))
        setComponent(physicsWorldEntity, SceneComponent)
        setComponent(physicsWorldEntity, TransformComponent)
        setComponent(physicsWorldEntity, EntityTreeComponent)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
        setComponent(testEntity, TransformComponent, { position: position, scale: scale, rotation: rotation })
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic, canSleep: true, gravityScale: 0 })
        RigidBodyComponent.reactorMap.get(testEntity)!.stop()
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should create a rigidBody successfully', () => {
        Physics.createRigidBody(physicsWorld, testEntity)
        const body = physicsWorld.Rigidbodies.get(testEntity)
        assert.ok(body)
      })

      it("shouldn't mark the entity transform as dirty", () => {
        Physics.createRigidBody(physicsWorld, testEntity)
        assert.ok(TransformComponent.dirtyTransforms[testEntity] == false)
      })

      it('should assign the correct RigidBodyType enum', () => {
        Physics.createRigidBody(physicsWorld, testEntity)
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        assert.equal(body.bodyType(), RigidBodyType.Dynamic)
      })

      it("should assign the entity's position to the rigidBody.translation property", () => {
        Physics.createRigidBody(physicsWorld, testEntity)
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        assertVecApproxEq(body.translation(), position, 3)
      })

      it("should assign the entity's rotation to the rigidBody.rotation property", () => {
        Physics.createRigidBody(physicsWorld, testEntity)
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        assertVecApproxEq(body!.rotation(), rotation, 4)
      })

      it('should create a body with no Linear Velocity', () => {
        Physics.createRigidBody(physicsWorld, testEntity)
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        assertVecApproxEq(body.linvel(), Vector3_Zero, 3)
      })

      it('should create a body with no Angular Velocity', () => {
        Physics.createRigidBody(physicsWorld, testEntity)
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        assertVecApproxEq(body.angvel(), Vector3_Zero, 3)
      })

      it('should store the entity in the body', () => {
        Physics.createRigidBody(physicsWorld, testEntity)
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        assert.deepEqual(body.entity, testEntity)
      })
    })

    describe('removeRigidbody', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        RigidBodyComponent.reactorMap.get(testEntity)!.stop()
        Physics.createRigidBody(physicsWorld, testEntity)
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should successfully remove the body from the RigidBodies map', () => {
        let body = physicsWorld.Rigidbodies.get(testEntity)
        assert.ok(body)
        Physics.removeRigidbody(physicsWorld, testEntity)
        body = physicsWorld.Rigidbodies.get(testEntity)
        assert.equal(body, undefined)
      })
    })

    describe('isSleeping', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        RigidBodyComponent.reactorMap.get(testEntity)!.stop()
        Physics.createRigidBody(physicsWorld, testEntity)
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should return the correct values', () => {
        const noBodyEntity = createEntity()
        assert.equal(
          Physics.isSleeping(physicsWorld, noBodyEntity),
          true,
          'Returns true when the entity does not have a RigidBody'
        )
        assert.equal(
          Physics.isSleeping(physicsWorld, testEntity),
          false,
          "Returns false when the entity is first created and physics haven't been simulated yet"
        )
      })
    })

    describe('wakeUp', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        RigidBodyComponent.reactorMap.get(testEntity)!.stop()
        Physics.createRigidBody(physicsWorld, testEntity)
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should wake up the body', () => {
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        body.sleep()
        assert.equal(body.isSleeping(), true)
        Physics.wakeUp(physicsWorld, testEntity)
        assert.equal(body.isSleeping(), false)
      })
    })

    describe('setRigidBodyType', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        RigidBodyComponent.reactorMap.get(testEntity)!.stop()
        Physics.createRigidBody(physicsWorld, testEntity)
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it("should assign the correct RigidBodyType to the entity's body", () => {
        let body = physicsWorld.Rigidbodies.get(testEntity)!
        assert.equal(body.bodyType(), RigidBodyType.Dynamic)
        // Check change to fixed
        Physics.setRigidBodyType(physicsWorld, testEntity, BodyTypes.Fixed)
        body = physicsWorld.Rigidbodies.get(testEntity)!
        assert.notEqual(body.bodyType(), RigidBodyType.Dynamic, "The RigidBody's type was not changed")
        assert.equal(body.bodyType(), RigidBodyType.Fixed, "The RigidBody's type was not changed to Fixed")
        // Check change to dynamic
        Physics.setRigidBodyType(physicsWorld, testEntity, BodyTypes.Dynamic)
        body = physicsWorld.Rigidbodies.get(testEntity)!
        assert.notEqual(body.bodyType(), RigidBodyType.Fixed, "The RigidBody's type was not changed")
        assert.equal(body.bodyType(), RigidBodyType.Dynamic, "The RigidBody's type was not changed to Dynamic")
        // Check change to kinematic
        Physics.setRigidBodyType(physicsWorld, testEntity, BodyTypes.Kinematic)
        body = physicsWorld.Rigidbodies.get(testEntity)!
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
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        RigidBodyComponent.reactorMap.get(testEntity)!.stop()
        Physics.createRigidBody(physicsWorld, testEntity)
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it("should set the body's Translation to the given Position", () => {
        Physics.setRigidbodyPose(physicsWorld, testEntity, position, rotation, linVel, angVel)
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        assertVecApproxEq(body.translation(), position, 3)
      })

      it("should set the body's Rotation to the given value", () => {
        Physics.setRigidbodyPose(physicsWorld, testEntity, position, rotation, linVel, angVel)
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        assertVecApproxEq(body.rotation(), rotation, 4)
      })

      it("should set the body's Linear Velocity to the given value", () => {
        Physics.setRigidbodyPose(physicsWorld, testEntity, position, rotation, linVel, angVel)
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        assertVecApproxEq(body.linvel(), linVel, 3)
      })

      it("should set the body's Angular Velocity to the given value", () => {
        Physics.setRigidbodyPose(physicsWorld, testEntity, position, rotation, linVel, angVel)
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        assertVecApproxEq(body.angvel(), angVel, 3)
      })
    })

    describe('enabledCcd', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        RigidBodyComponent.reactorMap.get(testEntity)!.stop()
        Physics.createRigidBody(physicsWorld, testEntity)
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should enable Continuous Collision Detection on the entity', () => {
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        assert.equal(body.isCcdEnabled(), false)
        Physics.enabledCcd(physicsWorld, testEntity, true)
        assert.equal(body.isCcdEnabled(), true)
      })

      it('should disable CCD on the entity when passing `false` to the `enabled` property', () => {
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        Physics.enabledCcd(physicsWorld, testEntity, true)
        assert.equal(body.isCcdEnabled(), true)
        Physics.enabledCcd(physicsWorld, testEntity, false)
        assert.equal(body.isCcdEnabled(), false)
      })
    })

    describe('applyImpulse', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      const physicsSystemExecute = SystemDefinitions.get(PhysicsSystem)!.execute

      it('should apply the impulse to the RigidBody of the entity', () => {
        const testImpulse = new Vector3(1, 2, 3)
        const beforeBody = physicsWorld.Rigidbodies.get(testEntity)
        assert.ok(beforeBody)
        const before = beforeBody.linvel()
        assertVecApproxEq(before, Vector3_Zero, 3)
        Physics.applyImpulse(physicsWorld, testEntity, testImpulse)
        physicsSystemExecute()
        const afterBody = physicsWorld.Rigidbodies.get(testEntity)
        assert.ok(afterBody)
        const after = afterBody.linvel()
        assertVecAllApproxNotEq(after, before, 3)
      })
    })

    describe('lockRotations', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should lock rotations on the entity', () => {
        const impulse = new Vector3(1, 2, 3)
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        const before = { x: body.angvel().x, y: body.angvel().y, z: body.angvel().z }
        assertVecApproxEq(before, Vector3_Zero, 3)

        body.applyTorqueImpulse(impulse, false)
        const dummy = { x: body.angvel().x, y: body.angvel().y, z: body.angvel().z }
        assertVecAllApproxNotEq(before, dummy, 3)

        Physics.lockRotations(physicsWorld, testEntity, true)
        body.applyTorqueImpulse(impulse, false)
        const after = { x: body.angvel().x, y: body.angvel().y, z: body.angvel().z }
        assertVecApproxEq(dummy, after, 3)
      })

      /**
      // @todo Fix this test when we update to Rapier >= v0.12
      it('should disable locked rotations on the entity', () => {
        const ExpectedValue = new Quaternion(0.5, 0.3, 0.2, 0.0).normalize()
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        assert.notDeepEqual(body.rotation(), ExpectedValue)

        Physics.lockRotations(testEntity, true)
        body.setRotation(ExpectedValue, false)
        console.log(JSON.stringify(body.rotation()), "BEFORE")
        console.log(JSON.stringify(ExpectedValue), "Expected")
        assertVecAllApproxNotEq(body.rotation(), ExpectedValue, 3)
        // assert.notDeepEqual(body.rotation(), ExpectedValue)

        Physics.lockRotations(testEntity, true)
        console.log(JSON.stringify(body.rotation()), "AFTEr")
        assertVecApproxEq(body.rotation(), ExpectedValue, 4)
      })
      */
    })

    describe('setEnabledRotations', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should disable rotations on the X axis for the rigidBody of the entity', () => {
        const testImpulse = new Vector3(1, 2, 3)
        const enabledRotation = [false, true, true] as [boolean, boolean, boolean]
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        const before = body.angvel()
        assertVecApproxEq(before, Vector3_Zero, 3)
        Physics.setEnabledRotations(physicsWorld, testEntity, enabledRotation)
        body.applyTorqueImpulse(testImpulse, false)
        physicsWorld!.step()
        const after = body.angvel()
        assertFloatApproxEq(after.x, before.x)
        assertFloatApproxNotEq(after.y, before.y)
        assertFloatApproxNotEq(after.z, before.z)
      })

      it('should disable rotations on the Y axis for the rigidBody of the entity', () => {
        const testImpulse = new Vector3(1, 2, 3)
        const enabledRotation = [true, false, true] as [boolean, boolean, boolean]
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        const before = body.angvel()
        assertVecApproxEq(before, Vector3_Zero, 3)
        Physics.setEnabledRotations(physicsWorld, testEntity, enabledRotation)
        body.applyTorqueImpulse(testImpulse, false)
        physicsWorld!.step()
        const after = body.angvel()
        assertFloatApproxNotEq(after.x, before.x)
        assertFloatApproxEq(after.y, before.y)
        assertFloatApproxNotEq(after.z, before.z)
      })

      it('should disable rotations on the Z axis for the rigidBody of the entity', () => {
        const testImpulse = new Vector3(1, 2, 3)
        const enabledRotation = [true, true, false] as [boolean, boolean, boolean]
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        const before = body.angvel()
        assertVecApproxEq(before, Vector3_Zero, 3)
        Physics.setEnabledRotations(physicsWorld, testEntity, enabledRotation)
        body.applyTorqueImpulse(testImpulse, false)
        physicsWorld!.step()
        const after = body.angvel()
        assertFloatApproxNotEq(after.x, before.x)
        assertFloatApproxNotEq(after.y, before.y)
        assertFloatApproxEq(after.z, before.z)
      })
    })

    describe('updatePreviousRigidbodyPose', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it("should set the previous position of the entity's RigidBodyComponent", () => {
        const Expected = new Vector3(1, 2, 3)
        const body = physicsWorld.Rigidbodies.get(testEntity)!
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
        const body = physicsWorld.Rigidbodies.get(testEntity)!
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
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })
      it('should not update the pose and velocity for an entity that has a NetworkObjectComponent but no NetworkAuthorityComponent', () => {
        setComponent(testEntity, NetworkObjectComponent)
        const impulse = new Vector3(1, 2, 3)
        const body = physicsWorld.Rigidbodies.get(testEntity)!
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
        assertVecApproxEq(before, after, 3)
      })
      it("should set the position of the entity's RigidBodyComponent", () => {
        const position = new Vector3(1, 2, 3)
        const body = physicsWorld.Rigidbodies.get(testEntity)!
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
        const body = physicsWorld.Rigidbodies.get(testEntity)!
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
        const body = physicsWorld.Rigidbodies.get(testEntity)!
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
        const body = physicsWorld.Rigidbodies.get(testEntity)!
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
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Kinematic })
        setComponent(testEntity, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it("should set the nextTranslation property of the entity's Kinematic RigidBody", () => {
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        const before = body.nextTranslation()
        Physics.setKinematicRigidbodyPose(physicsWorld, testEntity, position, rotation)
        const after = body.nextTranslation()
        assertVecAllApproxNotEq(before, after, 3)
      })

      it("should set the nextRotation property of the entity's Kinematic RigidBody", () => {
        const body = physicsWorld.Rigidbodies.get(testEntity)!
        const before = body.nextRotation()
        Physics.setKinematicRigidbodyPose(physicsWorld, testEntity, position, rotation)
        const after = body.nextRotation()
        assertVecAllApproxNotEq(before, after, 4)
      })
    })
  }) // << Rigidbodies

  describe('Colliders', () => {
    describe('setTrigger', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should mark the collider of the entity as a sensor', () => {
        const collider = physicsWorld.Colliders.get(testEntity)!
        Physics.setTrigger(physicsWorld, testEntity, true)
        assert.ok(collider.isSensor())
      })

      it('should add CollisionGroup.trigger to the interaction groups of the collider when `isTrigger` is passed as true', () => {
        const collider = physicsWorld.Colliders.get(testEntity)!
        Physics.setTrigger(physicsWorld, testEntity, true)
        const triggerInteraction = getInteractionGroups(CollisionGroups.Trigger, 0) // Shift the Trigger bits into the interaction bits, so they don't match with the mask
        const hasTriggerInteraction = Boolean(collider.collisionGroups() & triggerInteraction) // If interactionGroups contains the triggerInteraction bits
        assert.ok(hasTriggerInteraction)
      })

      it('should not add CollisionGroup.trigger to the interaction groups of the collider when `isTrigger` is passed as false', () => {
        const collider = physicsWorld.Colliders.get(testEntity)!
        Physics.setTrigger(physicsWorld, testEntity, false)
        const triggerInteraction = getInteractionGroups(CollisionGroups.Trigger, 0) // Shift the Trigger bits into the interaction bits, so they don't match with the mask
        const notTriggerInteraction = !(collider.collisionGroups() & triggerInteraction) // If interactionGroups does not contain the triggerInteraction bits
        assert.ok(notTriggerInteraction)
      })
    }) // << setTrigger

    describe('setCollisionLayer', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should set the collider interaction groups to the given value', () => {
        const data = getComponent(testEntity, ColliderComponent)
        const ExpectedLayer = CollisionGroups.Avatars | data.collisionLayer
        const Expected = getInteractionGroups(ExpectedLayer, data.collisionMask)
        const before = physicsWorld.Colliders.get(testEntity)!.collisionGroups()
        Physics.setCollisionLayer(physicsWorld, testEntity, ExpectedLayer)
        const after = physicsWorld.Colliders.get(testEntity)!.collisionGroups()
        assert.notEqual(before, Expected)
        assert.equal(after, Expected)
      })

      it('should not modify the collision mask of the collider', () => {
        const data = getComponent(testEntity, ColliderComponent)
        const newLayer = CollisionGroups.Avatars
        const Expected = getInteractionGroups(newLayer, data.collisionMask)
        Physics.setCollisionLayer(physicsWorld, testEntity, newLayer)
        const after = physicsWorld.Colliders.get(testEntity)!.collisionGroups()
        assert.equal(after, Expected)
      })

      it('should not add CollisionGroups.Trigger to the collider interaction groups if the entity does not have a TriggerComponent', () => {
        Physics.setCollisionLayer(physicsWorld, testEntity, CollisionGroups.Avatars)
        const after = physicsWorld.Colliders.get(testEntity)!.collisionGroups()
        const noTriggerBit = !(after & getInteractionGroups(CollisionGroups.Trigger, 0)) // not collisionLayer contains Trigger
        assert.ok(noTriggerBit)
      })

      it('should not modify the CollisionGroups.Trigger bit in the collider interaction groups if the entity has a TriggerComponent', () => {
        const triggerLayer = getInteractionGroups(CollisionGroups.Trigger, 0) // Create the triggerLayer groups bitmask
        setComponent(testEntity, TriggerComponent)
        const beforeGroups = physicsWorld.Colliders.get(testEntity)!.collisionGroups()
        const before = getInteractionGroups(beforeGroups & triggerLayer, 0) === triggerLayer // beforeGroups.collisionLayer contains Trigger
        Physics.setCollisionLayer(physicsWorld, testEntity, CollisionGroups.Avatars)
        const afterGroups = physicsWorld.Colliders.get(testEntity)!.collisionGroups()
        const after = getInteractionGroups(afterGroups & triggerLayer, 0) === triggerLayer // afterGroups.collisionLayer contains Trigger
        assert.equal(before, after)
      })
    }) // setCollisionLayer

    describe('setCollisionMask', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should set the collider mask to the given value', () => {
        const before = getComponent(testEntity, ColliderComponent)
        const Expected = CollisionGroups.Avatars | before.collisionMask
        Physics.setCollisionMask(physicsWorld, testEntity, Expected)
        const after = getComponent(testEntity, ColliderComponent)
        assert.equal(after.collisionMask, Expected)
      })

      it('should not modify the collision layer of the collider', () => {
        const before = getComponent(testEntity, ColliderComponent)
        Physics.setCollisionMask(physicsWorld, testEntity, CollisionGroups.Avatars)
        const after = getComponent(testEntity, ColliderComponent)
        assert.equal(before.collisionLayer, after.collisionLayer)
      })

      it('should not add CollisionGroups.Trigger to the collider mask if the entity does not have a TriggerComponent', () => {
        Physics.setCollisionMask(physicsWorld, testEntity, CollisionGroups.Avatars)
        const after = getComponent(testEntity, ColliderComponent)
        const noTriggerBit = !(after.collisionMask & CollisionGroups.Trigger) // not collisionMask contains Trigger
        assert.ok(noTriggerBit)
      })

      it('should not modify the CollisionGroups.Trigger bit in the collider mask if the entity has a TriggerComponent', () => {
        setComponent(testEntity, TriggerComponent)
        const beforeData = getComponent(testEntity, ColliderComponent)
        const before = beforeData.collisionMask & CollisionGroups.Trigger // collisionMask contains Trigger
        Physics.setCollisionMask(physicsWorld, testEntity, CollisionGroups.Avatars)

        const afterData = getComponent(testEntity, ColliderComponent)
        const after = afterData.collisionMask & CollisionGroups.Trigger // collisionMask contains Trigger
        assert.equal(before, after)
      })
    }) // setCollisionMask

    describe('setFriction', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should set the friction value on the entity', () => {
        const ExpectedValue = 42
        const collider = physicsWorld.Colliders.get(testEntity)!
        assert.notEqual(collider.friction(), ExpectedValue)
        Physics.setFriction(physicsWorld, testEntity, ExpectedValue)
        assert.equal(collider.friction(), ExpectedValue)
      })
    }) // << setFriction

    describe('setRestitution', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should set the restitution value on the entity', () => {
        const ExpectedValue = 42
        const collider = physicsWorld.Colliders.get(testEntity)!
        assert.notEqual(collider.restitution(), ExpectedValue)
        Physics.setRestitution(physicsWorld, testEntity, ExpectedValue)
        assert.equal(collider.restitution(), ExpectedValue)
      })
    }) // << setRestitution

    describe('setMass', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should set the mass value on the entity', () => {
        const ExpectedValue = 42
        const collider = physicsWorld.Colliders.get(testEntity)!
        assert.notEqual(collider.mass(), ExpectedValue)
        Physics.setMass(physicsWorld, testEntity, ExpectedValue)
        assert.equal(collider.mass(), ExpectedValue)
      })
    }) // << setMass

    describe('getShape', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should return a sphere shape', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
        Physics.createRigidBody(physicsWorld, testEntity)
        assert.equal(Physics.getShape(physicsWorld, testEntity), Shapes.Sphere)
      })

      it('should return a capsule shape', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Capsule })
        Physics.createRigidBody(physicsWorld, testEntity)
        assert.equal(Physics.getShape(physicsWorld, testEntity), Shapes.Capsule)
      })

      it('should return a cylinder shape', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Cylinder })
        Physics.createRigidBody(physicsWorld, testEntity)
        assert.equal(Physics.getShape(physicsWorld, testEntity), Shapes.Cylinder)
      })

      it('should return a box shape', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Box })
        Physics.createRigidBody(physicsWorld, testEntity)
        assert.equal(Physics.getShape(physicsWorld, testEntity), Shapes.Box)
      })

      it('should return a plane shape', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Plane })
        Physics.createRigidBody(physicsWorld, testEntity)
        assert.equal(Physics.getShape(physicsWorld, testEntity), Shapes.Box) // The Shapes.Plane case is implemented as a box in the engine
      })

      it('should return undefined for the convex_hull case', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.ConvexHull })
        Physics.createRigidBody(physicsWorld, testEntity)
        assert.equal(Physics.getShape(physicsWorld, testEntity), undefined /** @todo Shapes.ConvexHull */)
      })

      it('should return undefined for the mesh case', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Mesh })
        Physics.createRigidBody(physicsWorld, testEntity)
        assert.equal(Physics.getShape(physicsWorld, testEntity), undefined /** @todo Shapes.Mesh */)
      })

      /**
      // @todo Heightfield is not supported yet. Triggers an Error exception
      it("should return undefined for the heightfield case", () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Heightfield })
        Physics.createRigidBody(physicsWorld, testEntity)
        assert.equal(Physics.getShape(physicsWorld, testEntity), Shapes.Heightfield)
      })
      */
    }) // << getShape

    describe('removeCollider', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Box })
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it("should remove the entity's collider", () => {
        const before = physicsWorld.Colliders.get(testEntity)
        assert.notEqual(before, undefined)
        Physics.removeCollider(physicsWorld!, testEntity)
        const after = physicsWorld.Colliders.get(testEntity)
        assert.equal(after, undefined)
      })
    }) // << removeCollider

    describe('removeCollidersFromRigidBody', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should remove all Colliders from the RigidBody when called', () => {
        const before = physicsWorld.Rigidbodies.get(testEntity)!
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

      let physicsWorld: PhysicsWorld
      let testEntity = UndefinedEntity
      let rootEntity = UndefinedEntity

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        rootEntity = createEntity()
        setComponent(rootEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(rootEntity, TransformComponent)
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: rootEntity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, ColliderComponent)
        setComponent(rootEntity, RigidBodyComponent)
      })

      afterEach(() => {
        removeEntity(testEntity)
        removeEntity(rootEntity)
        return destroyEngine()
      })

      it('should return early if the given `rootEntity` does not have a RigidBody', () => {
        removeComponent(rootEntity, RigidBodyComponent)
        const result = Physics.createColliderDesc(physicsWorld, testEntity, rootEntity)
        assert.equal(result, undefined)
      })

      it('should return a descriptor with the expected default values', () => {
        const result = Physics.createColliderDesc(physicsWorld, testEntity, rootEntity)
        for (const key in Default) {
          if (typeof Default[key] === 'object' && 'x' in Default[key]) {
            assertVecApproxEq(result[key], Default[key], 3)
          } else {
            assert.deepEqual(result[key], Default[key])
          }
        }
      })

      it('should set the friction to the same value as the ColliderComponent', () => {
        const result = Physics.createColliderDesc(physicsWorld, testEntity, rootEntity)
        assert.equal(result.friction, getComponent(testEntity, ColliderComponent).friction)
      })

      it('should set the restitution to the same value as the ColliderComponent', () => {
        const result = Physics.createColliderDesc(physicsWorld, testEntity, rootEntity)
        assert.equal(result.restitution, getComponent(testEntity, ColliderComponent).restitution)
      })

      it('should set the collisionGroups to the same value as the ColliderComponent layer and mask', () => {
        const result = Physics.createColliderDesc(physicsWorld, testEntity, rootEntity)
        const data = getComponent(testEntity, ColliderComponent)
        assert.equal(result.collisionGroups, getInteractionGroups(data.collisionLayer, data.collisionMask))
      })

      it('should set the sensor property according to whether the entity has a TriggerComponent or not', () => {
        const noTriggerDesc = Physics.createColliderDesc(physicsWorld, testEntity, rootEntity)
        assert.equal(noTriggerDesc.isSensor, hasComponent(testEntity, TriggerComponent))
        setComponent(testEntity, TriggerComponent)
        const triggerDesc = Physics.createColliderDesc(physicsWorld, testEntity, rootEntity)
        assert.equal(triggerDesc.isSensor, hasComponent(testEntity, TriggerComponent))
      })

      it('should set the shape to a Ball when the ColliderComponent shape is a Sphere', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
        const result = Physics.createColliderDesc(physicsWorld, testEntity, rootEntity)
        assert.equal(result.shape.type, ShapeType.Ball)
      })

      it('should set the shape to a Cuboid when the ColliderComponent shape is a Box', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Box })
        const result = Physics.createColliderDesc(physicsWorld, testEntity, rootEntity)
        assert.equal(result.shape.type, ShapeType.Cuboid)
      })

      it('should set the shape to a Cuboid when the ColliderComponent shape is a Plane', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Plane })
        const result = Physics.createColliderDesc(physicsWorld, testEntity, rootEntity)
        assert.equal(result.shape.type, ShapeType.Cuboid)
      })

      it('should set the shape to a TriMesh when the ColliderComponent shape is a Mesh', () => {
        setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Mesh })
        const result = Physics.createColliderDesc(physicsWorld, testEntity, rootEntity)
        assert.equal(result.shape.type, ShapeType.TriMesh)
      })

      it('should set the shape to a ConvexPolyhedron when the ColliderComponent shape is a ConvexHull', () => {
        setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
        setComponent(testEntity, ColliderComponent, { shape: Shapes.ConvexHull })
        const result = Physics.createColliderDesc(physicsWorld, testEntity, rootEntity)
        assert.equal(result.shape.type, ShapeType.ConvexPolyhedron)
      })

      it('should set the shape to a Cylinder when the ColliderComponent shape is a Cylinder', () => {
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Cylinder })
        const result = Physics.createColliderDesc(physicsWorld, testEntity, rootEntity)
        assert.equal(result.shape.type, ShapeType.Cylinder)
      })

      it('should set the position relative to the parent entity', () => {
        const result = Physics.createColliderDesc(physicsWorld, testEntity, rootEntity)
        assertVecApproxEq(result.translation, Vector3_Zero, 3)
      })

      it('should set the rotation relative to the parent entity', () => {
        const result = Physics.createColliderDesc(physicsWorld, testEntity, rootEntity)
        assertVecApproxEq(result.rotation, Q_IDENTITY, 4)
      })
    })

    describe('attachCollider', () => {
      let testEntity = UndefinedEntity
      let rigidbodyEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Box })
        rigidbodyEntity = createEntity()
        setComponent(rigidbodyEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(rigidbodyEntity, TransformComponent)
        setComponent(rigidbodyEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(rigidbodyEntity, ColliderComponent, { shape: Shapes.Box })
      })

      afterEach(() => {
        removeEntity(testEntity)
        removeEntity(rigidbodyEntity)
        return destroyEngine()
      })

      it("should return undefined when rigidBodyEntity doesn't have a RigidBodyComponent", () => {
        removeComponent(rigidbodyEntity, RigidBodyComponent)
        const colliderDesc = Physics.createColliderDesc(physicsWorld, testEntity, rigidbodyEntity)
        const result = Physics.attachCollider(physicsWorld!, colliderDesc, rigidbodyEntity, testEntity)
        assert.equal(result, undefined)
      })

      it('should add the collider to the physicsWorld.Colliders map', () => {
        ColliderComponent.reactorMap.get(testEntity)!.stop()
        const colliderDesc = Physics.createColliderDesc(physicsWorld, testEntity, rigidbodyEntity)
        const result = Physics.attachCollider(physicsWorld!, colliderDesc, rigidbodyEntity, testEntity)!
        const expected = physicsWorld.Colliders.get(testEntity)
        assert.ok(result)
        assert.ok(expected)
        assert.deepEqual(result.handle, expected.handle)
      })
    })

    describe('setColliderPose', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld
      const position = new Vector3(1, 2, 3)
      const rotation = new Quaternion(0.5, 0.4, 0.1, 0.0).normalize()

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Box })
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it("should assign the entity's position to the collider.translation property", () => {
        Physics.setColliderPose(physicsWorld, testEntity, position, rotation)
        const collider = physicsWorld.Colliders.get(testEntity)!
        // need to step to update the collider's position
        physicsWorld.step()
        assertVecApproxEq(collider.translation(), position, 3, 0.01)
      })

      it("should assign the entity's rotation to the collider.rotation property", () => {
        Physics.setColliderPose(physicsWorld, testEntity, position, rotation)
        const collider = physicsWorld.Colliders.get(testEntity)!
        // need to step to update the collider's position
        physicsWorld.step()
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
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Mesh })
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should store a character controller in the Controllers map', () => {
        const before = physicsWorld.Controllers.get(testEntity)
        assert.equal(before, undefined)
        Physics.createCharacterController(physicsWorld, testEntity, {})
        const after = physicsWorld.Controllers.get(testEntity)
        assert.ok(after)
      })

      it('should create a the character controller with the expected defaults when they are omitted', () => {
        Physics.createCharacterController(physicsWorld, testEntity, {})
        const controller = physicsWorld.Controllers.get(testEntity)
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
        Physics.createCharacterController(physicsWorld, testEntity, Expected)
        const controller = physicsWorld.Controllers.get(testEntity)
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
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Mesh })
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should remove the character controller from the Controllers map', () => {
        const before = physicsWorld.Controllers.get(testEntity)
        assert.equal(before, undefined)
        Physics.createCharacterController(physicsWorld, testEntity, {})
        const created = physicsWorld.Controllers.get(testEntity)
        assert.ok(created)
        Physics.removeCharacterController(physicsWorld, testEntity)
        const after = physicsWorld.Controllers.get(testEntity)
        assert.equal(after, undefined)
      })
    })

    describe('computeColliderMovement', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Box })
        Physics.createCharacterController(physicsWorld, testEntity, {})
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it("should change the `computedMovement` value for the entity's Character Controller", () => {
        const movement = new Vector3(1, 2, 3)
        const controller = physicsWorld.Controllers.get(testEntity)!
        const before = controller.computedMovement()
        Physics.computeColliderMovement(
          physicsWorld,
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
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity, ColliderComponent, { shape: Shapes.Box })
      })

      afterEach(() => {
        removeEntity(testEntity)
        return destroyEngine()
      })

      it('should return (0,0,0) when the entity does not have a CharacterController', () => {
        const result = new Vector3(1, 2, 3)
        Physics.getComputedMovement(physicsWorld, testEntity, result)
        assertVecApproxEq(result, Vector3_Zero, 3)
      })

      it("should return the same value contained in the `computedMovement` value of the entity's Character Controller", () => {
        Physics.createCharacterController(physicsWorld, testEntity, {})
        const movement = new Vector3(1, 2, 3)
        const controller = physicsWorld.Controllers.get(testEntity)!
        const before = controller.computedMovement()
        Physics.computeColliderMovement(
          physicsWorld,
          testEntity, // entity: Entity,
          testEntity, // colliderEntity: Entity,
          movement // desiredTranslation: Vector3,
          // filterGroups?: InteractionGroups,
          // filterPredicate?: (collider: Collider) => boolean
        )
        const after = controller.computedMovement()
        assertVecAllApproxNotEq(before, after, 3)
        const result = new Vector3()
        Physics.getComputedMovement(physicsWorld, testEntity, result)
        assertVecAllApproxNotEq(before, result, 3)
        assertVecApproxEq(after, result, 3)
      })
    }) // << getComputedMovement
  }) // << CharacterControllers

  describe('Raycasts', () => {
    describe('castRay', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
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
        assert.deepEqual(hits[0].body.entity, testEntity)
      })
    })

    describe('castRayFromCamera', () => {
      let testEntity = UndefinedEntity
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
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
      let physicsWorld: PhysicsWorld

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld!.timestep = 1 / 60

        // Create the entity
        testEntity = createEntity()
        setComponent(testEntity, EntityTreeComponent, { parentEntity: entity })
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
        return destroyEngine()
      })

      // @todo This setup is not hitting. Double check the `castShape` implementation before implementing this test
      it('should cast a shape and hit a rigidbody', () => {
        physicsWorld!.step()

        const collider = physicsWorld.Colliders.get(testEntity)!
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
      const InvalidHandle = 8198123
      let physicsWorld: PhysicsWorld
      let testEntity1 = UndefinedEntity
      let testEntity2 = UndefinedEntity

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld.timestep = 1 / 60

        testEntity1 = createEntity()
        setComponent(testEntity1, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity1, TransformComponent)
        setComponent(testEntity1, RigidBodyComponent)
        setComponent(testEntity1, ColliderComponent)

        testEntity2 = createEntity()
        setComponent(testEntity2, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity2, TransformComponent)
        setComponent(testEntity2, RigidBodyComponent)
        setComponent(testEntity2, ColliderComponent)
      })

      afterEach(() => {
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

      it('should do nothing if any of the collider handles are not found', () => {
        assert.ok(physicsWorld)
        const event = Physics.drainCollisionEventQueue(physicsWorld)
        assertCollisionEventClosure(event)
        physicsWorld.step()
        const collider1 = physicsWorld.Colliders.get(testEntity1)
        const collider2 = physicsWorld.Colliders.get(testEntity2)
        assert.ok(collider1)
        assert.ok(collider2)

        assert.ok(!hasComponent(testEntity1, CollisionComponent))
        event(collider1.handle, InvalidHandle, true)
        assert.ok(!hasComponent(testEntity1, CollisionComponent))

        assert.ok(!hasComponent(testEntity2, CollisionComponent))
        event(collider2!.handle, InvalidHandle, true)
        assert.ok(!hasComponent(testEntity2, CollisionComponent))
      })

      it('should add a CollisionComponent to the entities contained in the userData of the parent rigidBody of each collider  (collider.parent())', () => {
        assert.ok(physicsWorld)
        const event = Physics.drainCollisionEventQueue(physicsWorld)
        assertCollisionEventClosure(event)
        physicsWorld.step()

        // Get the colliders from the API
        const collider1 = physicsWorld.Colliders.get(testEntity1)
        const collider2 = physicsWorld.Colliders.get(testEntity2)
        assert.ok(collider1)
        assert.ok(collider2)
        // Get the parents from the API
        const colliderParent1 = collider1.parent()
        const colliderParent2 = collider2.parent()
        assert.ok(colliderParent1)
        assert.ok(colliderParent2)
        // Get the entities from parent.userData
        const entity1 = colliderParent1.entity
        const entity2 = colliderParent2.entity
        assert.equal(testEntity1, entity1)
        assert.equal(testEntity2, entity2)
        // Check before
        assert.equal(hasComponent(entity1, CollisionComponent), false)
        assert.equal(hasComponent(entity2, CollisionComponent), false)

        // Run and Check after
        event(collider1.handle, collider2.handle, true)
        assert.equal(hasComponent(entity1, CollisionComponent), true)
        assert.equal(hasComponent(entity2, CollisionComponent), true)
      })

      describe('when `started` is set to `true` ...', () => {
        it('... should create a CollisionEvents.COLLISION_START when neither of the colliders is a sensor (aka has a TriggerComponent)', () => {
          const Started = true

          assert.ok(physicsWorld)
          const event = Physics.drainCollisionEventQueue(physicsWorld)
          assertCollisionEventClosure(event)
          // Get the colliders from the API
          const collider1 = physicsWorld.Colliders.get(testEntity1)
          const collider2 = physicsWorld.Colliders.get(testEntity2)
          assert.ok(collider1)
          assert.ok(collider2)
          // Check before
          const before1 = getComponent(testEntity1, CollisionComponent)?.get(testEntity2)
          const before2 = getComponent(testEntity2, CollisionComponent)?.get(testEntity1)
          assert.equal(before1, undefined)
          assert.equal(before2, undefined)
          // setComponent(testEntity1, TriggerComponent)  // DONT set the trigger component (testEntity1.body.isSensor() is false)

          // Run and Check after
          event(collider1.handle, collider2.handle, Started)
          const after1 = getComponent(testEntity1, CollisionComponent).get(testEntity2)
          const after2 = getComponent(testEntity2, CollisionComponent).get(testEntity1)
          assert.ok(after1)
          assert.ok(after2)
          assert.equal(after1.type, CollisionEvents.COLLISION_START)
          assert.equal(after2.type, CollisionEvents.COLLISION_START)
        })

        it('... should create a CollisionEvents.TRIGGER_START when either one of the colliders is a sensor (aka has a TriggerComponent)', async () => {
          //force nested reactors to run
          const { rerender, unmount } = render(<></>)

          const Started = true

          assert.ok(physicsWorld)
          const event = Physics.drainCollisionEventQueue(physicsWorld)
          assertCollisionEventClosure(event)
          // Get the colliders from the API
          const collider1 = physicsWorld.Colliders.get(testEntity1)
          const collider2 = physicsWorld.Colliders.get(testEntity2)
          assert.ok(collider1)
          assert.ok(collider2)
          // Check before
          const before1 = getComponent(testEntity1, CollisionComponent)?.get(testEntity2)
          const before2 = getComponent(testEntity2, CollisionComponent)?.get(testEntity1)
          assert.equal(before1, undefined)
          assert.equal(before2, undefined)
          setComponent(testEntity1, TriggerComponent) // Set the trigger component (marks testEntity1.body.isSensor() as true)
          await act(() => rerender(<></>))

          event(collider1.handle, collider2.handle, Started)

          // Run and Check after
          const after1 = getComponent(testEntity1, CollisionComponent).get(testEntity2)
          const after2 = getComponent(testEntity2, CollisionComponent).get(testEntity1)
          assert.ok(after1)
          assert.ok(after2)
          assert.equal(after1.type, CollisionEvents.TRIGGER_START)
          assert.equal(after2.type, CollisionEvents.TRIGGER_START)
        })

        it('... should set entity2 in the CollisionComponent of entity1, and entity1 in the CollisionComponent of entity2', () => {
          assert.ok(physicsWorld)
          const event = Physics.drainCollisionEventQueue(physicsWorld)
          assertCollisionEventClosure(event)
          // Get the colliders from the API
          const collider1 = physicsWorld.Colliders.get(testEntity1)
          const collider2 = physicsWorld.Colliders.get(testEntity2)
          assert.ok(collider1)
          assert.ok(collider2)
          // Check before
          const before1 = getComponent(testEntity1, CollisionComponent)?.get(testEntity2)
          const before2 = getComponent(testEntity2, CollisionComponent)?.get(testEntity1)
          assert.equal(before1, undefined)
          assert.equal(before2, undefined)

          // Run and Check after
          event(collider1.handle, collider2.handle, true)
          const after1 = getComponent(testEntity1, CollisionComponent).get(testEntity2)
          const after2 = getComponent(testEntity2, CollisionComponent).get(testEntity1)
          assert.ok(after1)
          assert.ok(after2)
        })
      })

      describe('when `started` is set to `false` ...', () => {
        it('... should create a CollisionEvents.TRIGGER_END when either one of the colliders is a sensor', async () => {
          //force nested reactors to run
          const { rerender, unmount } = render(<></>)

          const Started = false

          assert.ok(physicsWorld)
          const event = Physics.drainCollisionEventQueue(physicsWorld)
          assertCollisionEventClosure(event)
          // Get the colliders from the API
          const collider1 = physicsWorld.Colliders.get(testEntity1)
          const collider2 = physicsWorld.Colliders.get(testEntity2)
          assert.ok(collider1)
          assert.ok(collider2)
          // Check before
          const before1 = getComponent(testEntity1, CollisionComponent)?.get(testEntity2)
          const before2 = getComponent(testEntity2, CollisionComponent)?.get(testEntity1)
          assert.equal(before1, undefined)
          assert.equal(before2, undefined)
          setComponent(testEntity1, TriggerComponent) // Set the trigger component (marks testEntity1.body.isSensor() as true)
          await act(() => rerender(<></>))

          // Run and Check after
          event(collider1.handle, collider2.handle, true) // Run the even twice, so that the entities get each other in their collision components
          event(collider1.handle, collider2.handle, Started)
          const after1 = getComponent(testEntity1, CollisionComponent).get(testEntity2)
          const after2 = getComponent(testEntity2, CollisionComponent).get(testEntity1)
          assert.ok(after1)
          assert.ok(after2)
          assert.equal(after1.type, CollisionEvents.TRIGGER_END)
          assert.equal(after2.type, CollisionEvents.TRIGGER_END)
        })

        it('... should create a CollisionEvents.COLLISION_END when neither of the colliders is a sensor', () => {
          const Started = false

          assert.ok(physicsWorld)
          const event = Physics.drainCollisionEventQueue(physicsWorld)
          assertCollisionEventClosure(event)
          // Get the colliders from the API
          const collider1 = physicsWorld.Colliders.get(testEntity1)
          const collider2 = physicsWorld.Colliders.get(testEntity2)
          assert.ok(collider1)
          assert.ok(collider2)
          // Check before
          const before1 = getComponent(testEntity1, CollisionComponent)?.get(testEntity2)
          const before2 = getComponent(testEntity2, CollisionComponent)?.get(testEntity1)
          assert.equal(before1, undefined)
          assert.equal(before2, undefined)
          // setComponent(testEntity1, TriggerComponent)  // DONT set the trigger component (testEntity1.body.isSensor() is false)

          // Run and Check after
          event(collider1.handle, collider2.handle, true) // Run the even twice, so that the entities get each other in their collision components
          event(collider1.handle, collider2.handle, Started)
          const after1 = getComponent(testEntity1, CollisionComponent).get(testEntity2)
          const after2 = getComponent(testEntity2, CollisionComponent).get(testEntity1)
          assert.ok(after1)
          assert.ok(after2)
          assert.equal(after1.type, CollisionEvents.COLLISION_END)
          assert.equal(after2.type, CollisionEvents.COLLISION_END)
        })
      })
    }) // << drainCollisionEventQueue

    describe('drainContactEventQueue', () => {
      let physicsWorld: PhysicsWorld
      let testEntity1 = UndefinedEntity
      let testEntity2 = UndefinedEntity

      beforeEach(async () => {
        createEngine()
        await Physics.load()
        const entity = createEntity()
        setComponent(entity, UUIDComponent, UUIDComponent.generateUUID())
        setComponent(entity, SceneComponent)
        setComponent(entity, TransformComponent)
        setComponent(entity, EntityTreeComponent)
        physicsWorld = Physics.createWorld(getComponent(entity, UUIDComponent))
        physicsWorld.timestep = 1 / 60

        testEntity1 = createEntity()
        setComponent(testEntity1, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity1, TransformComponent)
        setComponent(testEntity1, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity1, ColliderComponent)
        testEntity2 = createEntity()
        setComponent(testEntity2, EntityTreeComponent, { parentEntity: entity })
        setComponent(testEntity2, TransformComponent)
        setComponent(testEntity2, RigidBodyComponent, { type: BodyTypes.Dynamic })
        setComponent(testEntity2, ColliderComponent)
      })

      afterEach(() => {
        removeEntity(testEntity1)
        removeEntity(testEntity2)
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

      describe('if the collision exists ...', () => {
        const DummyMaxForce = { x: 42, y: 43, z: 44 }
        const DummyTotalForce = { x: 45, y: 46, z: 47 }
        const DummyHit = {
          maxForceDirection: DummyMaxForce,
          totalForce: DummyTotalForce
        } as ColliderHitEvent
        function setDummyCollisionBetween(ent1: Entity, ent2: Entity, hit = DummyHit): void {
          const hits = new Map<Entity, ColliderHitEvent>()
          hits.set(ent2, hit)
          setComponent(ent1, CollisionComponent)
          getMutableComponent(ent1, CollisionComponent).set(hits)
        }

        const ExpectedMaxForce = { x: 4, y: 5, z: 6 }
        const ExpectedTotalForce = { x: 7, y: 8, z: 9 }

        it('should store event.maxForceDirection() into the CollisionComponent.maxForceDirection of entity1.collision.get(entity2) if the collision exists', () => {
          // Setup the function spies
          const collider1Spy = sinon.spy((): number => {
            return physicsWorld.Colliders.get(testEntity1)!.handle
          })
          const collider2Spy = sinon.spy((): number => {
            return physicsWorld.Colliders.get(testEntity2)!.handle
          })
          const totalForceSpy = sinon.spy((): Vector => {
            return ExpectedTotalForce
          })
          const maxForceSpy = sinon.spy((): Vector => {
            return ExpectedMaxForce
          })

          // Check before
          assert.ok(physicsWorld)
          const event = Physics.drainContactEventQueue(physicsWorld)
          assertContactEventClosure(event)
          assert.equal(getOptionalComponent(testEntity1, CollisionComponent), undefined)
          assert.equal(getOptionalComponent(testEntity2, CollisionComponent), undefined)

          // Run and Check after
          setDummyCollisionBetween(testEntity1, testEntity2)
          setDummyCollisionBetween(testEntity2, testEntity1)
          event({
            collider1: collider1Spy as any,
            collider2: collider2Spy as any,
            totalForce: totalForceSpy as any,
            maxForceDirection: maxForceSpy as any
          } as TempContactForceEvent)
          sinon.assert.called(collider1Spy)
          sinon.assert.called(collider2Spy)
          sinon.assert.called(maxForceSpy)
          const after = getComponent(testEntity1, CollisionComponent).get(testEntity2)?.maxForceDirection
          assertVecApproxEq(after, ExpectedMaxForce, 3)
        })

        it('should store event.maxForceDirection() into the CollisionComponent.maxForceDirection of entity2.collision.get(entity1) if the collision exists', () => {
          // Setup the function spies
          const collider1Spy = sinon.spy((): number => {
            return physicsWorld.Colliders.get(testEntity1)!.handle
          })
          const collider2Spy = sinon.spy((): number => {
            return physicsWorld.Colliders.get(testEntity2)!.handle
          })
          const totalForceSpy = sinon.spy((): Vector => {
            return ExpectedTotalForce
          })
          const maxForceSpy = sinon.spy((): Vector => {
            return ExpectedMaxForce
          })

          // Check before
          assert.ok(physicsWorld)
          const event = Physics.drainContactEventQueue(physicsWorld)
          assertContactEventClosure(event)
          assert.equal(getOptionalComponent(testEntity1, CollisionComponent), undefined)
          assert.equal(getOptionalComponent(testEntity2, CollisionComponent), undefined)

          // Run and Check after
          setDummyCollisionBetween(testEntity1, testEntity2)
          setDummyCollisionBetween(testEntity2, testEntity1)

          event({
            collider1: collider1Spy as any,
            collider2: collider2Spy as any,
            totalForce: totalForceSpy as any,
            maxForceDirection: maxForceSpy as any
          } as TempContactForceEvent)

          sinon.assert.called(collider1Spy)
          sinon.assert.called(collider2Spy)
          sinon.assert.called(maxForceSpy)
          const after = getComponent(testEntity2, CollisionComponent).get(testEntity1)?.maxForceDirection
          assertVecApproxEq(after, ExpectedMaxForce, 3)
        })

        it('should store event.totalForce() into the CollisionComponent.totalForce of entity1.collision.get(entity2) if the collision exists', () => {
          // Setup the function spies
          const collider1Spy = sinon.spy((): number => {
            return physicsWorld.Colliders.get(testEntity1)!.handle
          })
          const collider2Spy = sinon.spy((): number => {
            return physicsWorld.Colliders.get(testEntity2)!.handle
          })
          const totalForceSpy = sinon.spy((): Vector => {
            return ExpectedTotalForce
          })
          const maxForceSpy = sinon.spy((): Vector => {
            return ExpectedMaxForce
          })

          // Check before
          assert.ok(physicsWorld)
          const event = Physics.drainContactEventQueue(physicsWorld)
          assertContactEventClosure(event)
          assert.equal(getOptionalComponent(testEntity1, CollisionComponent), undefined)
          assert.equal(getOptionalComponent(testEntity2, CollisionComponent), undefined)
          // Run and Check after
          setDummyCollisionBetween(testEntity1, testEntity2)
          setDummyCollisionBetween(testEntity2, testEntity1)

          event({
            collider1: collider1Spy as any,
            collider2: collider2Spy as any,
            totalForce: totalForceSpy as any,
            maxForceDirection: maxForceSpy as any
          } as TempContactForceEvent)

          sinon.assert.called(collider1Spy)
          sinon.assert.called(collider2Spy)
          sinon.assert.called(totalForceSpy)
          const after = getComponent(testEntity1, CollisionComponent).get(testEntity2)?.totalForce
          assertVecApproxEq(after, ExpectedTotalForce, 3)
        })

        it('should store event.totalForce() into the CollisionComponent.totalForce of entity2.collision.get(entity1) if the collision exists', () => {
          // Setup the function spies
          const collider1Spy = sinon.spy((): number => {
            return physicsWorld.Colliders.get(testEntity1)!.handle
          })
          const collider2Spy = sinon.spy((): number => {
            return physicsWorld.Colliders.get(testEntity2)!.handle
          })
          const totalForceSpy = sinon.spy((): Vector => {
            return ExpectedTotalForce
          })
          const maxForceSpy = sinon.spy((): Vector => {
            return ExpectedMaxForce
          })

          // Check before
          assert.ok(physicsWorld)
          const event = Physics.drainContactEventQueue(physicsWorld)
          assertContactEventClosure(event)
          assert.equal(getOptionalComponent(testEntity1, CollisionComponent), undefined)
          assert.equal(getOptionalComponent(testEntity2, CollisionComponent), undefined)

          // Run and Check after
          setDummyCollisionBetween(testEntity1, testEntity2)
          setDummyCollisionBetween(testEntity2, testEntity1)
          event({
            collider1: collider1Spy as any,
            collider2: collider2Spy as any,
            totalForce: totalForceSpy as any,
            maxForceDirection: maxForceSpy as any
          } as TempContactForceEvent)

          sinon.assert.called(collider1Spy)
          sinon.assert.called(collider2Spy)
          sinon.assert.called(totalForceSpy)
          const after = getComponent(testEntity2, CollisionComponent).get(testEntity1)?.totalForce
          assertVecApproxEq(after, ExpectedTotalForce, 3)
        })
      })
    }) // << drainContactEventQueue
  }) // << Collisions
})

/** TODO:
    describe("load", () => {}) // @todo Is there a way to check that the wasmInit() call from rapier.js has been run?
  // Character Controller
    describe("getControllerOffset", () => {})  // @deprecated
  */
