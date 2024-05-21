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
import {
  ComponentMap,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  serializeComponent,
  setComponent
} from './ComponentFunctions'
import { destroyEngine, startEngine } from './Engine'
import { EntityUUID, UndefinedEntity } from './Entity'
import { createEntity, removeEntity } from './EntityFunctions'
import { UUIDComponent } from './UUIDComponent'

describe('UUIDComponent', async () => {
  const TestUUID = 'TestUUID' as EntityUUID
  const TestUUID2 = UUIDComponent.generateUUID()
  let entity1 = UndefinedEntity
  let entity2 = UndefinedEntity

  beforeEach(() => {
    startEngine()
    ComponentMap.clear()
    entity1 = createEntity()
    entity2 = createEntity()
  })

  afterEach(() => {
    removeEntity(entity1)
    removeEntity(entity2)
    return destroyEngine()
  })

  describe('onSet', () => {
    it('should throw an Error exception when the uuid argument is not passed.', () => {
      assert.throws(() => {
        setComponent(entity1, UUIDComponent)
      }, Error)
    })

    it('should set/get the data of the component.', () => {
      // Case1: set/get
      setComponent(entity1, UUIDComponent, TestUUID)
      const component1 = getComponent(entity1, UUIDComponent)
      assert.ok(component1, 'The UUIDComponent did not get set correctly')
      assert.equal(component1, TestUUID, 'The UUID value did not get set correctly')
    })

    it("shouldn't change the data when set multiple times with the same data", () => {
      setComponent(entity1, UUIDComponent, TestUUID)
      const component1 = getComponent(entity1, UUIDComponent)
      setComponent(entity1, UUIDComponent, TestUUID)
      const component2 = getComponent(entity1, UUIDComponent)
      assert.equal(component1, component2)
    })

    it('Should throw an error when the UUID is already in use for another entity', () => {
      setComponent(entity1, UUIDComponent, TestUUID)
      assert.throws(() => {
        setComponent(entity2, UUIDComponent, TestUUID)
      }, Error)
    })

    it('should remove the old uuid from the entity', () => {
      setComponent(entity1, UUIDComponent, TestUUID)
      setComponent(entity1, UUIDComponent, TestUUID2)
      assert.notEqual(getComponent(entity1, UUIDComponent), TestUUID)
    })

    it('should set a new uuid, and return its value when called with getOptionalComponent', () => {
      setComponent(entity1, UUIDComponent, TestUUID)
      assert.notEqual(getOptionalComponent(entity1, UUIDComponent), undefined)
    })
  })

  describe('toJson', () => {
    it('should return correctly serialized data', () => {
      setComponent(entity1, UUIDComponent, TestUUID)
      const json = serializeComponent(entity1, UUIDComponent)
      assert.equal(json, TestUUID as string)
    })
  })

  describe('onRemove', () => {
    it('should remove the component from the entity', () => {
      setComponent(entity1, UUIDComponent, TestUUID)
      removeComponent(entity1, UUIDComponent)
      assert.equal(UndefinedEntity, UUIDComponent.entitiesByUUIDState[TestUUID].value)
      assert.equal(false, hasComponent(entity1, UUIDComponent))
      assert.equal(getOptionalComponent(entity1, UUIDComponent), undefined)
    })

    it('should do nothing if the entity does not have the component', () => {
      removeComponent(entity1, UUIDComponent)
      assert.equal(UndefinedEntity, UUIDComponent.entitiesByUUIDState[TestUUID].value)
      assert.equal(getOptionalComponent(entity1, UUIDComponent), undefined)
    })
  })

  describe('getEntityByUUID', () => {})

  // TODO: useEntityByUUID
})
