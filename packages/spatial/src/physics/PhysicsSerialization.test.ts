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

import { UndefinedEntity, createEngine, createEntity, destroyEngine, removeEntity } from '@ir-engine/ecs'
import { ViewCursor, createViewCursor } from '@ir-engine/network'
import assert from 'assert'
import { PhysicsSerialization, readBodyPosition } from './PhysicsSerialization'

describe('PhysicsSerialization', () => {
  describe('ID', () => {
    it('should have the expected value', () => {
      assert.equal(PhysicsSerialization.ID, 'ee.core.physics')
    })
  })

  describe('Read', () => {
    describe('readBodyPosition', () => {
      let testEntity = UndefinedEntity

      beforeEach(() => {
        createEngine()
        testEntity = createEntity()
      })

      afterEach(() => {
        removeEntity(testEntity)
        destroyEngine()
      })

      /** @todo ?? How to setup the ViewCursor so that it finds the data correctly ??? */
      it.skip('??', () => {
        const cursor: ViewCursor = createViewCursor()
        console.log(readBodyPosition(cursor, testEntity))
      })
    }) //:: readBodyPosition

    describe('readBodyRotation', () => {}) //:: readBodyRotation
    describe('readBodyLinearVelocity', () => {}) //:: readBodyLinearVelocity
    describe('readBodyAngularVelocity', () => {}) //:: readBodyAngularVelocity
    describe('readRigidBody', () => {}) //:: readRigidBody
  }) //:: Read

  describe('Write', () => {
    describe('writeBodyPosition', () => {}) //:: writeBodyPosition
    describe('writeBodyRotation', () => {}) //:: writeBodyRotation
    describe('writeBodyLinearVelocity', () => {}) //:: writeBodyLinearVelocity
    describe('writeBodyAngularVelocity', () => {}) //:: writeBodyAngularVelocity
    describe('writeRigidBody', () => {}) //:: writeRigidBody
  }) //:: Write
})
