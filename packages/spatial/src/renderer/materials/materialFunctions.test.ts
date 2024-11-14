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
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  defineQuery,
  destroyEngine,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import assert from 'assert'
import { isArray } from 'lodash'
import sinon from 'sinon'
import { BoxGeometry, Color, Material, Mesh, Texture } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertArrayEqual } from '../../../tests/util/mathAssertions'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { NameComponent } from '../../common/NameComponent'
import { TransformComponent } from '../RendererModule'
import { MeshComponent } from '../components/MeshComponent'
import {
  MaterialInstanceComponent,
  MaterialPrototypeComponent,
  MaterialPrototypeConstructor,
  MaterialPrototypeDefinitions,
  MaterialPrototypeObjectConstructor,
  MaterialStateComponent,
  PrototypeArgument,
  PrototypeArgumentValue
} from './MaterialComponent'
import {
  MaterialNotFoundError,
  PrototypeNotFoundError,
  createMaterialPrototype,
  extractDefaults,
  formatMaterialArgs,
  getMaterial,
  getMaterialIndices,
  getPrototypeEntityFromName,
  hasPlugin,
  injectMaterialDefaults,
  materialPrototypeMatches,
  removePlugin,
  setMeshMaterial,
  setPlugin,
  updateMaterialPrototype
} from './materialFunctions'

const prototypeDefaultArgs: PrototypeArgumentValue = {
  type: 'defaultType',
  default: {},
  min: 21,
  max: 42,
  options: [{}]
}

describe('materialFunctions', () => {
  describe('getMaterial', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
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

  describe('setMeshMaterial', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should add the first item of `@param newMaterialUUIDs` to MeshComponent.material when MeshComponent.material is not an array', () => {
      const Expected = UUIDComponent.generateUUID()
      const newMaterialUUIDs = [Expected, UUIDComponent.generateUUID()]
      const material = new Material()
      material.uuid = Expected
      // Set the data as expected
      setComponent(testEntity, UUIDComponent, UUIDComponent.generateUUID())
      setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
      const materialEntity = createEntity()
      setComponent(materialEntity, UUIDComponent, Expected)
      setComponent(materialEntity, MaterialStateComponent, { material: material })
      // Sanity check before running
      assert.equal(!testEntity, false)
      assert.equal(!hasComponent(testEntity, MeshComponent), false)
      assert.equal(newMaterialUUIDs.length === 0, false)
      // Run and Check the result
      setMeshMaterial(testEntity, newMaterialUUIDs)
      const result = getComponent(testEntity, MeshComponent).material
      assert.equal(isArray(result), false)
      assert.equal((result as Material).uuid, Expected)
    })

    it('should add all items of `@param newMaterialUUIDs` to MeshComponent.material when MeshComponent.material is an array', () => {
      // Set the fallback material
      const fallbackMaterial = new Material()
      const fallbackUUID = MaterialStateComponent.fallbackMaterial
      const fallbackEntity = createEntity()
      setComponent(fallbackEntity, UUIDComponent, fallbackUUID)
      setComponent(fallbackEntity, MaterialStateComponent, { instances: [UndefinedEntity], material: fallbackMaterial })

      // Generate all UUIDs
      const DummyUUID = UUIDComponent.generateUUID()
      const uuid1 = UUIDComponent.generateUUID()
      const uuid2 = UUIDComponent.generateUUID()
      const newMaterialUUIDs = [uuid1, uuid2, DummyUUID]
      const Expected = [uuid1, uuid2]
      // Generate the Materials
      const material1 = new Material()
      const material2 = new Material()
      material1.uuid = uuid1
      material2.uuid = uuid2
      const materialEntity1 = createEntity()
      const materialEntity2 = createEntity()
      setComponent(materialEntity1, UUIDComponent, uuid1)
      setComponent(materialEntity2, UUIDComponent, uuid2)
      setComponent(materialEntity1, MaterialStateComponent, { material: material1 })
      setComponent(materialEntity2, MaterialStateComponent, { material: material2 })
      // Generate the Mesh with the Materials
      const mesh = new Mesh(new BoxGeometry())
      mesh.material = [material1, material2] as Material[]
      setComponent(testEntity, UUIDComponent, UUIDComponent.generateUUID())
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, MeshComponent, mesh)

      // Sanity check before running
      assert.equal(!testEntity, false)
      assert.equal(!hasComponent(testEntity, MeshComponent), false)
      assert.equal(Expected.length === 0, false)

      // Run and Check the result
      setMeshMaterial(testEntity, newMaterialUUIDs)
      const result = getComponent(testEntity, MeshComponent).material as Material[]
      assert.equal(isArray(result), true)
      for (const material of result) {
        assert.notEqual(material.uuid, DummyUUID)
        assert.notEqual(material.uuid, fallbackUUID)
        assert.equal(Expected.includes(material.uuid as EntityUUID), true)
      }
    })

    it('should not do anything when `@param groupEntity` is falsy', () => {
      const Expected = UUIDComponent.generateUUID()
      const newMaterialUUIDs = [Expected, UUIDComponent.generateUUID()]
      const material = new Material()
      material.uuid = Expected
      // Set the data as expected
      setComponent(testEntity, UUIDComponent, UUIDComponent.generateUUID())
      setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
      const materialEntity = createEntity()
      setComponent(materialEntity, UUIDComponent, Expected)
      setComponent(materialEntity, MaterialStateComponent, { material: material })
      // Sanity check before running
      assert.equal(!UndefinedEntity, true) // Will pass UndefinedEntity as `@param groupEntity`
      assert.equal(!hasComponent(testEntity, MeshComponent), false)
      assert.equal(newMaterialUUIDs.length === 0, false)
      // Run and Check the result
      setMeshMaterial(UndefinedEntity, newMaterialUUIDs)
      const result = getComponent(testEntity, MeshComponent).material
      assert.equal(isArray(result), false)
      assert.notEqual((result as Material).uuid, Expected)
    })

    it('should not do anything when `@param groupEntity` does not have a MeshComponent', () => {
      const Expected = UUIDComponent.generateUUID()
      const newMaterialUUIDs = [Expected, UUIDComponent.generateUUID()]
      const material = new Material()
      material.uuid = Expected
      // Set the data as expected
      setComponent(testEntity, UUIDComponent, UUIDComponent.generateUUID())
      // setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
      const materialEntity = createEntity()
      setComponent(materialEntity, UUIDComponent, Expected)
      setComponent(materialEntity, MaterialStateComponent, { material: material })
      // Sanity check before running
      assert.equal(!testEntity, false)
      assert.equal(!hasComponent(testEntity, MeshComponent), true)
      assert.equal(newMaterialUUIDs.length === 0, false)
      // Run and Check the result
      setMeshMaterial(testEntity, newMaterialUUIDs)
      const result = getOptionalComponent(testEntity, MeshComponent)?.material
      assert.equal(isArray(result), false)
      assert.equal(result, undefined)
    })

    it('should not do anything when `@param newMaterialUUIDs` is empty', () => {
      const newMaterialUUIDs = [] as EntityUUID[]
      const Expected = UUIDComponent.generateUUID()
      const material = new Material()
      material.uuid = Expected
      // Set the data as expected
      setComponent(testEntity, UUIDComponent, UUIDComponent.generateUUID())
      setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
      const materialEntity = createEntity()
      setComponent(materialEntity, UUIDComponent, Expected)
      setComponent(materialEntity, MaterialStateComponent, { material: material })
      // Sanity check before running
      assert.equal(!testEntity, false)
      assert.equal(!hasComponent(testEntity, MeshComponent), false)
      assert.equal(newMaterialUUIDs.length === 0, true)
      // Run and Check the result
      setMeshMaterial(testEntity, newMaterialUUIDs)
      const result = getComponent(testEntity, MeshComponent).material
      assert.equal(isArray(result), false)
      assert.notEqual((result as Material).uuid, Expected)
    })
  }) //:: setMeshMaterial

  describe('setPlugin', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should set material.onBeforeCompile to `@param callback`', () => {
      const material = new Material()
      const callback = sinon.spy()
      // Sanity check before running
      const before = material.onBeforeCompile.toString()
      assert.notEqual(before, callback)
      // Run and Check the result
      setPlugin(material, callback)
      const result = material.onBeforeCompile.toString()
      assert.equal(result, callback)
    })

    it('should set material.needsUpdate to true', () => {
      const callback = sinon.spy()
      const material = new Material()
      // Sanity check before running
      const before = material.version
      assert.equal(before, 0)
      // Run and Check the result
      setPlugin(material, callback)
      const result = material.version
      assert.equal(result, 1)
    })
  }) //:: setPlugin

  describe('hasPlugin', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should return false if the `@param material`.plugins array is empty', () => {
      const Expected = false
      const callback = sinon.spy()
      // Set the data as expected
      const material = new Material()
      material.plugins = []
      // Sanity check before running
      assert.equal(material.plugins.length, 0)
      assert.equal(material.plugins.includes(callback), false)
      // Run and Check the result
      const result = hasPlugin(material, callback)
      assert.equal(result, Expected)
    })

    it('should return false if the `@param material`.plugins array is not empty but does not contain the `@param callback`', () => {
      const Expected = false
      const callback = sinon.spy()
      const other = () => {}
      // Set the data as expected
      const material = new Material()
      material.plugins = [other]
      // Sanity check before running
      assert.equal(material.plugins.length, 1)
      assert.equal(material.plugins.includes(callback), false)
      // Run and Check the result
      const result = hasPlugin(material, callback)
      assert.equal(result, Expected)
    })

    it('should return true if the `@param material`.plugins array is not empty and it contains the `@param callback`', () => {
      const Expected = true
      const callback = sinon.spy()
      // Set the data as expected
      const material = new Material()
      material.plugins = [callback]
      // Sanity check before running
      assert.equal(material.plugins.length, 1)
      assert.equal(material.plugins.includes(callback), true)
      // Run and Check the result
      const result = hasPlugin(material, callback)
      assert.equal(result, Expected)
    })
  }) //:: hasPlugin

  describe('removePlugin', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should remove the `@param callback` function from the `@param material`.plugins array', () => {
      const Expected = false
      const Initial = !Expected
      const callback = sinon.spy()
      // Set the data as expected
      const material = new Material()
      material.plugins = [callback]
      // Sanity check before running
      const before = material.plugins.includes(callback)
      assert.equal(before, Initial)
      // Run and Check the result
      removePlugin(material, callback)
      const result = material.plugins.includes(callback)
      assert.equal(result, Expected)
    })
  }) //:: removePlugin

  describe('materialPrototypeMatches', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should return true when the prototypeName is equal to the material.userData.type, even if material.type would match', () => {
      const Expected = true
      // Set the data as expected
      const prototypeEntity = createEntity()
      const materialEntity = createEntity()
      const prototypeUUID = UUIDComponent.generateUUID()
      const materialUUID = UUIDComponent.generateUUID()
      const material = new Material()
      material.uuid = materialUUID
      material.userData = { type: '123456' }
      const prototypeName = material.userData.type
      const prototypeConstructor = (() => {}) as unknown as MaterialPrototypeConstructor
      setComponent(prototypeEntity, UUIDComponent, prototypeUUID)
      setComponent(materialEntity, UUIDComponent, materialUUID)
      setComponent(prototypeEntity, MaterialPrototypeComponent, {
        prototypeConstructor: { [prototypeName as string]: prototypeConstructor }
      })
      setComponent(materialEntity, MaterialStateComponent, { material: material, prototypeEntity: prototypeEntity })
      // Sanity check before running
      assert.equal(!getComponent(materialEntity, MaterialStateComponent).prototypeEntity, false)
      // Run and Check the result
      const result = materialPrototypeMatches(materialEntity)
      assert.equal(result, Expected)
    })

    it('should return true when the prototypeName is equal to the material.type if material.userData.type is falsy', () => {
      const Expected = true
      // Set the data as expected
      const prototypeEntity = createEntity()
      const materialEntity = createEntity()
      const prototypeUUID = UUIDComponent.generateUUID()
      const materialUUID = UUIDComponent.generateUUID()
      const material = new Material()
      material.uuid = materialUUID
      material.userData = { type: 0 }
      const prototypeName = material.type
      const prototypeConstructor = (() => {}) as unknown as MaterialPrototypeConstructor
      setComponent(prototypeEntity, UUIDComponent, prototypeUUID)
      setComponent(materialEntity, UUIDComponent, materialUUID)
      setComponent(prototypeEntity, MaterialPrototypeComponent, {
        prototypeConstructor: { [prototypeName as string]: prototypeConstructor }
      })
      setComponent(materialEntity, MaterialStateComponent, { material: material, prototypeEntity: prototypeEntity })
      // Sanity check before running
      assert.equal(!getComponent(materialEntity, MaterialStateComponent).prototypeEntity, false)
      assert.equal(Boolean(material.userData.type), false)
      // Run and Check the result
      const result = materialPrototypeMatches(materialEntity)
      assert.equal(result, Expected)
    })

    it('should return false if `@param materialEntity` does not have a MaterialStateComponent', () => {
      const Expected = false
      // Set the data as expected
      const materialUUID = UUIDComponent.generateUUID()
      const material = new Material()
      material.uuid = materialUUID
      const materialEntity = createEntity()
      setComponent(materialEntity, UUIDComponent, materialUUID)
      // setComponent(materialEntity, MaterialStateComponent, { material: material })
      // Sanity check before running
      assert.equal(hasComponent(materialEntity, MaterialStateComponent), false)
      // Run and Check the result
      const result = materialPrototypeMatches(materialEntity)
      assert.equal(result, Expected)
    })

    it('should return false when `@param materialEntity`.MaterialStateComponent.prototypeEntity is falsy', () => {
      const Expected = false
      // Set the data as expected
      const materialUUID = UUIDComponent.generateUUID()
      const material = new Material()
      material.uuid = materialUUID
      const materialEntity = createEntity()
      setComponent(materialEntity, UUIDComponent, materialUUID)
      setComponent(materialEntity, MaterialStateComponent, { material: material })
      // Sanity check before running
      assert.equal(!getComponent(materialEntity, MaterialStateComponent).prototypeEntity, true)
      // Run and Check the result
      const result = materialPrototypeMatches(materialEntity)
      assert.equal(result, Expected)
    })

    it('should return false if `@param materialEntity`.MaterialStateComponent.prototypeEntity does not have a MaterialPrototypeComponent', () => {
      const Expected = false
      // Set the data as expected
      const prototypeEntity = createEntity()
      const materialEntity = createEntity()
      const prototypeUUID = UUIDComponent.generateUUID()
      const materialUUID = UUIDComponent.generateUUID()
      const material = new Material()
      material.uuid = materialUUID
      setComponent(prototypeEntity, UUIDComponent, prototypeUUID)
      setComponent(materialEntity, UUIDComponent, materialUUID)
      // setComponent(prototypeEntity, MaterialPrototypeComponent, { prototypeConstructor: { [prototypeName as string]: prototypeConstructor } })
      setComponent(materialEntity, MaterialStateComponent, { material: material, prototypeEntity: prototypeEntity })
      // Sanity check before running
      assert.equal(!getComponent(materialEntity, MaterialStateComponent).prototypeEntity, false)
      assert.equal(hasComponent(prototypeEntity, MaterialPrototypeComponent), false)
      // Run and Check the result
      const result = materialPrototypeMatches(materialEntity)
      assert.equal(result, Expected)
    })

    it('should return false if `@param materialEntity`.MaterialStateComponent.protypeEntity.MaterialPrototypeComponent.prototypeConstructor is falsy', () => {
      const Expected = false
      // Set the data as expected
      const prototypeEntity = createEntity()
      const materialEntity = createEntity()
      const prototypeUUID = UUIDComponent.generateUUID()
      const materialUUID = UUIDComponent.generateUUID()
      const material = new Material()
      material.uuid = materialUUID
      const DummyConstructor = {} as MaterialPrototypeObjectConstructor
      setComponent(prototypeEntity, UUIDComponent, prototypeUUID)
      setComponent(materialEntity, UUIDComponent, materialUUID)
      setComponent(prototypeEntity, MaterialPrototypeComponent, { prototypeConstructor: {} })
      setComponent(materialEntity, MaterialStateComponent, { material: material, prototypeEntity: prototypeEntity })
      // Sanity check before running
      assert.equal(!getComponent(materialEntity, MaterialStateComponent).prototypeEntity, false)
      const prototypeConstructor = getComponent(prototypeEntity, MaterialPrototypeComponent).prototypeConstructor
      assert.deepEqual(prototypeConstructor, DummyConstructor)
      // Run and Check the result
      const result = materialPrototypeMatches(materialEntity)
      assert.equal(result, Expected)
    })
  }) //:: materialPrototypeMatches

  describe('getMaterialIndices', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should return an empty array if `@param entity` does not have a MaterialInstanceComponent', () => {
      // Set the data as expected
      const materialUUID = UUIDComponent.generateUUID()
      // setComponent(testEntity, MaterialInstanceComponent)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, MaterialInstanceComponent), false)
      // Run and Check the result
      const result = getMaterialIndices(testEntity, materialUUID)
      assert.equal(result.length, 0)
    })

    it('should return an array that contains the indices of MaterialInstanceComponent.uuid that matched the `@param materialUUID`. None of them should be undefined', () => {
      // Set the data as expected
      const dummy1 = UUIDComponent.generateUUID()
      const dummy2 = UUIDComponent.generateUUID()
      const dummy3 = UUIDComponent.generateUUID()
      const materialUUID = UUIDComponent.generateUUID()
      const uuids = [materialUUID, dummy1, materialUUID, dummy2, materialUUID, dummy3] as EntityUUID[]
      const Expected = [0, 2, 4]
      setComponent(testEntity, MaterialInstanceComponent, { uuid: uuids })
      // Sanity check before running
      assert.equal(hasComponent(testEntity, MaterialInstanceComponent), true)
      for (const id of Expected) assert.equal(uuids[id], materialUUID)
      // Run and Check the result
      const result = getMaterialIndices(testEntity, materialUUID)
      assert.equal(result.length, Expected.length)
      assertArrayEqual(result, Expected)
    })
  }) //:: getMaterialIndices

  describe('getPrototypeEntityFromName', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should return the first entity that has a MaterialPrototypeComponent and a NameComponent that matches the `@param name`', () => {
      const Expected = testEntity
      const name = 'ExpectedName'
      // Set the data as expected
      setComponent(testEntity, NameComponent, name)
      setComponent(testEntity, MaterialPrototypeComponent)
      const otherEntity = createEntity()
      setComponent(otherEntity, NameComponent, 'OtherEntityName')
      setComponent(otherEntity, MaterialPrototypeComponent)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, NameComponent), true)
      assert.equal(hasComponent(otherEntity, NameComponent), true)
      assert.equal(hasComponent(testEntity, MaterialPrototypeComponent), true)
      assert.equal(hasComponent(otherEntity, MaterialPrototypeComponent), true)
      // Run and Check the result
      const result = getPrototypeEntityFromName(name)
      assert.notEqual(result, otherEntity)
      assert.equal(result, Expected)
    })

    it('should return undefined when there are no entities that have a MaterialPrototypeComponent', () => {
      const Expected = undefined
      const name = 'ExpectedName'
      // Set the data as expected
      setComponent(testEntity, NameComponent, name)
      // setComponent(testEntity, MaterialPrototypeComponent)
      const otherEntity = createEntity()
      setComponent(otherEntity, NameComponent, name)
      // setComponent(otherEntity, MaterialPrototypeComponent)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, NameComponent), true)
      assert.equal(hasComponent(otherEntity, NameComponent), true)
      assert.equal(hasComponent(testEntity, MaterialPrototypeComponent), false)
      assert.equal(hasComponent(otherEntity, MaterialPrototypeComponent), false)
      // Run and Check the result
      const result = getPrototypeEntityFromName(name)
      assert.notEqual(result, otherEntity)
      assert.notEqual(result, testEntity)
      assert.equal(result, Expected)
    })

    it('should return undefined when the first entity that has a MaterialPrototypeComponent has a NameComponent that does not match the `@param name`', () => {
      const Expected = undefined
      const name = 'ExpectedName'
      // Set the data as expected
      setComponent(testEntity, NameComponent, name)
      setComponent(testEntity, MaterialPrototypeComponent)
      const otherEntity = createEntity()
      setComponent(otherEntity, NameComponent, name)
      setComponent(otherEntity, MaterialPrototypeComponent)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, NameComponent), true)
      assert.equal(hasComponent(otherEntity, NameComponent), true)
      assert.equal(hasComponent(testEntity, MaterialPrototypeComponent), true)
      assert.equal(hasComponent(otherEntity, MaterialPrototypeComponent), true)
      // Run and Check the result
      const result = getPrototypeEntityFromName('OtherName')
      assert.notEqual(result, otherEntity)
      assert.notEqual(result, testEntity)
      assert.equal(result, Expected)
    })

    it('should return undefined when the entity that has a MaterialPrototypeComponent does not have a NameComponent', () => {
      const Expected = undefined
      const name = 'ExpectedName'
      // Set the data as expected
      // setComponent(testEntity, NameComponent, name)
      setComponent(testEntity, MaterialPrototypeComponent)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, NameComponent), false)
      assert.equal(hasComponent(testEntity, MaterialPrototypeComponent), true)
      // Run and Check the result
      const result = getPrototypeEntityFromName(name)
      assert.notEqual(result, testEntity)
      assert.equal(result, Expected)
    })
  }) //:: getPrototypeEntityFromName

  describe('injectMaterialDefaults', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should return an object that contains all of the expected keys/values', () => {
      const key = 'asdfg'
      const prototypeArgumentValue = {
        type: '12345',
        default: {},
        min: 42,
        max: 43,
        options: []
      }
      const prototypeArguments = { [key]: prototypeArgumentValue }
      const materialParameters = { [key]: { thing: 42 } }
      const Expected = { ...prototypeArguments }
      Expected[key].default = materialParameters[key]

      // Set the data as expected
      const material = new Material()
      const prototypeEntity = createEntity()
      const materialEntity = createEntity()
      const prototypeUUID = UUIDComponent.generateUUID()
      const materialUUID = UUIDComponent.generateUUID()
      setComponent(prototypeEntity, UUIDComponent, prototypeUUID)
      material.uuid = materialUUID
      setComponent(prototypeEntity, MaterialPrototypeComponent, {
        prototypeArguments: prototypeArguments
      })
      setComponent(materialEntity, UUIDComponent, materialUUID)
      setComponent(materialEntity, MaterialStateComponent, {
        material: material,
        prototypeEntity: prototypeEntity,
        parameters: materialParameters
      })
      // Run and Check the result
      const result = injectMaterialDefaults(materialUUID)
      assert.deepEqual(result, Expected)
    })
  }) //:: injectMaterialDefaults

  describe('MaterialNotFoundError', () => {
    it('should assign the expected name to the error when it is instanced', () => {
      const Expected = 'MaterialNotFound'
      const result = new MaterialNotFoundError('thing')
      assert.equal(result.name, Expected)
    })

    it('should assign the expected message to the error when it is instanced', () => {
      const Expected = 'thing'
      const result = new MaterialNotFoundError(Expected)
      assert.equal(result.message, Expected)
    })
  }) //:: MaterialNotFoundError

  describe('PrototypeNotFoundError', () => {
    it('should assign the expected name to the error when it is instanced', () => {
      const Expected = 'PrototypeNotFound'
      const result = new PrototypeNotFoundError('thing')
      assert.equal(result.name, Expected)
    })

    it('should assign the expected message to the error when it is instanced', () => {
      const Expected = 'thing'
      const result = new PrototypeNotFoundError(Expected)
      assert.equal(result.message, Expected)
    })
  }) //:: PrototypeNotFoundError

  describe('formatMaterialArgs', () => {
    it('should return `@param args` if it is falsy', () => {
      // Set the data as expected
      const Expected1 = false
      const Expected2 = undefined
      const Expected3 = null
      const Expected4 = 0
      // Sanity check before running
      assert.equal(!Expected1, true)
      assert.equal(!Expected2, true)
      assert.equal(!Expected3, true)
      assert.equal(!Expected4, true)
      // Run and Check the result
      const result1 = formatMaterialArgs(Expected1)
      const result2 = formatMaterialArgs(Expected2)
      const result3 = formatMaterialArgs(Expected3)
      const result4 = formatMaterialArgs(Expected4)
      assert.equal(result1, Expected1)
      assert.equal(result2, Expected2)
      assert.equal(result3, Expected3)
      assert.equal(result4, Expected4)
    })

    describe('when `@param defaultArgs` is not passed ...', () => {
      it('... should return the object passed as `@param args` when none of the `@param args` object properties is a texture or an empty string', () => {
        // Set the data as expected
        const Expected = { asdf: 'asdf', thing: 41, other: 42, obj: { sub1: 43, sub2: 44 } }
        // Sanity check before running
        assert.equal(!Expected, false)
        // Run and Check the result
        const result = formatMaterialArgs(Expected)
        assert.deepEqual(result, Expected)
      })

      it('... should return the object passed as `@param args` without any of its empty string properties', () => {
        const Expected = { asdf: 'asdfValue', other: 42 }
        // Set the data as expected
        const Thing = ''
        const Args = { thing: Thing, ...Expected }
        // Sanity check before running
        assert.equal(!Expected, false)
        // Run and Check the result
        const result = formatMaterialArgs(Args)
        assert.deepEqual(result, Expected)
      })

      it('... should return the object passed as `@param args` without any of its texture properties when the tex.source.data of that property is undefined', () => {
        const texture = new Texture()
        texture.source.data = 'SomeDefinedData'
        const Expected = { tex: texture, asdf: 'asdfValue', other: 42 }
        // Set the data as expected
        const Thing = new Texture()
        Thing.source.data = undefined
        const Args = { thing: Thing, ...Expected }
        // Sanity check before running
        assert.equal(!Expected, false)
        assert.equal(Thing.source.data, undefined)
        assert.notEqual(texture.source.data, undefined)
        // Run and Check the result
        const result = formatMaterialArgs(Args)
        assert.deepEqual(result, Expected)
      })
    })

    describe('when `@param defaultArgs` is passed ...', () => {
      it('... should return the object passed as `@param args` without any of the `@param defaultArgs` properties that is not a valid Color or ColorRepresentation', () => {
        // Set the data as expected
        const valid = { str: '0x000000', num: 0xff0000, col: new Color(0, 0, 1) }
        const args = { ...valid, asdf: 'asdfValue', other: 42 }
        const defaultArgs1 = { ...prototypeDefaultArgs, default: { ...valid } }
        const defaultArgs2 = { ...prototypeDefaultArgs, default: { ...valid } }
        const defaultArgs = { arg1: defaultArgs1, arg2: defaultArgs2 }
        const Expected = { ...args, ...valid }
        // Sanity check before running
        assert.equal(!Expected, false)
        // Run and Check the result
        const result = formatMaterialArgs(args, defaultArgs)
        assert.deepEqual(result, Expected)
      })

      it('... should return the object passed as `@param args` when none of the `@param args` object properties is a texture or an empty string', () => {
        // Set the data as expected
        const Expected = { asdf: 'asdf', thing: 41, other: 42, obj: { sub1: 43, sub2: 44 } }
        const defaultArgs = { one: { ...prototypeDefaultArgs, default: { num: 1 } } }
        // Sanity check before running
        assert.equal(!Expected, false)
        // Run and Check the result
        const result = formatMaterialArgs(Expected, defaultArgs)
        assert.deepEqual(result, Expected)
      })
    })
  }) //:: formatMaterialArgs

  describe('extractDefaults', () => {
    it('should return an object that has all of the `@param defaultArgs`.default properties', () => {
      // Set the data as expected
      const defaultArg1 = { str: '0x111111', num: 0xff1111, col: new Color(0, 0, 0.1), one: 1 }
      const defaultArg2 = { str: '0x222222', num: 0xff2222, col: new Color(0, 0, 0.2), two: 2 }
      const defaultArg3 = { str: '0x333333', num: 0xff3333, col: new Color(0, 0, 0.3), three: 3 }
      const defaultArg4 = { str: '0x444444', num: 0xff4444, col: new Color(0, 0, 0.4), four: 4 }
      const arg1: PrototypeArgumentValue = { ...prototypeDefaultArgs, default: defaultArg1 }
      const arg2: PrototypeArgumentValue = { ...prototypeDefaultArgs, default: defaultArg2 }
      const arg3: PrototypeArgumentValue = { ...prototypeDefaultArgs, default: defaultArg3 }
      const arg4: PrototypeArgumentValue = { ...prototypeDefaultArgs, default: defaultArg4 }
      const defaultArgs: PrototypeArgument = { arg1: arg1, arg2: arg2, arg3: arg3, arg4: arg4 }
      const Expected = { arg1: defaultArg1, arg2: defaultArg2, arg3: defaultArg3, arg4: defaultArg4 }
      // Run and Check the result
      const result = extractDefaults(defaultArgs)
      assert.deepEqual(result, Expected)
    })
  }) //:: extractDefaults

  describe('updateMaterialPrototype', () => {
    let materialEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      materialEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(materialEntity)
      return destroyEngine()
    })

    class MockMaterial {
      constructor() {}
    }

    it('should return undefined if the `@param materialEntity` does not have a MaterialStateComponent', () => {
      // Sanity check before running
      assert.equal(hasComponent(materialEntity, MaterialStateComponent), false)
      // Run and Check the result
      const result = updateMaterialPrototype(materialEntity)
      assert.equal(result, undefined)
    })

    it('should return undefined if the `@param materialEntity`.MaterialStateComponent.prototypeEntity is falsy', () => {
      // Set the data as expected
      setComponent(materialEntity, MaterialStateComponent, { prototypeEntity: UndefinedEntity })
      // Sanity check before running
      assert.equal(hasComponent(materialEntity, MaterialStateComponent), true)
      assert.equal(Boolean(getComponent(materialEntity, MaterialStateComponent).prototypeEntity), false)
      // Run and Check the result
      const result = updateMaterialPrototype(materialEntity)
      assert.equal(result, undefined)
    })

    it('should return undefined if the `@param materialEntity`.MaterialStateComponent.prototypeEntity does not have a NameComponent', () => {
      // Set the data as expected
      const prototypeEntity = createEntity()
      setComponent(materialEntity, MaterialStateComponent, { prototypeEntity: prototypeEntity })
      // Sanity check before running
      assert.equal(hasComponent(materialEntity, MaterialStateComponent), true)
      assert.equal(Boolean(getComponent(materialEntity, MaterialStateComponent).prototypeEntity), true)
      assert.equal(hasComponent(prototypeEntity, NameComponent), false)
      // Run and Check the result
      const result = updateMaterialPrototype(materialEntity)
      assert.equal(result, undefined)
    })

    it('should return undefined if the `@param materialEntity`.MaterialStateComponent.prototypeEntity does not have a MaterialPrototypeComponent', () => {
      // Set the data as expected
      const prototypeEntity = createEntity()
      const prototypeName = 'testPrototypeName'
      setComponent(prototypeEntity, NameComponent, prototypeName)
      setComponent(materialEntity, MaterialStateComponent, { prototypeEntity: prototypeEntity })
      // Sanity check before running
      assert.equal(hasComponent(materialEntity, MaterialStateComponent), true)
      assert.equal(Boolean(getComponent(materialEntity, MaterialStateComponent).prototypeEntity), true)
      assert.equal(hasComponent(prototypeEntity, NameComponent), true)
      assert.equal(hasComponent(prototypeEntity, MaterialPrototypeComponent), false)
      // Run and Check the result
      const result = updateMaterialPrototype(materialEntity)
      assert.equal(result, undefined)
    })

    it('should return undefined if the `@param materialEntity`.MaterialStateComponent.prototypeEntity.MaterialPrototypeComponent does not have a prototypeConstructor field with the NameComponent of the prototypeEntity', () => {
      // Set the data as expected
      const prototypeEntity = createEntity()
      const prototypeName = 'testPrototypeName'
      const prototypeConstructor = {} // { [prototypeName]: MockMaterial }
      setComponent(prototypeEntity, NameComponent, prototypeName)
      setComponent(prototypeEntity, MaterialPrototypeComponent, { prototypeConstructor: prototypeConstructor })
      setComponent(materialEntity, MaterialStateComponent, { prototypeEntity: prototypeEntity })
      // Sanity check before running
      assert.equal(hasComponent(materialEntity, MaterialStateComponent), true)
      assert.equal(Boolean(getComponent(materialEntity, MaterialStateComponent).prototypeEntity), true)
      assert.equal(hasComponent(prototypeEntity, NameComponent), true)
      assert.equal(hasComponent(prototypeEntity, MaterialPrototypeComponent), true)
      const hasConstructorWithPrototypeName = Object.keys(prototypeConstructor).includes(prototypeName)
      assert.equal(hasConstructorWithPrototypeName, false)
      // Run and Check the result
      const result = updateMaterialPrototype(materialEntity)
      assert.equal(result, undefined)
    })

    it('should return undefined if `@param materialEntity`.MaterialStateComponent.material.type is equal to the prototypeEntity.NameComponent', () => {
      // Set the data as expected
      const prototypeEntity = createEntity()
      const prototypeName = 'testPrototypeName'
      const prototypeConstructor = { [prototypeName]: MockMaterial }
      setComponent(prototypeEntity, NameComponent, prototypeName)
      setComponent(prototypeEntity, MaterialPrototypeComponent, { prototypeConstructor: prototypeConstructor })
      const material = new Material()
      material.type = prototypeName
      setComponent(materialEntity, MaterialStateComponent, { material: material, prototypeEntity: prototypeEntity })
      // Sanity check before running
      assert.equal(hasComponent(materialEntity, MaterialStateComponent), true)
      assert.equal(Boolean(getComponent(materialEntity, MaterialStateComponent).prototypeEntity), true)
      assert.equal(hasComponent(prototypeEntity, NameComponent), true)
      assert.equal(hasComponent(prototypeEntity, MaterialPrototypeComponent), true)
      const hasConstructorWithPrototypeName = Object.keys(prototypeConstructor).includes(prototypeName)
      assert.equal(hasConstructorWithPrototypeName, true)
      /** @todo prototypeArguments check */
      assert.equal(
        getComponent(materialEntity, MaterialStateComponent).material.type,
        getComponent(prototypeEntity, NameComponent)
      )
      // Run and Check the result
      const result = updateMaterialPrototype(materialEntity)
      assert.equal(result, undefined)
    })

    /** @todo
    it("should create a material by calling its prototypeConstructor with its prototypeArguments", () => {})
    it("should assign a function to result.customProgramCacheKey that will ???", () => {})
    it("should assign the `@param materialEntity`.MaterialStateComponent.uuid to the result.uuid", () => {})
    it("should assign the `@param materialEntity`.MaterialStateComponent.defines['USE_COLOR'] to the resulting material if the existing material also had that property", () => {})
    it("should assign the `@param materialEntity`.MaterialStateComponent.userData to the resulting material, except for its `type` property", () => {})
    it("should assign the resulting material to the `@param materialEntity`.MaterialStateComponent", () => {})
    it("should assign the defaults contained in `@param materialEntity`.MaterialStateComponent.prototypeEntity.MaterialPrototypeComponent.prototypeArguments to the `@param materialEntity`.MaterialStateComponent.parameters", () => {})
    it("should return the resulting material when it completed its process successfully", () => {})
    */
  }) //:: updateMaterialPrototype

  /**
  // @deprecated until the GLTF ECS Loader is merged : https://github.com/ir-engine/ir-engine/pull/11
  describe('loadMaterialGLTF', () => {}) //:: loadMaterialGLTF
  describe('assignMaterial', () => {}) //:: assignMaterial
  describe('createAndAssignMaterial', () => {}) //:: createAndAssignMaterial
  describe('createMaterialEntity', () => {}) //:: createMaterialEntity
  */
}) //:: materialFunctions
