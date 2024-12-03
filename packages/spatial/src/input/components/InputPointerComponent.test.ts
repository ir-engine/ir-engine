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

import {
  Entity,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  removeComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { getState, startReactor } from '@ir-engine/hyperflux'
import { act, render } from '@testing-library/react'
import assert from 'assert'
import { useEffect } from 'react'
import sinon from 'sinon'
import { Vector2 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { CameraPointerHash, InputPointerComponent, InputPointerState } from './InputPointerComponent'

const InputPointerComponentDefaults = {
  pointerId: -1 as number,
  position: new Vector2(),
  lastPosition: new Vector2(),
  movement: new Vector2(),
  cameraEntity: UndefinedEntity
}

describe('CameraPointerHash', () => {
  it('should be possible to cast a CameraPointerHash value into a string', () => {
    const Expected = 'canvas-42.pointer-21'
    const hash = InputPointerState.createCameraPointerHash(42 as Entity, 21) as string
    assert.equal(typeof hash, typeof Expected)
    assert.equal(hash, Expected)
  })

  it('should be possible to get a CameraPointerHash value from a string by type casting', () => {
    const Expected = 'canvas-42.pointer-21' as CameraPointerHash
    const hash = InputPointerState.createCameraPointerHash(42 as Entity, 21)
    assert.equal(typeof hash, typeof Expected)
    assert.equal(hash, Expected)
  })
}) // << CameraPointerHash

describe('InputPointerState', () => {
  describe('IDs', () => {
    it('should initialize the InputPointerComponent.name field with the expected value', () => {
      assert.equal(InputPointerState.name, 'InputPointerState')
    })
  }) // << IDs

  describe('initial', () => {
    beforeEach(() => {
      createEngine()
    })
    afterEach(() => {
      return destroyEngine()
    })

    it('should start with the expected default values', () => {
      const Expected = { pointers: new Map<string, Entity>() }
      const result = getState(InputPointerState)
      assert.equal(typeof result, typeof Expected)
      assert.equal(typeof result.pointers, typeof Expected.pointers)
      assert.equal(result.pointers.entries.length, Expected.pointers.entries.length)
    })
  }) // << initial

  describe('createCameraPointerHash', () => {
    it('should create a hash ID with the expected shape', () => {
      const Camera = 42 as Entity
      const Pointer = 21
      const Expected = `canvas-${Camera}.pointer-${Pointer}`
      const result = InputPointerState.createCameraPointerHash(Camera, Pointer)
      assert.equal(result as typeof Expected, Expected)
      assert.equal(typeof result, typeof Expected as CameraPointerHash)
    })
  }) // << createCameraPointerHash
}) // << InputPointerState

describe('InputPointerComponent', () => {
  describe('IDs', () => {
    it('should initialize the InputPointerComponent.name field with the expected value', () => {
      assert.equal(InputPointerComponent.name, 'InputPointerComponent')
    })
  }) // << IDs

  describe('onInit', () => {
    const PointerID = 42
    let testEntity = UndefinedEntity
    let cameraEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      cameraEntity = createEntity()
      testEntity = createEntity()
      setComponent(testEntity, InputPointerComponent, {
        pointerId: InputPointerComponentDefaults.pointerId,
        cameraEntity: InputPointerComponentDefaults.cameraEntity
      })
    })

    afterEach(() => {
      removeEntity(testEntity)
      removeEntity(cameraEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected values', () => {
      const data = getComponent(testEntity, InputPointerComponent)
      assert.deepEqual(data, InputPointerComponentDefaults)
    })
  }) // << onInit

  describe('onSet', () => {
    const PointerID = 42
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it("should set the given values into the component's data", () => {
      const DummyPointerID = 123
      const DummyEntity = 456 as Entity
      const Expected = {
        ...InputPointerComponentDefaults,
        pointerId: DummyPointerID,
        cameraEntity: DummyEntity
      }
      setComponent(testEntity, InputPointerComponent, Expected)
      const after = getComponent(testEntity, InputPointerComponent)
      assert.deepEqual(after, Expected)
      assert.equal(after.pointerId, DummyPointerID)
      assert.equal(after.cameraEntity, DummyEntity)
    })

    it('should set the entity into the InputPointerState with the expected hash id', () => {
      const DummyPointerID = 123
      const DummyEntity = 456 as Entity
      const PointerData = {
        ...InputPointerComponentDefaults,
        pointerId: DummyPointerID,
        cameraEntity: DummyEntity
      }
      const ExpectedHash = InputPointerState.createCameraPointerHash(PointerData.cameraEntity, PointerData.pointerId)
      setComponent(testEntity, InputPointerComponent, PointerData)
      const result = getState(InputPointerState).pointers.get(ExpectedHash)
      assert.equal(result, testEntity)
    })
  }) // << onSet

  describe('onRemove', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should remove the camera entity from the InputPointerState.pointers Map', () => {
      const DummyPointerID = 123
      const DummyEntity = 456 as Entity
      const PointerData = {
        ...InputPointerComponentDefaults,
        pointerId: DummyPointerID,
        cameraEntity: DummyEntity
      }
      const ExpectedHash = InputPointerState.createCameraPointerHash(PointerData.cameraEntity, PointerData.pointerId)
      setComponent(testEntity, InputPointerComponent, PointerData)
      removeComponent(testEntity, InputPointerComponent)
      const result = getState(InputPointerState).pointers.get(ExpectedHash)
      assert.equal(result, undefined)
    })
  }) // << onRemove

  describe('getPointersForCamera', () => {
    const PointerID = 42
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, InputPointerComponent, {
        pointerId: InputPointerComponentDefaults.pointerId,
        cameraEntity: InputPointerComponentDefaults.cameraEntity
      })
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should return the entity that has an InputPointerComponent, which has the given canvas/camera entity assigned as its InputPointerComponent.cameraEntity', () => {
      removeComponent(testEntity, InputPointerComponent)
      const Expected = { pointerId: PointerID, cameraEntity: createEntity() }
      setComponent(testEntity, InputPointerComponent, Expected)
      // Run and Check after
      const after = InputPointerComponent.getPointersForCamera(Expected.cameraEntity)
      assert.equal(after, testEntity)
    })
  }) // << getPointersForCamera

  describe('getPointerByID', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should return UndefinedEntity when value does not exist', () => {
      const Expected = UndefinedEntity
      const Camera = 42 as Entity
      const Pointer = 21
      const DummyData = { cameraEntity: Camera, pointerId: Pointer }
      // setComponent(testEntity, InputPointerComponent, DummyData)  // Do not set the component, so the InputPointerState Map is empty
      const result = InputPointerComponent.getPointerByID(Camera, Pointer)
      assert.equal(result, Expected)
    })

    it('should return the entity stored at CameraPointerHash(cameraEntity, pointerId)', () => {
      const Expected = testEntity
      const Camera = 42 as Entity
      const Pointer = 21
      const DummyData = { cameraEntity: Camera, pointerId: Pointer }
      setComponent(testEntity, InputPointerComponent, DummyData)
      const result = InputPointerComponent.getPointerByID(Camera, Pointer)
      assert.equal(result, Expected)
    })
  }) // << getPointerByID

  describe('usePointersForCamera', () => {
    beforeEach(() => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should return an array of entities for which all of their InputPointerComponent.cameraEntity properties are the same entity as the `@param cameraEntity`', () => {
      const cameraEntity = createEntity()
      const Dummy = { pointerId: 12356, cameraEntity: createEntity() }
      const pointerEntity1 = createEntity()
      const pointerEntity2 = createEntity()
      const pointerEntity3 = createEntity()
      setComponent(pointerEntity1, InputPointerComponent, { pointerId: 21, cameraEntity: cameraEntity })
      setComponent(pointerEntity2, InputPointerComponent, { pointerId: 42, cameraEntity: cameraEntity })
      setComponent(pointerEntity3, InputPointerComponent, Dummy)

      const effectSpy = sinon.spy()
      const reactorSpy = sinon.spy()
      let cameraPointers = [] as Entity[]
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(effectSpy.callCount, 0)
      assert.equal(cameraPointers.length, 0)
      const Reactor = () => {
        reactorSpy()
        cameraPointers = InputPointerComponent.usePointersForCamera(cameraEntity)
        useEffect(effectSpy, [cameraPointers.length])
        return null
      }
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 2)
      assert.equal(effectSpy.callCount, 1)
      // Check that the assumptions are correct
      assert.equal(cameraPointers.length, 2)
      for (const pointer of cameraPointers) {
        assert.equal(getComponent(pointer, InputPointerComponent).cameraEntity, cameraEntity)
      }
    })

    it('should be possible to use the returned array reactively', async () => {
      const cameraEntity = createEntity()
      const Dummy = { pointerId: 12356, cameraEntity: createEntity() }
      const pointerEntity1 = createEntity()
      const pointerEntity2 = createEntity()
      const pointerEntity3 = createEntity()
      setComponent(pointerEntity1, InputPointerComponent, { pointerId: 21, cameraEntity: cameraEntity })
      setComponent(pointerEntity2, InputPointerComponent, { pointerId: 42, cameraEntity: cameraEntity })
      setComponent(pointerEntity3, InputPointerComponent, Dummy)

      const effectSpy = sinon.spy()
      const reactorSpy = sinon.spy()
      let cameraPointers = [] as Entity[]
      assert.equal(reactorSpy.callCount, 0)
      assert.equal(effectSpy.callCount, 0)
      assert.equal(cameraPointers.length, 0)
      const Reactor = () => {
        reactorSpy()
        cameraPointers = InputPointerComponent.usePointersForCamera(cameraEntity)
        useEffect(effectSpy, [cameraPointers.length])
        return null
      }
      const root = startReactor(Reactor)
      assert.equal(reactorSpy.callCount, 1)
      assert.equal(effectSpy.callCount, 1)
      // Check the basic assumptions
      assert.equal(cameraPointers.length, 2)
      for (const pointer of cameraPointers) {
        assert.equal(getComponent(pointer, InputPointerComponent).cameraEntity, cameraEntity)
      }
      // Update the components and Check the results
      removeComponent(pointerEntity2, InputPointerComponent)

      await act(async () => render(null))

      assert.equal(reactorSpy.callCount, 2)
      assert.equal(effectSpy.callCount, 2)
      assert.equal(cameraPointers.length, 1)
    })
  }) // << usePointersForCamera
})
