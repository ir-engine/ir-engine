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
import { getMutableState } from '@ir-engine/hyperflux'
import assert from 'assert'
import sinon from 'sinon'
import { BoxGeometry, Color, Material, Mesh, Texture } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { assertArray } from '../../../tests/util/assert'
import { mockSpatialEngine } from '../../../tests/util/mockSpatialEngine'
import { TransformComponent } from '../RendererModule'
import { MeshComponent } from '../components/MeshComponent'
import {
  MaterialInstanceComponent,
  MaterialPrototypeDefinitions,
  MaterialStateComponent,
  PrototypeArgument,
  PrototypeArgumentValue
} from './MaterialComponent'
import {
  MaterialNotFoundError,
  PrototypeNotFoundError,
  extractDefaults,
  formatMaterialArgs,
  getMaterialIndices,
  hasPlugin,
  injectMaterialDefaults,
  removePlugin,
  setMeshMaterial,
  setPlugin
} from './materialFunctions'

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
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should add the first item of `@param newMaterialEntities` to MeshComponent.material when MeshComponent.material is not an array', () => {
      const materialEntity = createEntity()
      const otherMaterialEntity = createEntity()
      const newMaterialEntities = [materialEntity, otherMaterialEntity]
      const material = new Material()
      const expectedUUID = material.uuid

      // Set the data as expected
      setComponent(testEntity, MeshComponent, new Mesh(new BoxGeometry()))
      setComponent(materialEntity, MaterialStateComponent, { material: material })

      // Sanity check before running
      assert.equal(!testEntity, false)
      assert.equal(!hasComponent(testEntity, MeshComponent), false)
      assert.equal(newMaterialEntities.length === 0, false)

      // Run and Check the result
      setMeshMaterial(testEntity, newMaterialEntities)
      const result = getComponent(testEntity, MeshComponent).material
      assert.equal(Array.isArray(result), false)
      assert.equal((result as Material).uuid, expectedUUID)
    })

    it('should add all items of `@param newMaterialEntities` to MeshComponent.material when MeshComponent.material is an array', () => {
      // Set the fallback material
      const fallbackMaterial = new Material()
      const fallbackUUID = MaterialStateComponent.fallbackMaterialUUIDPair
      const fallbackEntity = createEntity()
      setComponent(fallbackEntity, UUIDComponent, fallbackUUID)
      setComponent(fallbackEntity, MaterialStateComponent, { instances: [UndefinedEntity], material: fallbackMaterial })

      // Generate the Materials and Entities
      const material1 = new Material()
      const material2 = new Material()
      const dummyMaterial = new Material()
      const materialEntity1 = createEntity()
      const materialEntity2 = createEntity()
      const dummyEntity = createEntity()
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
      const otherMaterialEntity = createEntity()
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
      const otherMaterialEntity = createEntity()
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
      const materialEntity = createEntity()
      // setComponent(testEntity, MaterialInstanceComponent)
      // Sanity check before running
      assert.equal(hasComponent(testEntity, MaterialInstanceComponent), false)
      // Run and Check the result
      const result = getMaterialIndices(testEntity, materialEntity)
      assert.equal(result.length, 0)
    })

    it('should return an array that contains the indices of MaterialInstanceComponent.uuid that matched the `@param materialEntity`. None of them should be undefined', () => {
      // Set the data as expected
      const dummyEntity1 = createEntity()
      const dummyEntity2 = createEntity()
      const dummyEntity3 = createEntity()
      const materialEntity = createEntity()
      const materialEntities = [
        materialEntity,
        dummyEntity1,
        materialEntity,
        dummyEntity2,
        materialEntity,
        dummyEntity3
      ] as Entity[]
      const Expected = [0, 2, 4]
      setComponent(testEntity, MaterialInstanceComponent, { entities: materialEntities })

      // Sanity check before running
      assert.equal(hasComponent(testEntity, MaterialInstanceComponent), true)
      for (const id of Expected) assert.equal(materialEntities[id], materialEntity)

      // Run and Check the result
      const result = getMaterialIndices(testEntity, materialEntity)
      assert.equal(result.length, Expected.length)
      assertArray.eq(result, Expected)
    })
  }) //:: getMaterialIndices

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
      const type = 'stereotomy'
      const key = 'voyager'
      const prototypeArgumentValue = {
        type,
        default: {},
        min: 42,
        max: 43,
        options: []
      }
      const prototypeArguments = { [key]: prototypeArgumentValue }
      const materialParameters = { [key]: { thing: 42 } }
      getMutableState(MaterialPrototypeDefinitions)[type].set({
        arguments: prototypeArguments,
        prototypeConstructor: Material
      })
      const Expected = { ...prototypeArguments }
      Expected[key].default = materialParameters[key]

      // Set the data as expected
      const material = new Material()
      material.type = type
      const materialEntity = createEntity()
      setComponent(materialEntity, MaterialStateComponent, {
        material: material,
        parameters: materialParameters
      })

      // Run and Check the result
      const result = injectMaterialDefaults(materialEntity)
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
}) //:: materialFunctions
