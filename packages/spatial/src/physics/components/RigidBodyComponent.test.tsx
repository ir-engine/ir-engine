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

import assert from 'assert'
import React from 'react'

import {
  UndefinedEntity,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  serializeComponent,
  setComponent
} from '@etherealengine/ecs'
import { createEngine } from '../../initializeEngine'
import { Physics } from '../classes/Physics'
import { BodyTypes } from '../types/PhysicsTypes'
import {
  RigidBodyComponent,
  RigidBodyDynamicTagComponent,
  RigidBodyFixedTagComponent,
  RigidBodyKinematicTagComponent,
  getTagComponentForRigidBody
} from './RigidBodyComponent'

function assertProxifiedVecUninitialized(vec, elems: number) {
  assert.equal(vec.x, 0)
  assert.equal(vec.y, 0)
  assert.equal(vec.z, 0)
  if (elems > 3) assert.equal(vec.w, 1)
}

function assertRigidBodyComponentDefaults(data) {
  assert.equal(data.type, BodyTypes.Fixed)
  assert.equal(data.ccd, false)
  assert.equal(data.allowRolling, true)
  assert.equal(data.enabledRotations.length, 3)
  assert.equal(data.enabledRotations[0], true)
  assert.equal(data.enabledRotations[1], true)
  assert.equal(data.enabledRotations[2], true)
  assert.equal(data.canSleep, true)
  assert.equal(data.gravityScale, 1)
  assertProxifiedVecUninitialized(data.previousPosition, 3)
  assertProxifiedVecUninitialized(data.previousRotation, 4)
  assertProxifiedVecUninitialized(data.position, 3)
  assertProxifiedVecUninitialized(data.rotation, 4)
  assertProxifiedVecUninitialized(data.targetKinematicPosition, 3)
  assertProxifiedVecUninitialized(data.targetKinematicRotation, 4)
  assertProxifiedVecUninitialized(data.linearVelocity, 3)
  assertProxifiedVecUninitialized(data.angularVelocity, 3)
  assert.equal(data.targetKinematicLerpMultiplier, 0)
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
      assertRigidBodyComponentDefaults(data)
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
      assertRigidBodyComponentDefaults(before)

      setComponent(testEntity, RigidBodyComponent, Expected)
      const data = getComponent(testEntity, RigidBodyComponent)
      assert.equal(data.type, Expected.type)
      assert.equal(data.ccd, Expected.ccd)
      assert.equal(data.allowRolling, Expected.allowRolling)
      assert.equal(data.canSleep, Expected.canSleep)
      assert.equal(data.gravityScale, Expected.gravityScale)
      assert.equal(data.enabledRotations.length, Expected.enabledRotations.length)
      assert.equal(data.enabledRotations[0], Expected.enabledRotations[0])
      assert.equal(data.enabledRotations[1], Expected.enabledRotations[1])
      assert.equal(data.enabledRotations[2], Expected.enabledRotations[2])
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
      assertRigidBodyComponentDefaults(before)

      // @ts-ignore
      setComponent(testEntity, RigidBodyComponent, Incorrect)
      const data = getComponent(testEntity, RigidBodyComponent)
      assertRigidBodyComponentDefaults(data)
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

    const RigidBodyComponentReactor = RigidBodyComponent.reactor
    const tag = <RigidBodyComponentReactor />

    /**
    // @todo How to test a Component's reactor?
    it("dummy", async () => {
      const { rerender, unmount } = render(tag)
      await act(() => rerender(tag))
      // ...
      unmount()
    })
    */
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
