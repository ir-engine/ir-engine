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
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  hasComponent,
  removeEntity,
  serializeComponent,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import assert from 'assert'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { LockedComponent, setLockedComponent } from './LockedComponent'

const LockedComponentDefault = false

describe('LockedComponent', () => {
  describe('IDs', () => {
    it('should initialize the LockedComponent.name field with the expected value', () => {
      assert.equal(LockedComponent.name, 'LockedComponent')
    })

    it('should initialize the LockedComponent.jsonID field with the expected value', () => {
      assert.equal(LockedComponent.jsonID, 'EE_locked')
    })
  }) //:: IDs

  describe('onSet', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should set the value of the LockedComponent correctly', () => {
      assert.notEqual(hasComponent(testEntity, LockedComponent), !LockedComponentDefault)
      setComponent(testEntity, LockedComponent)
      assert.equal(getComponent(testEntity, LockedComponent), LockedComponentDefault)
    })
  }) //:: onSet

  describe('toJSON', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should serialize the component data as expected', () => {
      setComponent(testEntity, LockedComponent)
      const result = serializeComponent(testEntity, LockedComponent)
      assert.equal(typeof result, 'boolean')
      assert.equal(result, false)
    })
  }) //:: toJSON
}) //:: LockedComponent

describe('setLockedComponent', () => {
  let testEntity = UndefinedEntity

  beforeEach(async () => {
    createEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    return destroyEngine()
  })

  it("should add a LockedComponent to the entity when it doesn't have one and `@param locked` is set to true", () => {
    assert.equal(hasComponent(testEntity, LockedComponent), false)
    setLockedComponent(testEntity, true)
    assert.equal(hasComponent(testEntity, LockedComponent), true)
  })

  it('should remove the LockedComponent from the entity when it has one and `@param locked` is set to false', () => {
    assert.equal(hasComponent(testEntity, LockedComponent), false)
    setLockedComponent(testEntity, true)
    assert.equal(hasComponent(testEntity, LockedComponent), true)
    setLockedComponent(testEntity, false)
    assert.equal(hasComponent(testEntity, LockedComponent), false)
  })
}) //:: setLockedComponent
