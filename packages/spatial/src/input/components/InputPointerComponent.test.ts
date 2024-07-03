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
} from '@etherealengine/ecs'
import assert from 'assert'
import { Vector2 } from 'three'
import { InputPointerComponent } from './InputPointerComponent'

const InputPointerComponentDefaults = {
  pointerId: -1 as number,
  position: new Vector2(),
  lastPosition: new Vector2(),
  movement: new Vector2(),
  cameraEntity: UndefinedEntity
}

describe('InputPointerComponent', () => {
  describe('IDs', () => {
    it('should initialize the InputPointerComponent.name field with the expected value', () => {
      assert.equal(InputPointerComponent.name, 'InputPointerComponent')
    })
  })

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
  }) // << onSet

  describe('getPointersForCamera', () => {
    const PointerID = 42
    let testEntity = UndefinedEntity
    let cameraEntity = UndefinedEntity

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
      removeEntity(cameraEntity)
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
})
