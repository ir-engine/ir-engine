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
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  defineQuery,
  destroyEngine,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent
} from '@ir-engine/ecs'
import assert from 'assert'
import sinon from 'sinon'
import { Material } from 'three'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { NameComponent } from '../../common/NameComponent'
import {
  MaterialPrototypeComponent,
  MaterialPrototypeConstructor,
  MaterialPrototypeDefinitions,
  MaterialStateComponent
} from './MaterialComponent'
import { createMaterialPrototype, getMaterial } from './materialFunctions'

describe('materialFunctions', () => {
  describe('getMaterial', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should return MaterialStateComponent.material when the entity has a MaterialStateComponent', () => {
      const Expected = new Material()
      // Set the data as expected
      setComponent(testEntity, MaterialStateComponent, { material: Expected })
      const uuid = UUIDComponent.generateUUID()
      setComponent(testEntity, UUIDComponent, uuid)
      // Sanity check before running
      const material = getComponent(testEntity, MaterialStateComponent).material
      assert.equal(material.uuid, Expected.uuid)
      // Run and Check the result
      const result = getMaterial(uuid)
      assert.equal(result.uuid, Expected.uuid)
    })

    it('should return MaterialStateComponent.fallbackMaterial.material when the entity does not have a MaterialStateComponent', () => {
      const Expected = new Material()
      const uuid = MaterialStateComponent.fallbackMaterial
      // Set the data as expected
      const fallbackEntity = createEntity()
      setComponent(fallbackEntity, UUIDComponent, uuid)
      setComponent(fallbackEntity, MaterialStateComponent, { instances: [UndefinedEntity], material: Expected })
      const testEntityUUID = UUIDComponent.generateUUID()
      setComponent(testEntity, UUIDComponent, testEntityUUID)
      // Sanity check before running
      const material = getOptionalComponent(fallbackEntity, MaterialStateComponent)
      assert.notEqual(fallbackEntity, undefined)
      assert.notEqual(fallbackEntity, UndefinedEntity)
      assert.notEqual(material, undefined)
      assert.equal(hasComponent(testEntity, MaterialStateComponent), false)
      // Run and Check the result
      const result = getMaterial(testEntityUUID)
      assert.equal(result.uuid, Expected.uuid)
    })
  }) //:: getMaterial

  describe('createMaterialPrototype', () => {
    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    const testQuery = defineQuery([MaterialPrototypeComponent, NameComponent, UUIDComponent])

    it('should create a new entity with components [MaterialPrototypeComponent, NameComponent, UUIDComponent]', () => {
      // Sanity check before running
      const before = testQuery()
      assert.equal(before.length, 0)
      // Run and Check the result
      createMaterialPrototype(MaterialPrototypeDefinitions[0])
      const result = testQuery()
      assert.equal(result.length, 1)
    })

    it('should create a new entity with components [MaterialPrototypeComponent, NameComponent, UUIDComponent] for every entry of the MaterialPrototypeDefinitions array', () => {
      // Sanity check before running
      const before = testQuery()
      assert.equal(before.length, 0)
      // Run and Check the result
      for (const prototype of MaterialPrototypeDefinitions) createMaterialPrototype(prototype)
      const result = testQuery()
      assert.equal(result.length, MaterialPrototypeDefinitions.length)
    })

    it('should assign the `@param prototype`.arguments field to the MaterialPrototypeComponent.prototypeArguments for the new entity that it creates', () => {
      const prototype = MaterialPrototypeDefinitions[0]
      const Expected = prototype.arguments
      // Sanity check before running
      const before = testQuery()
      assert.equal(before.length, 0)
      // Run and Check the result
      createMaterialPrototype(prototype)
      const entities = testQuery()
      assert.equal(entities.length, 1)
      const result = getComponent(entities[0], MaterialPrototypeComponent).prototypeArguments
      assert.deepEqual(result, Expected)
    })

    it('should set the `@param prototype`.prototypeConstructor into the MaterialPrototypeComponent.prototypeConstructor object at ID prototype.prototypeId', () => {
      const spy = sinon.spy()
      const prototype = MaterialPrototypeDefinitions[0]
      const ID = prototype.prototypeId
      prototype.prototypeConstructor = spy as unknown as MaterialPrototypeConstructor
      const Expected = prototype.prototypeConstructor
      // Sanity check before running
      const before = testQuery()
      assert.equal(before.length, 0)
      // Run and Check the result
      createMaterialPrototype(prototype)
      const entities = testQuery()
      assert.equal(entities.length, 1)
      const result = getComponent(entities[0], MaterialPrototypeComponent).prototypeConstructor[ID]
      assert.deepEqual(result, Expected)
    })

    it("should set the new entity's NameComponent to `@param prototype`.prototypeId", () => {
      const prototype = MaterialPrototypeDefinitions[0]
      const Expected = prototype.prototypeId
      // Sanity check before running
      const before = testQuery()
      assert.equal(before.length, 0)
      // Run and Check the result
      createMaterialPrototype(prototype)
      const entities = testQuery()
      assert.equal(entities.length, 1)
      const result = getComponent(entities[0], NameComponent)
      assert.deepEqual(result, Expected)
    })
  }) //:: createMaterialPrototype

  describe('setMeshMaterial', () => {}) //:: setMeshMaterial
  describe('setPlugin', () => {}) //:: setPlugin
  describe('hasPlugin', () => {}) //:: hasPlugin
  describe('removePlugin', () => {}) //:: removePlugin
  describe('materialPrototypeMatches', () => {}) //:: materialPrototypeMatches
  describe('updateMaterialPrototype', () => {}) //:: updateMaterialPrototype
  describe('MaterialNotFoundError', () => {}) //:: MaterialNotFoundError
  describe('PrototypeNotFoundError', () => {}) //:: PrototypeNotFoundError
  describe('getMaterialIndices', () => {}) //:: getMaterialIndices
  describe('getPrototypeEntityFromName', () => {}) //:: getPrototypeEntityFromName
  describe('injectMaterialDefaults', () => {}) //:: injectMaterialDefaults

  /**
  // @todo How to check these?

  describe('formatMaterialArgs', () => {
    it("should not do anything if `@param args` is falsy", () => {})
  }) //:: formatMaterialArgs
  describe('extractDefaults', () => {}) //:: extractDefaults

  describe('loadMaterialGLTF', () => {}) //:: loadMaterialGLTF
  */

  /**
  // @deprecated
  describe('assignMaterial', () => {}) //:: assignMaterial
  describe('createAndAssignMaterial', () => {}) //:: createAndAssignMaterial
  describe('createMaterialEntity', () => {}) //:: createMaterialEntity
  */
}) //:: materialFunctions
