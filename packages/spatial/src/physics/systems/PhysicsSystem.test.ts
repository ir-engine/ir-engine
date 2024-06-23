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

import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import { getMutableState } from '@etherealengine/hyperflux'

import { World } from '@dimforge/rapier3d-compat'
import {
  Entity,
  SystemUUID,
  UndefinedEntity,
  createEntity,
  getComponent,
  getMutableComponent,
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import assert from 'assert'
import { Quaternion, Vector3 } from 'three'
import { TransformComponent } from '../../SpatialModule'
import { Vector3_Zero } from '../../common/constants/MathConstants'
import { createEngine } from '../../initializeEngine'
import { Physics } from '../classes/Physics'
import { assertVecAllApproxNotEq, assertVecApproxEq } from '../classes/Physics.test'
import { RigidBodyComponent } from '../components/RigidBodyComponent'
import { PhysicsState } from '../state/PhysicsState'
import { PhysicsSystem, smoothKinematicBody } from './PhysicsSystem'

// Epsilon Constants for Interpolation
const LerpEpsilon = 0.000001
/** @note three.js Quat.slerp fails tests at 6 significant figures, but passes at 5 */
const SLerpEpsilon = 0.00001

describe('smoothKinematicBody', () => {
  type Step = { dt: number; substep: number }
  function createStep(dt: number, substep: number): Step {
    // @note Just an alias for readability
    return { dt, substep }
  }

  function createExpectedLinear(entity: Entity, step: Step) {
    const body = getComponent(entity, RigidBodyComponent)
    const result = {
      position: body.previousPosition.clone().lerp(body.targetKinematicPosition.clone(), step.substep).clone(),
      rotation: body.previousRotation.clone().slerp(body.targetKinematicRotation.clone(), step.substep).clone()
    }
    return result
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

  const Step = {
    Tenth: createStep(DeltaTime, 0.1),
    Quarter: createStep(DeltaTime, 0.25),
    Half: createStep(DeltaTime, 0.5),
    One: createStep(DeltaTime, 1),
    Two: createStep(DeltaTime, 2)
  }

  let testEntity = UndefinedEntity
  let physicsWorld = undefined as World | undefined

  beforeEach(async () => {
    createEngine()
    await Physics.load()
    physicsWorld = Physics.createWorld()
    physicsWorld.timestep = DeltaTime
    getMutableState(PhysicsState).physicsWorld.set(physicsWorld)

    testEntity = createEntity()
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
    beforeEach(() => {
      getMutableComponent(testEntity, RigidBodyComponent).targetKinematicLerpMultiplier.set(0)
    })

    it('... should apply deterministic linear interpolation to the position of the KinematicBody of the given entity', () => {
      // Check data before
      const body = getComponent(testEntity, RigidBodyComponent)
      const before = body.position.clone()
      assertVecApproxEq(before, Vector3_Zero, 3, LerpEpsilon)

      // Run and Check resulting data
      smoothKinematicBody(testEntity, Step.Quarter.dt, Step.Quarter.substep)
      const after = body.position.clone()
      assertVecAllApproxNotEq(before, after, 3, LerpEpsilon)
      assertVecApproxEq(after, createExpectedLinear(testEntity, Step.Quarter).position, 3, LerpEpsilon)
      // Check the other Step cases
      getComponent(testEntity, RigidBodyComponent).position.set(0, 0, 0) // reset for next case
      smoothKinematicBody(testEntity, Step.Tenth.dt, Step.Tenth.substep)
      assertVecApproxEq(body.position.clone(), createExpectedLinear(testEntity, Step.Tenth).position, 3, LerpEpsilon)
      getComponent(testEntity, RigidBodyComponent).position.set(0, 0, 0) // reset for next case
      smoothKinematicBody(testEntity, Step.Half.dt, Step.Half.substep)
      assertVecApproxEq(body.position.clone(), createExpectedLinear(testEntity, Step.Half).position, 3, LerpEpsilon)
      getComponent(testEntity, RigidBodyComponent).position.set(0, 0, 0) // reset for next case
      smoothKinematicBody(testEntity, Step.One.dt, Step.One.substep)
      assertVecApproxEq(body.position.clone(), createExpectedLinear(testEntity, Step.One).position, 3, LerpEpsilon)
      getComponent(testEntity, RigidBodyComponent).position.set(0, 0, 0) // reset for next case
      smoothKinematicBody(testEntity, Step.Two.dt, Step.Two.substep)
      assertVecApproxEq(body.position.clone(), createExpectedLinear(testEntity, Step.Two).position, 3, LerpEpsilon)
      // Check substep precision Step cases
      const TestCount = 1_000_000
      for (let divider = 1; divider <= TestCount; divider += 1_000) {
        const step = createStep(DeltaTime, 1 / divider)
        getComponent(testEntity, RigidBodyComponent).position.set(0, 0, 0) // reset for next case
        smoothKinematicBody(testEntity, step.dt, step.substep)
        assertVecApproxEq(body.position.clone(), createExpectedLinear(testEntity, step).position, 3, LerpEpsilon)
      }
    })

    it('... should apply deterministic spherical linear interpolation to the rotation of the KinematicBody of the given entity', () => {
      // Check data before
      const body = getComponent(testEntity, RigidBodyComponent)
      const before = body.rotation.clone()
      assertVecApproxEq(before, new Quaternion(0, 0, 0, 1), 3, SLerpEpsilon)

      // Run and Check resulting data
      smoothKinematicBody(testEntity, Step.Quarter.dt, Step.Quarter.substep)
      const after = body.rotation.clone()
      assertVecAllApproxNotEq(before, after, 4, SLerpEpsilon)
      assertVecApproxEq(after, createExpectedLinear(testEntity, Step.Quarter).rotation, 4, SLerpEpsilon)
      // Check the other Step cases
      getComponent(testEntity, RigidBodyComponent).rotation.set(0, 0, 0, 1) // reset for next case
      smoothKinematicBody(testEntity, Step.Tenth.dt, Step.Tenth.substep)
      assertVecApproxEq(body.rotation.clone(), createExpectedLinear(testEntity, Step.Tenth).rotation, 4, SLerpEpsilon)
      getComponent(testEntity, RigidBodyComponent).rotation.set(0, 0, 0, 1) // reset for next case
      smoothKinematicBody(testEntity, Step.Half.dt, Step.Half.substep)
      assertVecApproxEq(body.rotation.clone(), createExpectedLinear(testEntity, Step.Half).rotation, 4, SLerpEpsilon)
      getComponent(testEntity, RigidBodyComponent).rotation.set(0, 0, 0, 1) // reset for next case
      smoothKinematicBody(testEntity, Step.One.dt, Step.One.substep)
      assertVecApproxEq(body.rotation.clone(), createExpectedLinear(testEntity, Step.One).rotation, 4, SLerpEpsilon)
      getComponent(testEntity, RigidBodyComponent).rotation.set(0, 0, 0, 1) // reset for next case
      smoothKinematicBody(testEntity, Step.Two.dt, Step.Two.substep)
      assertVecApproxEq(body.rotation.clone(), createExpectedLinear(testEntity, Step.Two).rotation, 4, SLerpEpsilon)
      // Check substep precision Step cases
      const TestCount = 1_000_000
      for (let divider = 1; divider <= TestCount; divider += 1_000) {
        const step = createStep(DeltaTime, 1 / divider)
        getComponent(testEntity, RigidBodyComponent).rotation.set(0, 0, 0, 1) // reset for next case
        smoothKinematicBody(testEntity, step.dt, step.substep)
        assertVecApproxEq(body.rotation.clone(), createExpectedLinear(testEntity, step).rotation, 4, SLerpEpsilon)
      }
    })
  })

  describe('when RigidbodyComponent.targetKinematicLerpMultiplier is set to a value other than 0 ...', () => {
    /** @todo LerpMultiplier 0  */
    /** @todo LerpMultiplier 1  */
    /** @todo LerpMultiplier ?? */
    // getMutableComponent(testEntity, RigidBodyComponent).targetKinematicLerpMultiplier.set(5)
    // it("... should apply gradual smoothing (aka exponential interpolation) to the position of the KinematicBody of the given entity", () => {})
    // it("... should apply gradual smoothing (aka exponential interpolation) to the rotation of the KinematicBody of the given entity", () => {})
  })
})

describe('PhysicsSystem', () => {
  describe('IDs', () => {
    it("should define the PhysicsSystem's UUID with the expected value", () => {
      assert.equal(PhysicsSystem, 'ee.engine.PhysicsSystem' as SystemUUID)
    })
  })

  describe('execute', () => {})

  /**
  // @note The reactor is currently just binding data onMount and onUnmount
  // describe('reactor', () => {})
  */
})
