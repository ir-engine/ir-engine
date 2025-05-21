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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  Entity,
  EntityID,
  SourceID,
  UUIDComponent,
  UndefinedEntity,
  createEngine,
  createEntity,
  destroyEngine,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import assert from 'assert'
import sinon from 'sinon'
import { BoxGeometry, Color, Material, Mesh, Texture } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { TransformComponent } from '../RendererModule'
import { MeshComponent } from '../components/MeshComponent'
import { MaterialStateComponent, PrototypeArgumentValue } from './MaterialComponent'
import { formatMaterialArgs, hasPlugin, removePlugin, setMeshMaterial, setPlugin } from './materialFunctions'

const prototypeDefaultArgs: PrototypeArgumentValue = {
  type: 'defaultType',
  default: {},
  min: 21,
  max: 42,
  options: [{}]
}

describe('materialFunctions', () => {
  describe('setMeshMaterial', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id' as EntityID
      })
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should add the first item of `@param newMaterialEntities` to MeshComponent.material when MeshComponent.material is not an array', () => {
      const materialEntity = createEntity()
      const otherMaterialEntity = createEntity()
      setComponent(materialEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id1' as EntityID
      })
      setComponent(otherMaterialEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id2' as EntityID
      })
      const newMaterialEntities = [materialEntity, otherMaterialEntity]
      const material = new Material()
      const expectedUUID = UUIDComponent.get(materialEntity)

      // Set the data as expected
      setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
      setComponent(materialEntity, MaterialStateComponent, { material: material })

      // Sanity check before running
      assert.equal(!testEntity, false)
      assert.equal(!hasComponent(testEntity, MeshComponent), false)
      assert.equal(newMaterialEntities.length === 0, false)

      // Run and Check the result
      setMeshMaterial(testEntity, newMaterialEntities)
      const result = getComponent(testEntity, MeshComponent).material as Material
      assert.equal(Array.isArray(result), false)
      assert.equal(result.uuid, expectedUUID)
    })

    it('should add all items of `@param newMaterialEntities` to MeshComponent.material when MeshComponent.material is an array', () => {
      // Set the fallback material
      const fallbackMaterial = new Material()
      const fallbackUUID = MaterialStateComponent.fallbackMaterialUUIDPair
      const fallbackEntity = createEntity()
      setComponent(fallbackEntity, UUIDComponent, fallbackUUID)
      setComponent(fallbackEntity, MaterialStateComponent, { material: fallbackMaterial })

      // Generate the Materials and Entities
      const material1 = new Material()
      const material2 = new Material()

      const materialEntity1 = createEntity()
      const materialEntity2 = createEntity()
      const dummyEntity = createEntity()
      setComponent(materialEntity1, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id1' as EntityID
      })
      setComponent(materialEntity2, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id2' as EntityID
      })
      setComponent(dummyEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id3' as EntityID
      })
      const newMaterialEntities = [materialEntity1, materialEntity2, dummyEntity]
      const expectedMaterialEntities = [materialEntity1, materialEntity2]

      setComponent(materialEntity1, MaterialStateComponent, { material: material1 })
      setComponent(materialEntity2, MaterialStateComponent, { material: material2 })
      // Note: dummyEntity doesn't have MaterialStateComponent

      // Generate the Mesh with the Materials
      const mesh = new Mesh(new BoxGeometry())
      mesh.material = [new Material(), new Material()] as Material[]
      setComponent(testEntity, TransformComponent)
      setComponent(testEntity, MeshComponent, mesh)

      // Sanity check before running
      assert.equal(!testEntity, false)
      assert.equal(!hasComponent(testEntity, MeshComponent), false)
      assert.equal(expectedMaterialEntities.length === 0, false)

      // Run and Check the result
      setMeshMaterial(testEntity, newMaterialEntities)
      const result = getComponent(testEntity, MeshComponent).material as Material[]
      assert.equal(Array.isArray(result), true)

      // Check that the materials match the expected ones
      for (let i = 0; i < result.length; i++) {
        if (i < expectedMaterialEntities.length) {
          const expectedMaterialEntity = expectedMaterialEntities[i]
          if (hasComponent(expectedMaterialEntity, MaterialStateComponent)) {
            const expectedMaterial = getComponent(expectedMaterialEntity, MaterialStateComponent).material
            assert.equal(result[i].uuid, expectedMaterial.uuid)
          }
        }
      }
    })

    it('should not do anything when `@param groupEntity` is falsy', () => {
      const materialEntity = createEntity()
      setComponent(materialEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id1' as EntityID
      })
      const otherMaterialEntity = createEntity()
      setComponent(otherMaterialEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id2' as EntityID
      })
      const newMaterialEntities = [materialEntity, otherMaterialEntity]
      const material = new Material()
      const expectedUUID = material.uuid

      // Set the data as expected
      setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
      setComponent(materialEntity, MaterialStateComponent, { material: material })

      // Sanity check before running
      assert.equal(!UndefinedEntity, true) // Will pass UndefinedEntity as `@param groupEntity`
      assert.equal(!hasComponent(testEntity, MeshComponent), false)
      assert.equal(newMaterialEntities.length === 0, false)

      // Run and Check the result
      setMeshMaterial(UndefinedEntity, newMaterialEntities)
      const result = getComponent(testEntity, MeshComponent).material
      assert.equal(Array.isArray(result), false)
      assert.notEqual((result as Material).uuid, expectedUUID)
    })

    it('should not do anything when `@param groupEntity` does not have a MeshComponent', () => {
      const materialEntity = createEntity()
      setComponent(materialEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id1' as EntityID
      })
      const otherMaterialEntity = createEntity()
      setComponent(otherMaterialEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id2' as EntityID
      })
      const newMaterialEntities = [materialEntity, otherMaterialEntity]
      const material = new Material()

      // Set the data as expected
      // Do NOT set MeshComponent on testEntity
      setComponent(materialEntity, MaterialStateComponent, { material: material })

      // Sanity check before running
      assert.equal(!testEntity, false)
      assert.equal(!hasComponent(testEntity, MeshComponent), true)
      assert.equal(newMaterialEntities.length === 0, false)

      // Run and Check the result
      setMeshMaterial(testEntity, newMaterialEntities)
      const result = getOptionalComponent(testEntity, MeshComponent)?.material
      assert.equal(Array.isArray(result), false)
      assert.equal(result, undefined)
    })

    it('should not do anything when `@param newMaterialEntities` is empty', () => {
      const newMaterialEntities = [] as Entity[]
      const materialEntity = createEntity()
      setComponent(materialEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id1' as EntityID
      })
      const material = new Material()
      const expectedUUID = material.uuid

      // Set the data as expected
      setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
      setComponent(materialEntity, MaterialStateComponent, { material: material })

      // Sanity check before running
      assert.equal(!testEntity, false)
      assert.equal(!hasComponent(testEntity, MeshComponent), false)
      assert.equal(newMaterialEntities.length === 0, true)

      // Run and Check the result
      setMeshMaterial(testEntity, newMaterialEntities)
      const result = getComponent(testEntity, MeshComponent).material
      assert.equal(Array.isArray(result), false)
      assert.notEqual((result as Material).uuid, expectedUUID)
    })
  }) //:: setMeshMaterial

  describe('setPlugin', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      createEngine()
      mockSpatialEngine()
      testEntity = createEntity()
      setComponent(testEntity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'id' as EntityID
      })
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
}) //:: materialFunctions
