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

import {
  Entity,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { ViewCursor, createViewCursor, readFloat64, readUint8, writeComponent } from '@ir-engine/network'
import { createMockNetwork } from '@ir-engine/network/tests/createMockNetwork'
import assert from 'assert'
import sinon from 'sinon'
import { Quaternion, Vector3 } from 'three'
import { SceneComponent } from '../renderer/components/SceneComponents'
import { EntityTreeComponent } from '../transform/components/EntityTree'
import { TransformComponent } from '../transform/components/TransformComponent'
import {
  PhysicsSerialization,
  readBodyAngularVelocity,
  readBodyLinearVelocity,
  readBodyPosition,
  readBodyRotation,
  readRigidBody,
  writeBodyAngularVelocity,
  writeBodyLinearVelocity,
  writeBodyPosition,
  writeBodyRotation
} from './PhysicsSerialization'
import { Physics, PhysicsWorld } from './classes/Physics'
import { assertVecApproxEq } from './classes/Physics.test'
import { ColliderComponent } from './components/ColliderComponent'
import { RigidBodyComponent } from './components/RigidBodyComponent'
import { BodyTypes, Shapes } from './types/PhysicsTypes'

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
        createMockNetwork()
      })

      afterEach(() => {
        removeEntity(testEntity)
        destroyEngine()
      })

      it('should read the RigidBodyComponent.position into the `@param cursor` ViewCursor correctly', () => {
        const Expected = new Vector3(40, 41, 42)
        RigidBodyComponent.position.x[testEntity] = Expected.x
        RigidBodyComponent.position.y[testEntity] = Expected.y
        RigidBodyComponent.position.z[testEntity] = Expected.z

        // Set the data as expected
        const cursor: ViewCursor = createViewCursor()
        const write = writeComponent(RigidBodyComponent.position)
        write(cursor, testEntity)
        const view = createViewCursor(cursor.buffer)

        // Sanity check before running
        const beforeCursor = 0
        const afterCursor = Uint8Array.BYTES_PER_ELEMENT + 3 * Float64Array.BYTES_PER_ELEMENT
        assert.equal(view.cursor, beforeCursor)
        // Run and Check the result
        readBodyPosition(view, testEntity)
        assert.equal(view.cursor, afterCursor)
      })
    }) //:: readBodyPosition

    describe('readBodyRotation', () => {
      let testEntity = UndefinedEntity

      beforeEach(() => {
        createEngine()
        testEntity = createEntity()
        createMockNetwork()
      })

      afterEach(() => {
        removeEntity(testEntity)
        destroyEngine()
      })

      it('should read the RigidBodyComponent.rotation into the `@param cursor` ViewCursor correctly', () => {
        const Expected = new Quaternion(40, 41, 42, 43).normalize()
        RigidBodyComponent.rotation.x[testEntity] = Expected.x
        RigidBodyComponent.rotation.y[testEntity] = Expected.y
        RigidBodyComponent.rotation.z[testEntity] = Expected.z

        // Set the data as expected
        const cursor: ViewCursor = createViewCursor()
        const write = writeComponent(RigidBodyComponent.rotation)
        write(cursor, testEntity)
        const view = createViewCursor(cursor.buffer)

        // Sanity check before running
        const beforeCursor = 0
        const afterCursor = Uint8Array.BYTES_PER_ELEMENT + 3 * Float64Array.BYTES_PER_ELEMENT
        assert.equal(view.cursor, beforeCursor)
        // Run and Check the result
        readBodyRotation(view, testEntity)
        assert.equal(view.cursor, afterCursor)
      })
    }) //:: readBodyRotation

    describe('readBodyLinearVelocity', () => {
      let testEntity = UndefinedEntity

      beforeEach(() => {
        createEngine()
        testEntity = createEntity()
        createMockNetwork()
      })

      afterEach(() => {
        removeEntity(testEntity)
        destroyEngine()
      })

      it('should read the RigidBodyComponent.linearVelocity into the `@param cursor` ViewCursor correctly', () => {
        const Expected = new Vector3(40, 41, 42)
        RigidBodyComponent.linearVelocity.x[testEntity] = Expected.x
        RigidBodyComponent.linearVelocity.y[testEntity] = Expected.y
        RigidBodyComponent.linearVelocity.z[testEntity] = Expected.z

        // Set the data as expected
        const cursor: ViewCursor = createViewCursor()
        const write = writeComponent(RigidBodyComponent.linearVelocity)
        write(cursor, testEntity)
        const view = createViewCursor(cursor.buffer)

        // Sanity check before running
        const beforeCursor = 0
        const afterCursor = Uint8Array.BYTES_PER_ELEMENT + 3 * Float64Array.BYTES_PER_ELEMENT
        assert.equal(view.cursor, beforeCursor)
        // Run and Check the result
        readBodyLinearVelocity(view, testEntity)
        assert.equal(view.cursor, afterCursor)
      })
    }) //:: readBodyLinearVelocity

    describe('readBodyAngularVelocity', () => {
      let testEntity = UndefinedEntity

      beforeEach(() => {
        createEngine()
        testEntity = createEntity()
        createMockNetwork()
      })

      afterEach(() => {
        removeEntity(testEntity)
        destroyEngine()
      })

      it('should read the RigidBodyComponent.angularVelocity into the `@param cursor` ViewCursor correctly', () => {
        const Expected = new Vector3(40, 41, 42)
        RigidBodyComponent.angularVelocity.x[testEntity] = Expected.x
        RigidBodyComponent.angularVelocity.y[testEntity] = Expected.y
        RigidBodyComponent.angularVelocity.z[testEntity] = Expected.z

        // Set the data as expected
        const cursor: ViewCursor = createViewCursor()
        const write = writeComponent(RigidBodyComponent.angularVelocity)
        write(cursor, testEntity)
        const view = createViewCursor(cursor.buffer)

        // Sanity check before running
        const beforeCursor = 0
        const afterCursor = Uint8Array.BYTES_PER_ELEMENT + 3 * Float64Array.BYTES_PER_ELEMENT
        assert.equal(view.cursor, beforeCursor)
        // Run and Check the result
        readBodyAngularVelocity(view, testEntity)
        assert.equal(view.cursor, afterCursor)
      })
    }) //:: readBodyAngularVelocity

    describe('readRigidBody', () => {
      let testEntity = UndefinedEntity

      beforeEach(() => {
        createEngine()
        testEntity = createEntity()
        createMockNetwork()
      })

      afterEach(() => {
        removeEntity(testEntity)
        destroyEngine()
      })

      it('should readBodyPosition into the `@param v` ViewCursor when position is marked as changed (1<<1)', () => {
        const Expected = new Vector3(40, 41, 42)
        RigidBodyComponent.position.x[testEntity] = Expected.x
        RigidBodyComponent.position.y[testEntity] = Expected.y
        RigidBodyComponent.position.z[testEntity] = Expected.z

        // Set the data as expected
        const cursor: ViewCursor = createViewCursor()
        const write = writeComponent(RigidBodyComponent.position)
        write(cursor, testEntity)
        const view = createViewCursor(cursor.buffer)

        // Sanity check before running
        const beforeCursor = 0
        const afterCursor = 12
        assert.equal(view.cursor, beforeCursor)
        // Run and Check the result
        readRigidBody(view, testEntity)
        assert.equal(view.cursor, afterCursor)
      })

      it('should readBodyRotation into the `@param v` ViewCursor when rotation is marked as changed (1<<2)', () => {
        const Expected = new Quaternion(40, 41, 42, 43).normalize()
        RigidBodyComponent.rotation.x[testEntity] = Expected.x
        RigidBodyComponent.rotation.y[testEntity] = Expected.y
        RigidBodyComponent.rotation.z[testEntity] = Expected.z
        RigidBodyComponent.rotation.w[testEntity] = Expected.w

        // Set the data as expected
        const cursor: ViewCursor = createViewCursor()
        const write = writeComponent(RigidBodyComponent.rotation)
        write(cursor, testEntity)
        const view = createViewCursor(cursor.buffer)

        // Sanity check before running
        const beforeCursor = 0
        const afterCursor = 37
        assert.equal(view.cursor, beforeCursor)
        // Run and Check the result
        readRigidBody(view, testEntity)
        assert.equal(view.cursor, afterCursor)
      })

      it('should readBodyLinearVelocity into the `@param v` ViewCursor when linearVelocity is marked as changed (1<<3)', () => {
        const Expected = new Vector3(40, 41, 42)
        RigidBodyComponent.linearVelocity.x[testEntity] = Expected.x
        RigidBodyComponent.linearVelocity.y[testEntity] = Expected.y
        RigidBodyComponent.linearVelocity.z[testEntity] = Expected.z

        // Set the data as expected
        const cursor: ViewCursor = createViewCursor()
        const write = writeComponent(RigidBodyComponent.linearVelocity)
        write(cursor, testEntity)
        const view = createViewCursor(cursor.buffer)

        // Sanity check before running
        const beforeCursor = 0
        const afterCursor = 12
        assert.equal(view.cursor, beforeCursor)
        // Run and Check the result
        readRigidBody(view, testEntity)
        assert.equal(view.cursor, afterCursor)
      })

      it('should readBodyAngularVelocity into the `@param v` ViewCursor when angularVelocity is marked as changed (1<<4)', () => {
        const Expected = new Vector3(40, 41, 42)
        RigidBodyComponent.angularVelocity.x[testEntity] = Expected.x
        RigidBodyComponent.angularVelocity.y[testEntity] = Expected.y
        RigidBodyComponent.angularVelocity.z[testEntity] = Expected.z

        // Set the data as expected
        const cursor: ViewCursor = createViewCursor()
        const write = writeComponent(RigidBodyComponent.angularVelocity)
        write(cursor, testEntity)
        const view = createViewCursor(cursor.buffer)

        // Sanity check before running
        const beforeCursor = 0
        const afterCursor = 12
        assert.equal(view.cursor, beforeCursor)
        // Run and Check the result
        readRigidBody(view, testEntity)
        assert.equal(view.cursor, afterCursor)
      })

      describe('when there is a physics world ...', () => {
        let physicsWorld: PhysicsWorld
        let physicsWorldEntity: Entity

        beforeEach(async () => {
          await Physics.load()
          physicsWorldEntity = createEntity()
          setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
          setComponent(physicsWorldEntity, SceneComponent)
          setComponent(physicsWorldEntity, TransformComponent)
          setComponent(physicsWorldEntity, EntityTreeComponent)
          physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))
          physicsWorld.timestep = 1 / 60
        })

        it('should call setRigidbodyPose when the entity has dynamic a RigidBody (aka [RigidBodyComponent, RigidBodyDynamicTagComponent]) and one of the elements changed', () => {
          const Expected = new Vector3(41, 42, 43)
          const spy = sinon.spy()
          // Set the data as expected
          setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
          setComponent(testEntity, TransformComponent)
          setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
          setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
          RigidBodyComponent.position.x[testEntity] = Expected.x
          RigidBodyComponent.position.y[testEntity] = Expected.y
          RigidBodyComponent.position.z[testEntity] = Expected.z
          const cursor: ViewCursor = createViewCursor()
          const write = writeComponent(RigidBodyComponent.position)
          write(cursor, testEntity)
          const view = createViewCursor(cursor.buffer)
          physicsWorld.Rigidbodies.get(testEntity)!.setTranslation = spy
          // Sanity check before running
          assert.equal(spy.callCount, 0)
          assert.equal(Boolean(Physics.getWorld(testEntity)), true)
          // Run and Check the result
          readRigidBody(view, testEntity)
          assert.equal(spy.callCount, 1)
        })
      })

      describe('when there is no physics world ...', () => {
        // let physicsWorld: PhysicsWorld
        let physicsWorldEntity: Entity

        beforeEach(async () => {
          await Physics.load()
          physicsWorldEntity = createEntity()
          setComponent(physicsWorldEntity, UUIDComponent, UUIDComponent.generateUUID())
          setComponent(physicsWorldEntity, SceneComponent)
          setComponent(physicsWorldEntity, TransformComponent)
          setComponent(physicsWorldEntity, EntityTreeComponent)
          // physicsWorld = Physics.createWorld(getComponent(physicsWorldEntity, UUIDComponent))
          // physicsWorld.timestep = 1 / 60
        })

        /** @fix Will always pass with the current setup */
        it.skip('should not call setRigidbodyPose', () => {
          const Expected = new Vector3(41, 42, 43)
          const spy = sinon.spy()
          // Set the data as expected
          setComponent(testEntity, EntityTreeComponent, { parentEntity: physicsWorldEntity })
          setComponent(testEntity, TransformComponent)
          setComponent(testEntity, RigidBodyComponent, { type: BodyTypes.Dynamic })
          setComponent(testEntity, ColliderComponent, { shape: Shapes.Sphere })
          RigidBodyComponent.position.x[testEntity] = Expected.x
          RigidBodyComponent.position.y[testEntity] = Expected.y
          RigidBodyComponent.position.z[testEntity] = Expected.z
          const cursor: ViewCursor = createViewCursor()
          const write = writeComponent(RigidBodyComponent.position)
          write(cursor, testEntity)
          const view = createViewCursor(cursor.buffer)
          // physicsWorld.Rigidbodies.get(testEntity)!.setTranslation = spy
          // Sanity check before running
          assert.equal(spy.callCount, 0)
          assert.equal(Boolean(Physics.getWorld(testEntity)), false)
          // Run and Check the result
          readRigidBody(view, testEntity)
          assert.equal(spy.callCount, 0)
        })

        /**
        // @todo
        it("should not call setRigidbodyPose when the entity has a dynamic RigidBody (aka [RigidBodyComponent, RigidBodyDynamicTagComponent]) and none of the elements changed", () => {})
        it("should not call setRigidbodyPose when the entity has a fixed RigidBody (aka [RigidBodyComponent, Not(RigidBodyDynamicTagComponent)]) and one of the elements changed", () => {})
        */
      })
      /**
      // @todo
      it("should set RigidBodyComponent.targetKinematicPosition to RigidBodyComponent.position if the entity has a fixed RigidBody (aka [RigidBodyComponent, Not(RigidBodyDynamicTagComponent)])", () => {})
      it("should set RigidBodyComponent.targetKinematicRotation to RigidBodyComponent.rotation if the entity has a fixed RigidBody (aka [RigidBodyComponent, Not(RigidBodyDynamicTagComponent)])", () => {})
      */
    }) //:: readRigidBody
  }) //:: Read

  describe('Write', () => {
    describe('writeBodyPosition', () => {
      let testEntity = UndefinedEntity

      beforeEach(() => {
        createEngine()
        testEntity = createEntity()
        createMockNetwork()
      })

      afterEach(() => {
        removeEntity(testEntity)
        destroyEngine()
      })

      it('should write the RigidBodyComponent.position into the ViewCursor correctly', () => {
        const Expected = new Vector3(40, 41, 42)
        RigidBodyComponent.position.x[testEntity] = Expected.x
        RigidBodyComponent.position.y[testEntity] = Expected.y
        RigidBodyComponent.position.z[testEntity] = Expected.z

        const cursor: ViewCursor = createViewCursor()
        const position = writeBodyPosition(cursor, testEntity) as ViewCursor
        const view = createViewCursor(position.buffer)

        readUint8(view) // Read changeMask
        const result = new Vector3(readFloat64(view), readFloat64(view), readFloat64(view))
        assertVecApproxEq(result, Expected, Vector3.length)
      })
    }) //:: writeBodyPosition

    describe('writeBodyRotation', () => {
      let testEntity = UndefinedEntity

      beforeEach(() => {
        createEngine()
        testEntity = createEntity()
        createMockNetwork()
      })

      afterEach(() => {
        removeEntity(testEntity)
        destroyEngine()
      })

      it('should write the RigidBodyComponent.rotation into the ViewCursor correctly', () => {
        const Expected = new Quaternion(40, 41, 42, 43).normalize()
        RigidBodyComponent.rotation.x[testEntity] = Expected.x
        RigidBodyComponent.rotation.y[testEntity] = Expected.y
        RigidBodyComponent.rotation.z[testEntity] = Expected.z
        RigidBodyComponent.rotation.w[testEntity] = Expected.w

        const cursor: ViewCursor = createViewCursor()
        const rotation = writeBodyRotation(cursor, testEntity) as ViewCursor
        const view = createViewCursor(rotation.buffer)

        readUint8(view) // Read changeMask
        const result = new Quaternion(readFloat64(view), readFloat64(view), readFloat64(view), readFloat64(view))
        assertVecApproxEq(result, Expected, Quaternion.length)
      })
    }) //:: writeBodyRotation

    describe('writeBodyLinearVelocity', () => {
      let testEntity = UndefinedEntity

      beforeEach(() => {
        createEngine()
        testEntity = createEntity()
        createMockNetwork()
      })

      afterEach(() => {
        removeEntity(testEntity)
        destroyEngine()
      })

      it('should write the RigidBodyComponent.linearVelocity into the ViewCursor correctly', () => {
        const Expected = new Vector3(40, 41, 42)
        RigidBodyComponent.linearVelocity.x[testEntity] = Expected.x
        RigidBodyComponent.linearVelocity.y[testEntity] = Expected.y
        RigidBodyComponent.linearVelocity.z[testEntity] = Expected.z

        const cursor: ViewCursor = createViewCursor()
        const linearVelocity = writeBodyLinearVelocity(cursor, testEntity) as ViewCursor
        const view = createViewCursor(linearVelocity.buffer)

        readUint8(view) // Read changeMask
        const result = new Vector3(readFloat64(view), readFloat64(view), readFloat64(view))
        assertVecApproxEq(result, Expected, Vector3.length)
      })
    }) //:: writeBodyLinearVelocity

    describe('writeBodyAngularVelocity', () => {
      let testEntity = UndefinedEntity

      beforeEach(() => {
        createEngine()
        testEntity = createEntity()
        createMockNetwork()
      })

      afterEach(() => {
        removeEntity(testEntity)
        destroyEngine()
      })

      it('should write the RigidBodyComponent.angularVelocity into the ViewCursor correctly', () => {
        const Expected = new Vector3(40, 41, 42)
        RigidBodyComponent.angularVelocity.x[testEntity] = Expected.x
        RigidBodyComponent.angularVelocity.y[testEntity] = Expected.y
        RigidBodyComponent.angularVelocity.z[testEntity] = Expected.z

        const cursor: ViewCursor = createViewCursor()
        const angularVelocity = writeBodyAngularVelocity(cursor, testEntity) as ViewCursor
        const view = createViewCursor(angularVelocity.buffer)

        readUint8(view) // Read changeMask
        const result = new Vector3(readFloat64(view), readFloat64(view), readFloat64(view))
        assertVecApproxEq(result, Expected, Vector3.length)
      })
    }) //:: writeBodyAngularVelocity

    describe('writeRigidBody', () => {
      /**
      // @todo
      it("should return void if `@param entity` does not have a RigidBodyComponent", () => {})
      it("should return the resulting ViewCursor if one of RigidBodyComponent.[position, rotation, linearVelocity, angularVelocity] changed", () => {})
      it("should return void if none of RigidBodyComponent.[position, rotation, linearVelocity, angularVelocity] changed", () => {})
      */
    }) //:: writeRigidBody
  }) //:: Write
})
