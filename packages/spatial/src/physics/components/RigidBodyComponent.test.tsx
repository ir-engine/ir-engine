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

import { act, render } from '@testing-library/react'
import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'

import { RigidBodyType } from '@dimforge/rapier3d-compat'
import {
  SystemDefinitions,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  serializeComponent,
  setComponent
} from '@ir-engine/ecs'
import React from 'react'
import { Vector3 } from 'three'
import {
  assertArrayAllNotEq,
  assertArrayEqual,
  assertFloatApproxEq,
  assertFloatApproxNotEq,
  assertVecAllApproxNotEq,
  assertVecApproxEq
} from '../../../tests/util/mathAssertions'
import { Vector3_Zero } from '../../common/constants/MathConstants'
import { SceneComponent } from '../../renderer/components/SceneComponents'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Physics, PhysicsWorld } from '../classes/Physics'
import { PhysicsSystem } from '../systems/PhysicsSystem'
import { BodyTypes } from '../types/PhysicsTypes'
import { ColliderComponent } from './ColliderComponent'
import {
  RigidBodyComponent,
  RigidBodyDynamicTagComponent,
  RigidBodyFixedTagComponent,
  RigidBodyKinematicTagComponent,
  getTagComponentForRigidBody
} from './RigidBodyComponent'

const RigidBodyComponentDefaults = {
  type: BodyTypes.Fixed,
  ccd: false,
  allowRolling: true,
  enabledRotations: [true, true, true] as [boolean, boolean, boolean],
  canSleep: true,
  gravityScale: 1,
  previousPosition: 3,
  previousRotation: 4,
  position: 3,
  rotation: 4,
  targetKinematicPosition: 3,
  targetKinematicRotation: 4,
  linearVelocity: 3,
  angularVelocity: 3,
  targetKinematicLerpMultiplier: 0
}

export function assertRigidBodyComponentEqual(data, expected = RigidBodyComponentDefaults) {
  assert.equal(data.type, expected.type)
  assert.equal(data.ccd, expected.ccd)
  assert.equal(data.allowRolling, expected.allowRolling)
  assert.equal(data.enabledRotations.length, expected.enabledRotations.length)
  assert.equal(data.enabledRotations[0], expected.enabledRotations[0])
  assert.equal(data.enabledRotations[1], expected.enabledRotations[1])
  assert.equal(data.enabledRotations[2], expected.enabledRotations[2])
  assert.equal(data.canSleep, expected.canSleep)
  assert.equal(data.gravityScale, expected.gravityScale)
  /**
  // @todo Not serialized by the component
  assertVecApproxEq(data.previousPosition, expected.previousPosition, 3)
  assertVecApproxEq(data.previousRotation, expected.previousRotation, 4)
  assertVecApproxEq(data.position, expected.position, 3)
  assertVecApproxEq(data.rotation, expected.rotation, 4)
  assertVecApproxEq(data.targetKinematicPosition, expected.targetKinematicPosition, 3)
  assertVecApproxEq(data.targetKinematicRotation, expected.targetKinematicRotation, 4)
  assertVecApproxEq(data.linearVelocity, expected.linearVelocity, 3)
  assertVecApproxEq(data.angularVelocity, expected.angularVelocity, 3)
  assert.equal(data.targetKinematicLerpMultiplier, expected.targetKinematicLerpMultiplier)
  */
}

describe('RigidBodyComponent', () => {
  describe('IDs', () => {
    it('should initialize the RigidBodyComponent.name field with the expected value', () => {
      assert.equal(RigidBodyComponent.name, 'RigidBodyComponent')
    })
    it('should initialize the RigidBodyComponent.jsonID field with the expected value', () => {
      assert.equal(RigidBodyComponent.jsonID, 'EE_rigidbody')
    })
  })

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await Physics.load()
      testEntity = createEntity()
      setComponent(testEntity, RigidBodyComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, RigidBodyComponent)
      assertRigidBodyComponentEqual(data, RigidBodyComponentDefaults)
    })
  }) // << onInit

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await Physics.load()
      testEntity = createEntity()
      setComponent(testEntity, RigidBodyComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should change the values of an initialized RigidBodyComponent', () => {
      const Expected = {
        type: BodyTypes.Dynamic,
        ccd: true,
        allowRolling: false,
        canSleep: false,
        gravityScale: 2,
        enabledRotations: [false, false, false] as [boolean, boolean, boolean]
      }
      const before = getComponent(testEntity, RigidBodyComponent)
      assertRigidBodyComponentEqual(before, RigidBodyComponentDefaults)

      setComponent(testEntity, RigidBodyComponent, Expected)
      const after = getComponent(testEntity, RigidBodyComponent)
      assert.equal(after.type, Expected.type)
      assert.equal(after.ccd, Expected.ccd)
      assert.equal(after.allowRolling, Expected.allowRolling)
      assert.equal(after.canSleep, Expected.canSleep)
      assert.equal(after.gravityScale, Expected.gravityScale)
      assert.equal(after.enabledRotations.length, Expected.enabledRotations.length)
      assert.equal(after.enabledRotations[0], Expected.enabledRotations[0])
      assert.equal(after.enabledRotations[1], Expected.enabledRotations[1])
      assert.equal(after.enabledRotations[2], Expected.enabledRotations[2])
    })

    it('should not change values of an initialized RigidBodyComponent when the data passed had incorrect types', () => {
      const Incorrect = {
        type: 1,
        ccd: 'ccd',
        allowRolling: 2,
        canSleep: 3,
        gravityScale: false,
        enabledRotations: [4, 5, 6]
      }
      const before = getComponent(testEntity, RigidBodyComponent)
      assertRigidBodyComponentEqual(before, RigidBodyComponentDefaults)

      // @ts-ignore    Pass an incorrect type to setComponent
      setComponent(testEntity, RigidBodyComponent, Incorrect)
      const after = getComponent(testEntity, RigidBodyComponent)
      assertRigidBodyComponentEqual(after, RigidBodyComponentDefaults)
    })
  }) // << onSet

  describe('toJSON', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await Physics.load()
      testEntity = createEntity()
      setComponent(testEntity, RigidBodyComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it("should serialize the component's data correctly", () => {
      const Expected = {
        type: 'fixed',
        ccd: false,
        allowRolling: true,
        enabledRotations: [true, true, true],
        canSleep: true,
        gravityScale: 1
      }
      const json = serializeComponent(testEntity, RigidBodyComponent)
      assert.deepEqual(json, Expected)
    })
  }) // << toJSON

  describe('reactor', () => {
    let testEntity = UndefinedEntity
    let physicsWorld: PhysicsWorld
    let newPhysicsWorld: PhysicsWorld
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
      physicsWorld!.timestep = 1 / 60

      testEntity = createEntity()
      setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, RigidBodyComponent)
      setComponent(testEntity, ColliderComponent)
    })

    afterEach(() => {
      Physics.destroyWorld(physicsWorld.id)
      // if (newPhysicsWorld) Physics.destroyWorld(newPhysicsWorld.id)
      removeEntity(testEntity)
      return destroyEngine()
    })

    const physicsSystemExecute = SystemDefinitions.get(PhysicsSystem)!.execute

    it('should create a RigidBody for the entity in the new physicsWorld when the world is changed', async () => {
      assert.ok(RigidBodyComponent.reactorMap.get(testEntity)!.isRunning)
      const before = physicsWorld.Rigidbodies.get(testEntity)!.handle
      assert.ok(physicsWorld!.bodies.contains(before))

      const newPhysicsEntity = createEntity()
      setComponent(newPhysicsEntity, UUIDComponent, UUIDComponent.generateUUID())
      setComponent(newPhysicsEntity, SceneComponent)
      setComponent(newPhysicsEntity, TransformComponent)
      setComponent(newPhysicsEntity, EntityTreeComponent)
      newPhysicsWorld = Physics.createWorld(getComponent(newPhysicsEntity, UUIDComponent))
      newPhysicsWorld!.timestep = 1 / 60

      // Change the world
      setComponent(testEntity, EntityTreeComponent, { parentEntity: newPhysicsEntity })

      // Force react lifecycle to update Physics.useWorld
      const { rerender, unmount } = render(<></>)
      await act(() => rerender(<></>))

      // Check the changes
      RigidBodyComponent.reactorMap.get(testEntity)!.run() // Reactor is already running. But force-run it so changes are applied immediately
      const after = newPhysicsWorld.Rigidbodies.get(testEntity)!.handle
      assert.ok(newPhysicsWorld!.bodies.contains(after))
    })

    it('should set the correct RigidBody type on the API data when component.type changes', () => {
      assert.ok(RigidBodyComponent.reactorMap.get(testEntity)!.isRunning)
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
      const one = physicsWorld.Rigidbodies.get(testEntity)!.bodyType()
      assert.equal(one, RigidBodyType.Dynamic)
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Fixed })
      const two = physicsWorld.Rigidbodies.get(testEntity)!.bodyType()
      assert.equal(two, RigidBodyType.Fixed)
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Kinematic })
      const three = physicsWorld.Rigidbodies.get(testEntity)!.bodyType()
      assert.equal(three, RigidBodyType.KinematicPositionBased)
    })

    it('should set and remove a RigidBodyDynamicTagComponent on the entity when the component.type changes to dynamic', () => {
      assert.ok(RigidBodyComponent.reactorMap.get(testEntity)!.isRunning)
      const tag = RigidBodyDynamicTagComponent
      removeComponent(testEntity, RigidBodyComponent)
      assert.equal(hasComponent(testEntity, tag), false)
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
      assert.equal(hasComponent(testEntity, tag), true)
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Fixed })
      assert.equal(hasComponent(testEntity, tag), false)
    })

    it('should set and remove a RigidBodyFixedTagComponent on the entity when the component.type changes to fixed', () => {
      assert.ok(RigidBodyComponent.reactorMap.get(testEntity)!.isRunning)
      const tag = RigidBodyFixedTagComponent
      removeComponent(testEntity, RigidBodyComponent)
      assert.equal(hasComponent(testEntity, tag), false)
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Fixed })
      assert.equal(hasComponent(testEntity, tag), true)
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
      assert.equal(hasComponent(testEntity, tag), false)
    })

    it('should set and remove a RigidBodyKinematicTagComponent on the entity when the component.type changes to kinematic', () => {
      assert.ok(RigidBodyComponent.reactorMap.get(testEntity)!.isRunning)
      const tag = RigidBodyKinematicTagComponent
      removeComponent(testEntity, RigidBodyComponent)
      assert.equal(hasComponent(testEntity, tag), false)
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Kinematic })
      assert.equal(hasComponent(testEntity, tag), true)
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Fixed })
      assert.equal(hasComponent(testEntity, tag), false)
    })

    it('should enable CCD for the RigidBody on the API data when component.ccd changes', () => {
      assert.ok(RigidBodyComponent.reactorMap.get(testEntity)!.isRunning)
      const Expected = !RigidBodyComponentDefaults.ccd
      const beforeBody = physicsWorld.Rigidbodies.get(testEntity)!
      assert.ok(beforeBody)
      const beforeAPI = beforeBody.isCcdEnabled()
      assert.equal(beforeAPI, RigidBodyComponentDefaults.ccd)
      const beforeECS = getComponent(testEntity, RigidBodyComponent).ccd
      assert.equal(beforeECS, RigidBodyComponentDefaults.ccd)

      setComponent(testEntity, RigidBodyComponent, { ccd: Expected })
      const afterBody = physicsWorld.Rigidbodies.get(testEntity)!
      assert.ok(afterBody)
      const afterAPI = afterBody.isCcdEnabled()
      assert.equal(afterAPI, Expected)
      const afterECS = getComponent(testEntity, RigidBodyComponent).ccd
      assert.equal(afterECS, Expected)
    })

    it('should lock/unlock rotations for the RigidBody on the API data when component.allowRolling changes', () => {
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })

      assert.ok(RigidBodyComponent.reactorMap.get(testEntity)!.isRunning)
      const TorqueImpulse = new Vector3(10, 20, 30)
      const body = physicsWorld.Rigidbodies.get(testEntity)!

      // Defaults
      const one = getComponent(testEntity, RigidBodyComponent).angularVelocity
      const before = { x: one.x, y: one.y, z: one.z }
      assertVecApproxEq(before, Vector3_Zero, 3)
      const Expected = !RigidBodyComponentDefaults.allowRolling
      assert.notEqual(getComponent(testEntity, RigidBodyComponent).allowRolling, Expected) // Should still be the default

      // Locked
      setComponent(testEntity, RigidBodyComponent, { allowRolling: Expected })
      assert.equal(getComponent(testEntity, RigidBodyComponent).allowRolling, Expected)
      body.applyTorqueImpulse(TorqueImpulse, false)
      physicsSystemExecute()
      const two = getComponent(testEntity, RigidBodyComponent).angularVelocity
      const after = { x: two.x, y: two.y, z: two.z }
      assertVecApproxEq(before, after, 3)

      // Unlocked
      setComponent(testEntity, RigidBodyComponent, { allowRolling: !Expected })
      assert.equal(getComponent(testEntity, RigidBodyComponent).allowRolling, !Expected)
      body.applyTorqueImpulse(TorqueImpulse, false)
      physicsSystemExecute()
      const three = getComponent(testEntity, RigidBodyComponent).angularVelocity
      const unlocked = { x: three.x, y: three.y, z: three.z }
      assertVecAllApproxNotEq(before, unlocked, 3)
    })

    it('should enable/disable rotations for each axis for the RigidBody on the API data when component.enabledRotations changes', () => {
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })

      const reactor = RigidBodyComponent.reactorMap.get(testEntity)!
      assert.ok(reactor.isRunning)
      const TorqueImpulse = new Vector3(10, 20, 30)
      const body = physicsWorld.Rigidbodies.get(testEntity)!

      // Defaults
      const one = getComponent(testEntity, RigidBodyComponent).angularVelocity.clone()
      assertFloatApproxEq(one.x, Vector3_Zero.x)
      assertFloatApproxEq(one.y, Vector3_Zero.y)
      assertFloatApproxEq(one.z, Vector3_Zero.z)

      // Locked
      const AllLocked = [false, false, false] as [boolean, boolean, boolean]
      assertArrayAllNotEq(getComponent(testEntity, RigidBodyComponent).enabledRotations, AllLocked) // Should still be the default
      setComponent(testEntity, RigidBodyComponent, { enabledRotations: AllLocked })
      assertArrayEqual(getComponent(testEntity, RigidBodyComponent).enabledRotations, AllLocked)
      reactor.run()
      body.applyTorqueImpulse(TorqueImpulse, false)
      physicsSystemExecute()
      const two = getComponent(testEntity, RigidBodyComponent).angularVelocity.clone()
      assertFloatApproxEq(one.x, two.x)
      assertFloatApproxEq(one.y, two.y)
      assertFloatApproxEq(one.z, two.z)

      // Unlock X
      const XUnlocked = [true, false, false] as [boolean, boolean, boolean]
      setComponent(testEntity, RigidBodyComponent, { enabledRotations: XUnlocked })
      assertArrayEqual(getComponent(testEntity, RigidBodyComponent).enabledRotations, XUnlocked)
      body.applyTorqueImpulse(TorqueImpulse, false)
      physicsSystemExecute()
      const three = getComponent(testEntity, RigidBodyComponent).angularVelocity.clone()
      assertFloatApproxNotEq(two.x, three.x)
      assertFloatApproxEq(two.y, three.y)
      assertFloatApproxEq(two.z, three.z)

      // Unlock Y
      const YUnlocked = [false, true, false] as [boolean, boolean, boolean]
      setComponent(testEntity, RigidBodyComponent, { enabledRotations: YUnlocked })
      assertArrayEqual(getComponent(testEntity, RigidBodyComponent).enabledRotations, YUnlocked)
      body.applyTorqueImpulse(TorqueImpulse, false)
      physicsSystemExecute()
      const four = getComponent(testEntity, RigidBodyComponent).angularVelocity.clone()
      assertFloatApproxEq(three.x, four.x)
      assertFloatApproxNotEq(three.y, four.y)
      assertFloatApproxEq(three.z, four.z)

      // Unlock Z
      const ZUnlocked = [false, false, true] as [boolean, boolean, boolean]
      setComponent(testEntity, RigidBodyComponent, { enabledRotations: ZUnlocked })
      assertArrayEqual(getComponent(testEntity, RigidBodyComponent).enabledRotations, ZUnlocked)
      body.applyTorqueImpulse(TorqueImpulse, false)
      physicsSystemExecute()
      const five = getComponent(testEntity, RigidBodyComponent).angularVelocity.clone()
      assertFloatApproxEq(four.x, five.x)
      assertFloatApproxEq(four.y, five.y)
      assertFloatApproxNotEq(four.z, five.z)

      // Unlock All
      const AllUnlocked = [true, true, true] as [boolean, boolean, boolean]
      setComponent(testEntity, RigidBodyComponent, { enabledRotations: AllUnlocked })
      assertArrayEqual(getComponent(testEntity, RigidBodyComponent).enabledRotations, AllUnlocked)
      body.applyTorqueImpulse(TorqueImpulse, false)
      physicsSystemExecute()
      const six = getComponent(testEntity, RigidBodyComponent).angularVelocity.clone()
      assertFloatApproxNotEq(five.x, six.x)
      assertFloatApproxNotEq(five.y, six.y)
      assertFloatApproxNotEq(five.z, six.z)
    })
  }) // << reactor

  describe('getTagComponentForRigidBody', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      await Physics.load()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should return the expected tag components', () => {
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
      assert.equal(
        getTagComponentForRigidBody(getComponent(testEntity, RigidBodyComponent).type),
        RigidBodyDynamicTagComponent
      )
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Fixed })
      assert.equal(
        getTagComponentForRigidBody(getComponent(testEntity, RigidBodyComponent).type),
        RigidBodyFixedTagComponent
      )
      setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Kinematic })
      assert.equal(
        getTagComponentForRigidBody(getComponent(testEntity, RigidBodyComponent).type),
        RigidBodyKinematicTagComponent
      )
    })
  }) // getTagComponentForRigidBody
})
