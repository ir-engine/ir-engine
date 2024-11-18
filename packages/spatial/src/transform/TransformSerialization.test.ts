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
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  hasComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { ViewCursor, createViewCursor, readFloat64, readUint8, writeComponent } from '@ir-engine/network'
import assert from 'assert'
import { Quaternion, Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertVec } from '../../tests/util/assert'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import {
  TransformSerialization,
  readPosition,
  readRotation,
  readTransform,
  writePosition,
  writeRotation,
  writeTransform
} from './TransformSerialization'
import { TransformComponent } from './components/TransformComponent'

describe('TransformSerialization', () => {
  describe('ID', () => {
    it('should have the expected value', () => {
      assert.equal(TransformSerialization.ID, 'ee.core.transform')
    })
  }) //:: ID

  describe('Read', () => {
    describe('readPosition', () => {
      let testEntity = UndefinedEntity

      beforeEach(() => {
        createEngine()
        testEntity = createEntity()
        // createMockNetwork()
      })

      afterEach(() => {
        removeEntity(testEntity)
        destroyEngine()
      })

      it('should read the TransformComponent.position into the `@param cursor` ViewCursor correctly', () => {
        const Expected = new Vector3(40, 41, 42)
        TransformComponent.position.x[testEntity] = Expected.x
        TransformComponent.position.y[testEntity] = Expected.y
        TransformComponent.position.z[testEntity] = Expected.z

        // Set the data as expected
        const cursor: ViewCursor = createViewCursor()
        const write = writeComponent(TransformComponent.position)
        write(cursor, testEntity)
        const view = createViewCursor(cursor.buffer)

        // Sanity check before running
        const beforeCursor = 0
        const afterCursor = Uint8Array.BYTES_PER_ELEMENT + 3 * Float64Array.BYTES_PER_ELEMENT
        assert.equal(view.cursor, beforeCursor)
        // Run and Check the result
        readPosition(view, testEntity)
        assert.equal(view.cursor, afterCursor)
      })
    }) //:: readPosition

    describe('readBodyRotation', () => {
      let testEntity = UndefinedEntity

      beforeEach(() => {
        createEngine()
        testEntity = createEntity()
        // createMockNetwork()
      })

      afterEach(() => {
        removeEntity(testEntity)
        destroyEngine()
      })

      it('should read the TransformComponent.rotation into the `@param cursor` ViewCursor correctly', () => {
        const Expected = new Quaternion(40, 41, 42, 43).normalize()
        TransformComponent.rotation.x[testEntity] = Expected.x
        TransformComponent.rotation.y[testEntity] = Expected.y
        TransformComponent.rotation.z[testEntity] = Expected.z

        // Set the data as expected
        const cursor: ViewCursor = createViewCursor()
        const write = writeComponent(TransformComponent.rotation)
        write(cursor, testEntity)
        const view = createViewCursor(cursor.buffer)

        // Sanity check before running
        const beforeCursor = 0
        const afterCursor = Uint8Array.BYTES_PER_ELEMENT + 3 * Float64Array.BYTES_PER_ELEMENT
        assert.equal(view.cursor, beforeCursor)
        // Run and Check the result
        readRotation(view, testEntity)
        assert.equal(view.cursor, afterCursor)
      })
    }) //:: readRotation

    describe('readTransform', () => {
      let testEntity = UndefinedEntity

      beforeEach(() => {
        createEngine()
        testEntity = createEntity()
        // createMockNetwork()
      })

      afterEach(() => {
        removeEntity(testEntity)
        destroyEngine()
      })

      it('should readPosition into the `@param v` ViewCursor when position is marked as changed (1<<1)', () => {
        const Expected = new Vector3(40, 41, 42)
        TransformComponent.position.x[testEntity] = Expected.x
        TransformComponent.position.y[testEntity] = Expected.y
        TransformComponent.position.z[testEntity] = Expected.z

        // Set the data as expected
        const cursor: ViewCursor = createViewCursor()
        const write = writeComponent(TransformComponent.position)
        write(cursor, testEntity)
        const view = createViewCursor(cursor.buffer)

        // Sanity check before running
        const beforeCursor = 0
        const afterCursor = 11
        assert.equal(view.cursor, beforeCursor)
        // Run and Check the result
        readTransform(view, testEntity)
        assert.equal(view.cursor, afterCursor)
      })

      it('should readRotation into the `@param v` ViewCursor when rotation is marked as changed (1<<2)', () => {
        const Expected = new Quaternion(40, 41, 42, 43).normalize()
        TransformComponent.rotation.x[testEntity] = Expected.x
        TransformComponent.rotation.y[testEntity] = Expected.y
        TransformComponent.rotation.z[testEntity] = Expected.z
        TransformComponent.rotation.w[testEntity] = Expected.w

        // Set the data as expected
        const cursor: ViewCursor = createViewCursor()
        const write = writeComponent(TransformComponent.rotation)
        write(cursor, testEntity)
        const view = createViewCursor(cursor.buffer)

        // Sanity check before running
        const beforeCursor = 0
        const afterCursor = 27
        assert.equal(view.cursor, beforeCursor)
        // Run and Check the result
        readTransform(view, testEntity)
        assert.equal(view.cursor, afterCursor)
      })

      it('should mark TransformComponent.dirtyTransforms for `@param entity` as true', () => {
        const Expected = true

        // Set the data as expected
        const cursor: ViewCursor = createViewCursor()
        const view = createViewCursor(cursor.buffer)
        TransformComponent.dirtyTransforms[testEntity] = false
        // Sanity check before running
        assert.equal(TransformComponent.dirtyTransforms[testEntity], false)

        // Run and Check the result
        readTransform(view, testEntity)
        const result = TransformComponent.dirtyTransforms[testEntity]
        assert.equal(result, Expected)
      })
    }) //:: readTransform
  }) //:: Read

  describe('Write', () => {
    describe('writeBodyPosition', () => {
      let testEntity = UndefinedEntity

      beforeEach(() => {
        createEngine()
        testEntity = createEntity()
        // createMockNetwork()
      })

      afterEach(() => {
        removeEntity(testEntity)
        destroyEngine()
      })

      it('should write the TransformComponent.position into the ViewCursor correctly', () => {
        const Expected = new Vector3(40, 41, 42)
        // Set the data as expected
        TransformComponent.position.x[testEntity] = Expected.x
        TransformComponent.position.y[testEntity] = Expected.y
        TransformComponent.position.z[testEntity] = Expected.z
        const cursor: ViewCursor = createViewCursor()
        // Run and Check the result
        const position = writePosition(cursor, testEntity) as ViewCursor
        const view = createViewCursor(position.buffer)
        readUint8(view) // Read changeMask
        const result = new Vector3(readFloat64(view), readFloat64(view), readFloat64(view))
        assertVec.approxEq(result, Expected, 3)
      })
    }) //:: writePosition

    describe('writeRotation', () => {
      let testEntity = UndefinedEntity

      beforeEach(() => {
        createEngine()
        testEntity = createEntity()
        // createMockNetwork()
      })

      afterEach(() => {
        removeEntity(testEntity)
        destroyEngine()
      })

      it('should write the TransformComponent.rotation into the ViewCursor correctly', () => {
        const Expected = new Quaternion(40, 41, 42, 43).normalize()
        // Set the data as expected
        TransformComponent.rotation.x[testEntity] = Expected.x
        TransformComponent.rotation.y[testEntity] = Expected.y
        TransformComponent.rotation.z[testEntity] = Expected.z
        TransformComponent.rotation.w[testEntity] = Expected.w
        const cursor: ViewCursor = createViewCursor()
        // Run and Check the result
        const rotation = writeRotation(cursor, testEntity) as ViewCursor
        const view = createViewCursor(rotation.buffer)
        readUint8(view) // Read changeMask
        const result = new Quaternion(readFloat64(view), readFloat64(view), readFloat64(view), readFloat64(view))
        assertVec.approxEq(result, Expected, 4)
      })
    }) //:: writeRotation

    describe('writeTransform', () => {
      let testEntity = UndefinedEntity

      beforeEach(() => {
        createEngine()
        testEntity = createEntity()
        // createMockNetwork()
      })

      afterEach(() => {
        removeEntity(testEntity)
        destroyEngine()
      })

      it('should return void if `@param entity` does not have a TransformComponent', () => {
        // Set the data as expected
        const cursor: ViewCursor = createViewCursor()
        // Sanity check before running
        assert.equal(hasComponent(testEntity, TransformComponent), false)
        assert.equal(hasComponent(testEntity, RigidBodyComponent), false)
        // Run and Check the result
        const result = writeTransform(cursor, testEntity)
        assert.equal(result, null)
      })

      it('should return void if `@param entity` has a RigidBodyComponent', () => {
        // Set the data as expected
        setComponent(testEntity, TransformComponent)
        setComponent(testEntity, RigidBodyComponent)
        const cursor: ViewCursor = createViewCursor()
        // Sanity check before running
        assert.equal(hasComponent(testEntity, TransformComponent), true)
        assert.equal(hasComponent(testEntity, RigidBodyComponent), true)
        // Run and Check the result
        const result = writeTransform(cursor, testEntity)
        assert.equal(result, null)
      })

      it('should return the resulting ViewCursor if one of TransformComponent.[position, rotation] changed', () => {
        // Set the data as expected
        const transform = setComponent(testEntity, TransformComponent)
        transform.position.x = 42
        const cursor: ViewCursor = createViewCursor()
        // Sanity check before running
        assert.equal(hasComponent(testEntity, TransformComponent), true)
        assert.equal(hasComponent(testEntity, RigidBodyComponent), false)
        // Run and Check the result
        const result = writeTransform(cursor, testEntity)
        assert.notEqual(result, null)
        assert.equal(ArrayBuffer.isView(result), true)
      })

      it('should return void if none of TransformComponent.[position, rotation] changed', () => {
        // Set the data as expected
        setComponent(testEntity, TransformComponent)
        const cursor: ViewCursor = createViewCursor()
        writeTransform(cursor, testEntity) // Rotation on first run triggers a change
        // Sanity check before running
        assert.equal(hasComponent(testEntity, TransformComponent), true)
        assert.equal(hasComponent(testEntity, RigidBodyComponent), false)
        // Run and Check the result
        const result = writeTransform(cursor, testEntity)
        assert.equal(result, null)
        assert.equal(ArrayBuffer.isView(result), false)
      })
    }) //:: writeTransform
  }) //:: Write
}) //:: TransformSerialization
