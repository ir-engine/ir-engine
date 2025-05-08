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

/**
 * @note
 * Other related code that also has ECSLayers specific tests:
 * - ComponentFunctions.test.tsx : createEntity removeEntity
 * - UUIDComponent.test.tsx   : Almost every function
 * */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import assert from 'assert'
import {
  createEntity,
  CreatePropagationArgs,
  defineComponent,
  entityExists,
  getComponent,
  hasComponent,
  LayerComponent,
  LayerComponents,
  LayerFunctions,
  LayerID,
  LayerRelationTypes,
  Layers,
  removeComponent,
  removeEntity,
  setComponent
} from './ComponentFunctions'
import { createEngine, destroyEngine } from './Engine'
import { Entity, UndefinedEntity } from './Entity'
import { defineQuery } from './QueryFunctions'
import { S } from './schemas/JSONSchemas'
import { Kind, Schema } from './schemas/JSONSchemaTypes'

const TestComponent = defineComponent({ name: 'SomeTestComponent' })

describe('LayerFunctions', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  describe('getLayerRelationsEntities', () => {
    it('should return undefined if LayerFunctions.getLayerComponent(`@param entity`) is falsy', () => {
      const Expected = undefined

      const layer = Layers.Simulation
      const testEntity = createEntity(layer)
      const backup = LayerComponents[layer]
      LayerComponents[layer] = null as any

      const result = LayerFunctions.getLayerRelationsEntities(testEntity)
      expect(result).toEqual(Expected)

      LayerComponents[layer] = backup
    })

    it('should return undefined if getOptionalComponent(`@param entity`, LayerFunctions.getLayerComponent(`@param entity`)) is falsy', () => {
      const Expected = undefined

      const layer = Layers.Simulation
      const testEntity = createEntity(layer)
      removeComponent(testEntity, LayerFunctions.getLayerComponent(testEntity))

      const result = LayerFunctions.getLayerRelationsEntities(testEntity)
      expect(result).toEqual(Expected)
    })

    it('should return an array of arrays that contains valid layer ID numbers in slot 0 of each subarray', () => {
      const testEntity = createEntity(Layers.Authoring)

      const result = LayerFunctions.getLayerRelationsEntities(testEntity)
      assert(result)
      expect(Array.isArray(result)).toBeTruthy()
      expect(Array.isArray(result[0])).toBeTruthy()
      expect(Object.values(Layers).includes(result[0][0] as LayerID)).toBeTruthy()
    })

    it('should return an array of arrays that contains valid Entity IDs in slot 1 of each subarray', () => {
      const testEntity = createEntity(Layers.Authoring)

      const result = LayerFunctions.getLayerRelationsEntities(testEntity)
      assert(result)
      expect(Array.isArray(result)).toBeTruthy()
      expect(Array.isArray(result[0])).toBeTruthy()
      expect(entityExists(result[0][1])).toBeTruthy()
    })

    it('should retrieve the `@param entity` Layer relations from the LayerFunctions.getLayerComponent(entity) component and map them as expected into the result', () => {
      const testEntity = createEntity(Layers.Authoring)

      const result = LayerFunctions.getLayerRelationsEntities(testEntity)
      assert(result)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(1)
      expect(result[0][0]).toBe(Layers.Simulation)
      expect(entityExists(result[0][1])).toBeTruthy()
    })
  }) //:: getLayerRelationsEntities

  describe('getLayerRelationsTypes', () => {
    it('should return an array of arrays that contains valid layer ID numbers in slot 0 of each subarray', () => {
      const layer = Layers.Authoring

      const result = LayerFunctions.getLayerRelationsTypes(layer)
      expect(Array.isArray(result)).toBeTruthy()
      expect(Array.isArray(result[0])).toBeTruthy()
      expect(Object.values(Layers).includes(result[0][0] as LayerID)).toBeTruthy()
    })

    it('should return an array of arrays that contains a valid RelationTypes entry in slot 1 of each subarray', () => {
      const layer = Layers.Authoring

      const result = LayerFunctions.getLayerRelationsTypes(layer)
      expect(Array.isArray(result)).toBeTruthy()
      expect(Array.isArray(result[0])).toBeTruthy()
      expect(Object.values(LayerRelationTypes).includes(result[0][1])).toBeTruthy()
    })

    it('should retrieve the `@param entity` Layer relations from the LayerFunctions.getLayerComponent(entity) component and map them as expected into the result', () => {
      const layer = Layers.Authoring

      const result = LayerFunctions.getLayerRelationsTypes(layer)
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(1)
      expect(result[0][0]).toBe(Layers.Simulation)
      expect(Object.values(LayerRelationTypes).includes(result[0][1])).toBeTruthy()
    })
  }) //:: getLayerRelationsTypes

  describe('getLayerComponent', () => {
    it('should return the expected Layer component for the `@param entity` from the `LayerComponents` map', () => {
      const Expected = LayerComponents[Layers.Authoring]

      const testEntity = createEntity(Layers.Authoring)

      const result = LayerFunctions.getLayerComponent(testEntity)
      expect(result).toBe(Expected)
      expect(result).toEqual(Expected)
    })
  }) //:: getLayerComponent

  describe('shouldPropagate', () => {
    it('should never return true when comparing a layer with itself', () => {
      const Expected = false

      const layerA = Layers.Authoring
      const layerB = Layers.Authoring

      const result = LayerFunctions.shouldPropagate(layerA, layerB)
      expect(result).toBe(Expected)
    })

    it('should return true if the given layer pair is expected to trigger propagation behavior.', () => {
      const Expected = true

      const layerA = Layers.Authoring
      const layerB = Layers.Simulation

      const result = LayerFunctions.shouldPropagate(layerA, layerB)
      expect(result).toBe(Expected)
    })

    it('should return false if the given layer pair is not expected to trigger propagation behavior.', () => {
      const Expected = false

      const layerA = Layers.Simulation
      const layerB = Layers.Authoring

      const result = LayerFunctions.shouldPropagate(layerA, layerB)
      expect(result).toBe(Expected)
    })
  }) //:: shouldPropagate

  describe('propagateLayer', () => {
    it('should not do anything if `@param component` is LayerComponent', () => {
      const resultSpy = vi.spyOn(LayerFunctions, 'createLayerPropagationArgs')
      const entityLayer = Layers.Authoring
      const testEntity = createEntity(entityLayer)
      const component = LayerComponent as any

      LayerFunctions.propagateLayer(testEntity, component)
      expect(resultSpy).not.toHaveBeenCalled()
    })

    it('should not do anything if the LayerComponents array contains `@param component`', () => {
      const resultSpy = vi.spyOn(LayerFunctions, 'createLayerPropagationArgs')
      const entityLayer = Layers.Authoring
      const testEntity = createEntity(entityLayer)
      const component = LayerComponents[entityLayer]

      LayerFunctions.propagateLayer(testEntity, component)
      expect(resultSpy).not.toHaveBeenCalled()
    })

    /** @todo Broken by #2015ad3 */
    describe('for every (layer,entity) pair returned by LayerFunctions.getLayerRelationsEntities for the `@param entity`', () => {
      // should call removeComponent(linkedEntity, component) and not do anything else for this pair (continue) if `@param entity` does not have `@param component`

      it('.. should not do anything else for this pair (continue) if the result of LayerFunctions.shouldPropagate(entityLayer, linkedLayer) is falsy', () => {
        const resultSpy = vi.spyOn(LayerFunctions, 'createLayerPropagationArgs')
        const entityLayer = Layers.Simulation
        const testEntity = createEntity(entityLayer)
        const component = TestComponent as any

        LayerFunctions.propagateLayer(testEntity, component)
        expect(resultSpy).not.toHaveBeenCalled()
      })

      it('.. should call LayerFunctions.createLayerPropagationArgs with (entity, linkedLayer, component) as arguments when LayerFunctions.shouldPropagate(entityLayer, linkedLayer) is truthy', () => {
        const entityLayer = Layers.Authoring
        const linkedLayer = Layers.Simulation
        const testEntity = createEntity(entityLayer)
        const component = TestComponent
        setComponent(testEntity, component)
        const resultSpy = vi.spyOn(LayerFunctions, 'createLayerPropagationArgs')

        LayerFunctions.propagateLayer(testEntity, component)
        expect(resultSpy).toHaveBeenCalled()
        expect(resultSpy).toHaveBeenCalledWith(testEntity, linkedLayer, component)
      })

      it('.. should call setComponent with (linkedEntity, `@param component`, `@param args`) as arguments', () => {
        const entityLayer = Layers.Authoring
        const testEntity = createEntity(entityLayer)
        const component = TestComponent as any
        const linkedEntity = LayerFunctions.getLayerRelationsEntities(testEntity)![0][1]
        setComponent(testEntity, component)
        removeComponent(linkedEntity, component) // Remove the component that was already propagated

        LayerFunctions.propagateLayer(testEntity, component)
        const result = hasComponent(linkedEntity, component)
        expect(result).toBeTruthy()
      })
    })
  }) //:: propagateLayer

  describe('getAuthoringCounterpart', () => {
    it('should return the entity stored in the `.refs` field of the SimulationLayerComponent for the given `@param entity`', () => {
      const Expected = 123456 as Entity

      const layer = Layers.Simulation
      const testEntity = createEntity(layer)
      LayerComponents[Layers.Simulation].refs[testEntity] = Expected

      const result = LayerFunctions.getAuthoringCounterpart(testEntity)
      expect(result).toBe(Expected)
    })
  }) //:: getAuthoringCounterpart

  describe('createLayerPropagationArgs', () => {
    let testEntity = UndefinedEntity

    beforeEach(() => {
      testEntity = createEntity()
    })

    afterEach(() => {
      removeEntity(testEntity)
    })

    it('should return undefined if `@param component`.schema is falsy', () => {
      const Expected = undefined

      const component = defineComponent({ name: 'TestComponent', schema: undefined })
      const linkedLayer: LayerID = Layers.Authoring

      const result = LayerFunctions.createLayerPropagationArgs(testEntity, linkedLayer, component)

      expect(result).toBe(Expected)
    })

    it('should return the object resulting from calling CreatePropagationArgs.Inner, with all its undefined values removed', () => {
      const Initial = 'TestValue'

      const component = defineComponent({ name: 'TestComponent', schema: S.String({ default: Initial }) })
      setComponent(testEntity, component)
      const key = ''
      const data = Initial
      const layer: LayerID = Layers.Simulation
      const linkedLayer: LayerID = Layers.Authoring
      const Expected = CreatePropagationArgs.Inner(
        component.schema as any,
        key,
        data,
        layer,
        linkedLayer,
        testEntity,
        component
      )
      const resultSpy = vi.spyOn(CreatePropagationArgs, 'Inner')

      const result = LayerFunctions.createLayerPropagationArgs(testEntity, linkedLayer, component)

      expect(resultSpy).toHaveBeenCalledTimes(1)
      expect(result).toEqual(Expected)
    })
  }) //:: createLayerPropagationArgs
}) //:: LayerFunctions

describe('CreatePropagationArgs', () => {
  let testEntity = UndefinedEntity

  beforeEach(() => {
    createEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroyEngine()
  })

  describe('Inner', () => {
    it("should return undefined when `@param key` is '', and typeof `@param data` is 'undefined'", () => {
      const Expected = undefined

      const component = defineComponent({ name: 'TestComponent', schema: S.String({ default: 'TestValue' }) })
      setComponent(testEntity, component)
      const key = ''
      const data = undefined
      const layer: LayerID = Layers.Simulation
      const linkedLayer: LayerID = Layers.Authoring

      const result = CreatePropagationArgs.Inner(
        component.schema as any,
        key,
        data,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).toEqual(Expected)
    })

    it("should return undefined when `@param key` is not '', and typeof `@param data`[key] is 'undefined'", () => {
      const Expected = undefined

      const component = defineComponent({ name: 'TestComponent', schema: S.String({ default: 'TestValue' }) })
      setComponent(testEntity, component)
      const key = 'SomeKey'
      const data = {}
      const layer: LayerID = Layers.Simulation
      const linkedLayer: LayerID = Layers.Authoring

      const result = CreatePropagationArgs.Inner(
        component.schema as any,
        key,
        data,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).toEqual(Expected)
    })

    describe.each(['Null', 'Undefined', 'Void', 'Bool', 'String', 'Enum', 'Literal'])('case: Kind.%s', (kind) => {
      const TestSchemaKind = kind

      it("should return `@param data` if `@param key` is '' and data is not undefined", () => {
        const Expected = { one: 1 }

        const schema = { [Kind]: TestSchemaKind, properties: [], options: { serialized: true } } as Schema
        const component = defineComponent({ name: 'TestComponent', schema: schema })
        setComponent(testEntity, component)
        const key = ''
        const data = Expected
        const layer: LayerID = Layers.Simulation
        const linkedLayer: LayerID = Layers.Authoring

        const result = CreatePropagationArgs.Inner(
          component.schema as any,
          key,
          data,
          layer,
          linkedLayer,
          testEntity,
          component
        )

        expect(result).toBe(Expected)
        expect(result).toEqual(Expected)
      })

      it("should return `@param data`[`@param key`] if `@param key` is not '' and data is not undefined", () => {
        const Expected = 42

        const schema = { [Kind]: TestSchemaKind, properties: [], options: { serialized: true } } as Schema
        const component = defineComponent({ name: 'TestComponent', schema: schema })
        setComponent(testEntity, component)
        const key = 'one'
        const data = { [key]: Expected }
        const layer: LayerID = Layers.Simulation
        const linkedLayer: LayerID = Layers.Authoring

        const result = CreatePropagationArgs.Inner(
          component.schema as any,
          key,
          data,
          layer,
          linkedLayer,
          testEntity,
          component
        )

        expect(result).toBe(Expected)
        expect(result).toEqual(Expected)
      })
    })

    it.each([
      ['Number', 'Number'],
      ['Any', 'Any'],
      ['Class', 'Class'],
      ['Object', 'Object'],
      ['Array', 'Array'],
      ['Tuple', 'Tuple'],
      ['Union', 'Union'],
      ['Default', 'Partial']
    ])("should call CreatePropagationArgs.%s when `@param schema`[Kind] is '%s'", (fn, kind) => {
      const TestSchemaKind = kind

      const schema = { [Kind]: TestSchemaKind, options: { default: 42, serialized: true }, properties: [] } as Schema
      const component = defineComponent({ name: 'TestComponent', schema: schema })
      setComponent(testEntity, component)
      const key = 'one'
      const data = { one: { val: 42, clone: () => {} } }
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring
      const resultSpy = vi.spyOn(CreatePropagationArgs, fn as any)

      CreatePropagationArgs.Inner(component.schema as any, key, data, layer, linkedLayer, testEntity, component)

      expect(resultSpy).toHaveBeenCalled()
    })

    it.each([['Record', 'Record']])(
      "should call CreatePropagationArgs.%s when `@param schema`[Kind] is '%s'",
      (fn, kind) => {
        const TestSchemaKind = kind

        const schema = {
          [Kind]: TestSchemaKind,
          properties: { key: S.String(), value: S.Number() },
          options: { serialized: true }
        } as Schema
        const component = defineComponent({ name: 'TestComponent', schema: schema })
        setComponent(testEntity, component)
        const key = 'one'
        const data = { one: { val: 42, clone: () => {} } }
        const layer = Layers.Simulation
        const linkedLayer = Layers.Authoring
        const resultSpy = vi.spyOn(CreatePropagationArgs, fn as any)

        CreatePropagationArgs.Inner(component.schema as any, key, data, layer, linkedLayer, testEntity, component)

        expect(resultSpy).toHaveBeenCalled()
      }
    )

    it.each([
      ['Default', 'Proxy'],
      ['Default', 'InvalidKind']
    ])("should call CreatePropagationArgs.%s when `@param schema`[Kind] is '%s'", (fn, kind) => {
      const TestSchemaKind = kind

      const properties = S.Number()
      const schema = {
        [Kind]: TestSchemaKind,
        options: { default: 42, serialized: true },
        properties: properties
      } as Schema
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const data = 42
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring
      const resultSpy = vi.spyOn(CreatePropagationArgs, fn as any)

      CreatePropagationArgs.Inner(component.schema as any, key, data, layer, linkedLayer, testEntity, component)

      expect(resultSpy).toHaveBeenCalled()
    })
  }) //:: Inner

  describe('Number', () => {
    it('should return `@param obj` if it is UndefinedEntity', () => {
      const Expected = UndefinedEntity

      const schema = S.Number({ default: 42 })
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = Expected
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring

      const result = CreatePropagationArgs.Number(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).toBe(Expected)
    })

    describe("when `@param schema`[`@param key`] is 'Number' and schema.options.['id'] is 'Entity' ..", () => {
      const id = 'Entity'
      const key = 'Number'

      it('should return `@param obj` if LayerComponent.get(obj) is `@param linkedLayer`', () => {
        const Expected = testEntity

        const schema = S.Number({ id: id })
        const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
        setComponent(testEntity, component)
        const obj = Expected
        const layer = Layers.Authoring
        const linkedLayer = Layers.Simulation

        const result = CreatePropagationArgs.Number(
          component.schema as any,
          key,
          obj,
          layer,
          linkedLayer,
          testEntity,
          component
        )

        expect(result).toBe(Expected)
      })

      it('should return the result of getComponent(`@param obj`, LayerComponents[`@param layer`].relations[`@param linkedLayer`]', () => {
        const schema = S.Number({ id: id })
        const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
        setComponent(testEntity, component)
        const obj = testEntity
        const layer = Layers.Authoring
        const linkedLayer = Layers.Simulation
        setComponent(testEntity, LayerComponent, layer)
        const Expected = getComponent(obj, LayerComponents[layer]).relations[linkedLayer]

        const result = CreatePropagationArgs.Number(
          component.schema as any,
          key,
          obj,
          layer,
          linkedLayer,
          testEntity,
          component
        )

        expect(result).toBe(Expected)
      })
    }) //:: Number:Entity

    it("should return `@param obj` if `@param schema`[`@param key`] is 'Number' and schema.options.['id'] is not 'Entity'", () => {
      const Expected = 12345 as Entity

      const schema = S.Number({ default: 42, id: 'NotEntity' })
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = 'Number'
      const obj = Expected
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring

      const result = CreatePropagationArgs.Number(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).toBe(Expected)
    })

    it("should return `@param obj` if `@param schema`[`@param key`] is not 'Number' and schema.options.['id'] is 'Entity'", () => {
      const Expected = 12345 as Entity

      const schema = { [Kind]: 'String', options: { default: 42, id: 'Entity', serialized: true } } as Schema
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = 'OtherKey'
      const obj = Expected
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring

      const result = CreatePropagationArgs.Number(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).toBe(Expected)
    })
  }) //:: Number

  describe('Any', () => {
    it('should return undefined if `@param obj` is falsy', () => {
      const Expected = undefined

      const schema = S.Number({ default: 42 })
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = false
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring

      const result = CreatePropagationArgs.Any(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).toBe(Expected)
    })

    it("should return the result of calling `@param obj`.clone if typeof obj is 'object' and obj contains a valid function at .clone", () => {
      const Expected = 42

      const schema = S.Number({ default: 1234 })
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = { clone: () => Expected }
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring

      const result = CreatePropagationArgs.Any(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).toBe(Expected)
    })

    it('should return a new array containing all elements of `@param obj` if obj is an array', () => {
      const Expected = [40, 41, 42, 'TestValue']

      const schema = S.Number({ default: 1234 })
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = Expected
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring

      const result = CreatePropagationArgs.Any(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).not.toBe(Expected)
      expect(result).toEqual(Expected)
    })

    it('should return a deep clone of `@param obj` if it does not have a .clone function and it is not an array', () => {
      const Expected = { one: 41, two: 42 }

      const schema = S.Number({ default: 1234 })
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = Expected
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring

      const result = CreatePropagationArgs.Any(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).not.toBe(Expected)
      expect(result).toEqual(Expected)
    })
  }) //:: Any

  describe('Class', () => {
    it('should return undefined if `@param obj` is falsy', () => {
      const Expected = undefined

      const schema = S.Number({ default: 42 })
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = false
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring

      const result = CreatePropagationArgs.Class(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).toBe(Expected)
    })

    it('should return the result of calling `@param obj`.clone if obj contains a valid function at .clone', () => {
      const Expected = 42

      const schema = S.Number({ default: 21 })
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = { clone: () => Expected }
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring

      const result = CreatePropagationArgs.Class(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).toBe(Expected)
    })

    it('should return a deep copy of `@param obj` when it is a clonable class', () => {
      const Expected = { one: 41, two: 'TWO' }

      const schema = S.Number({ default: 21 })
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = Expected
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring

      const result = CreatePropagationArgs.Class(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).not.toBe(Expected)
      expect(result).toEqual(Expected)
    })

    it('should call console.warn and return `@param obj` when obj is not a clonable class', () => {
      const Expected = { one: 41, two: 'TWO', sym: Symbol('SomeSymbol') }

      const schema = S.Number({ default: 21 })
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = Expected
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring

      const result = CreatePropagationArgs.Class(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).toBe(Expected)
      expect(result).toEqual(Expected)
    })
  }) //:: Class

  describe('Object', () => {
    it('should return undefined if `@param obj` is falsy', () => {
      const Expected = undefined

      const schema = S.Number()
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = false
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring

      const result = CreatePropagationArgs.Object(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).toBe(Expected)
    })

    it("should return a new object created by recursively calling CreatePropagationArgs.Inner for all the fields of `@param obj`, and ignoring any of its results for which typeof is 'undefined'", () => {
      const Expected = { one: 41, two: 'TWO' }

      const properties = {
        one: S.Number(),
        two: S.String()
      }
      const schema = { [Kind]: 'Number', properties: properties, options: { serialized: true } } as Schema
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = Expected
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring
      const resultSpy = vi.spyOn(CreatePropagationArgs, 'Inner')

      const result = CreatePropagationArgs.Object(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).not.toBe(Expected)
      expect(result).toEqual(Expected)
      expect(resultSpy).toHaveBeenCalledTimes(Object.keys(obj).length)
    })
  }) //:: Object

  describe('Record', () => {
    it('should return undefined if `@param obj` is falsy', () => {
      const Expected = undefined

      const schema = S.Number()
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = false
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring

      const result = CreatePropagationArgs.Record(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).toBe(Expected)
    })

    it.todo(
      "should return a new record created by recursively calling CreatePropagationArgs.Inner for all the values of `@param obj`, and ignoring any of its results for which typeof is 'undefined'",
      () => {}
    )
  }) //:: Record

  describe('Array', () => {
    it('should return undefined if `@param obj` is falsy', () => {
      const Expected = undefined

      const schema = S.Number()
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = false
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring

      const result = CreatePropagationArgs.Array(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).toBe(Expected)
    })

    it('should return a new array created by recursively calling CreatePropagationArgs.Inner for all the values of `@param obj`', () => {
      const Expected = [41, 42, 43]

      const schema = { [Kind]: 'Array', properties: S.Number() } as Schema
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = Expected
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring
      const resultSpy = vi.spyOn(CreatePropagationArgs, 'Inner')

      const result = CreatePropagationArgs.Array(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).not.toBe(Expected)
      expect(result).toEqual(Expected)
      expect(resultSpy).toHaveBeenCalledTimes(obj.length)
    })
  }) //:: Array

  describe('Tuple', () => {
    it('should return undefined if `@param obj` is falsy', () => {
      const Expected = undefined

      const schema = S.Number()
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = false
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring

      const result = CreatePropagationArgs.Tuple(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).toBe(Expected)
    })

    it('should return a new tuple created by recursively calling CreatePropagationArgs.Inner for all the inner values of `@param obj', () => {
      const Expected = [41, 'TWO', 43]

      const properties = [S.Number(), S.String(), S.Number()]
      const schema = S.Tuple(properties)
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = Expected
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring
      const resultSpy = vi.spyOn(CreatePropagationArgs, 'Inner')

      const result = CreatePropagationArgs.Tuple(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).not.toBe(Expected)
      expect(result).toEqual(Expected)
      expect(resultSpy).toHaveBeenCalledTimes(obj.length)
    })
  }) //:: Tuple

  describe('Union', () => {
    it('should return result of CreatePropagationArgs.Inner for the first value of `@param schema`.properties that does not return undefined for `@param obj`', () => {
      const Expected = { one: 42 }

      const properties = [S.Number(), S.String(), { [Kind]: 'Object', properties: { one: S.Number() } } as Schema]
      const schema = { [Kind]: 'Union', properties: properties } as Schema
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = Expected
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring
      const resultSpy = vi.spyOn(CreatePropagationArgs, 'Inner')

      const result = CreatePropagationArgs.Union(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).toEqual(Expected)
      expect(resultSpy).toHaveBeenCalledTimes(Object.keys(obj).length)
    })

    it('should return null if none of the values of `@param schema`.properties describe a valid schema for `@param obj`', () => {
      const Expected = null

      const properties = [] // @warning The first entry of this array would hit no matter what
      const schema = { [Kind]: 'Union', properties: properties } as Schema
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = { outer: { one: 42 } }
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring
      const resultSpy = vi.spyOn(CreatePropagationArgs, 'Inner')

      const result = CreatePropagationArgs.Union(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).toEqual(Expected)
      expect(resultSpy).not.toHaveBeenCalled()
    })
  }) //::  Union

  describe('Default', () => {
    it("should return `@param obj` when its typeof is 'number' and `@param schema`.properties is falsy", () => {
      const Expected = 42

      const schema = { [Kind]: 'Number', properties: false } as Schema
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = Expected
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring
      const resultSpy = vi.spyOn(CreatePropagationArgs, 'Inner')

      const result = CreatePropagationArgs.Default(
        component.schema as any,
        key,
        obj,
        layer,
        linkedLayer,
        testEntity,
        component
      )

      expect(result).toEqual(Expected)
      expect(resultSpy).toHaveBeenCalledTimes(Object.keys(obj).length)
    })

    it('should return the result of CreatePropagationArgs.Inner when `@param schema`.properties is truthy', () => {
      const Expected = { one: 41 }

      const properties = { one: S.Number() }
      const schema = S.Object(properties)
      const component = defineComponent({ name: 'TestComponent', schema: schema, onSet: () => {} })
      setComponent(testEntity, component)
      const key = ''
      const obj = Expected
      const layer = Layers.Simulation
      const linkedLayer = Layers.Authoring
      const resultSpy = vi.spyOn(CreatePropagationArgs, 'Inner')

      const result = CreatePropagationArgs.Inner(component.schema, key, obj, layer, linkedLayer, testEntity, component)

      expect(result).not.toBe(Expected)
      expect(result).toEqual(Expected)
      expect(resultSpy).toHaveBeenCalled()
    })
  }) //:: Default
}) //:: CreatePropagationArgs

describe('setComponent', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  /** @section ECS Layers specific tests */
  it('should call LayerFunctions.propagateLayer with (entity, component, args) as arguments', () => {
    const TestComponent = defineComponent({ name: '123' })
    const testEntity = createEntity()
    const resultSpy = vi.spyOn(LayerFunctions, 'propagateLayer')
    // Run and Check the result
    setComponent(testEntity, TestComponent)
    expect(resultSpy).toHaveBeenCalled()
    expect(resultSpy).toHaveBeenCalledWith(testEntity, TestComponent)
  })

  /** @section Other tests for Coverage */
  it.todo('should throw an error if `@param entity` is falsy', () => {})
  it.todo(
    'should throw an error if calling bitECS.entityExists with (HyperFlux.store, `@param entity`) as arguments returns a falsy value',
    () => {}
  )
  describe('when the result of hasComponent(`@param entity`, `@param component`) is falsy ...', () => {
    it.todo(
      '.. should set `@param component`.stateMap[`@param entity`] to the result of hookstate(createInitialComponentValue(`@param entity`, `@param component`)) when `@param component`.stateMap[`@param entity`] is falsy',
      () => {}
    )
    it.todo(
      '.. should call `@param component`.stateMap[`@param entity`].set with the result of hookstate(createInitialComponentValue(`@param entity`, `@param component`)) as arguments when `@param component`.stateMap[`@param entity`] is falsy',
      () => {}
    )
    it.todo(
      '.. should call bitECS.addComponent with (HyperFlux.store, `@param component`, `@param entity`, false) as arguments',
      () => {}
    )
  })
  it.todo(
    'should call `@param component`.onSet with (entity, component.stateMap[entity]!, args) as arguments',
    () => {}
  )
  // @todo Missing Statements after the line that calls LayerFunctions.propagateLayer
}) //:: setComponent

describe('removeComponent', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  /** @section ECS Layers specific tests */
  describe('for every (layer,entity) pair returned by LayerFunctions.getLayerRelationsEntities(`@param entity`)', () => {
    it('.. should not do anything if LayerFunctions.shouldPropagate(entityLayer, layer) is falsy', () => {
      const entityLayer = Layers.Simulation
      const component = defineComponent({ name: 'SomeTestComponent' })
      const testEntity = createEntity(entityLayer)
      setComponent(testEntity, component)
      const list = [] as Entity[]
      for (const relation of LayerFunctions.getLayerRelationsEntities(testEntity)!) list.push(relation[1])
      // Run and Check the result
      removeComponent(testEntity, component)
      for (const linkedEntity of list) expect(hasComponent(linkedEntity, component)).toBeTruthy() // @note Only for clarity of intention. List should be empty
    })

    it('.. should remove `@param component` from the linkedEntity returned by LayerFunctions.getLayerRelationsEntities', () => {
      const entityLayer = Layers.Authoring
      const component = defineComponent({ name: 'SomeTestComponent' })
      const testEntity = createEntity(entityLayer)
      setComponent(testEntity, component)
      const list = [] as Entity[]
      for (const relation of LayerFunctions.getLayerRelationsEntities(testEntity)!) list.push(relation[1])
      // Run and Check the result
      removeComponent(testEntity, component)
      for (const linkedEntity of list) expect(hasComponent(linkedEntity, component)).toBeFalsy()
    })
  })

  /** @section Other tests for Coverage */
  it.todo('should not do anything if `@param entity` does not have the given `@param component`', () => {})
  it.todo(
    'should call `@param component` onRemove with `@param entity` and `component.stateMap[entity])` as arguments',
    () => {}
  )
  it.todo(
    'should call bitECS.removeComponent with `(HyperFlux.store, component, entity, false)` as arguments',
    () => {}
  )
  it.todo('should call `@param component`.reactorMap.get with `@param entity` as its argument', () => {})
  it.todo('should call `@param component`.reactorMap.delete with `@param entity` as its argument', () => {})
  it.todo(
    'should call root.stop from the result of @param component`.reactorMap.get when root.isRunning is truthy',
    () => {}
  )
  it.todo('should set `@param component`.stateMap[`@param entity`] to none by calling its .set method', () => {})
}) //:: removeComponent

describe('LayerComponents', () => {
  // This array of Components is used for propagation logic upon setting, and for querying
  it('should contain the expected number of components', () => {
    const Expected = Object.entries(Layers).length
    const result = LayerComponents.length
    expect(result).toBe(Expected)
  })

  it('should contain a list of valid Components', () => {
    for (const component of LayerComponents) {
      expect(component?.isComponent).toBeTruthy()
      expect(component?.name).not.toBeFalsy()
      expect(component?.name.endsWith('Component'))
    }
  })

  it('should contain a Component for every LayerID defined by the `Layers` object', () => {
    const ExpectedList = Object.values(Layers)
    for (const layerID of ExpectedList) expect(LayerComponents[layerID]).toBeTruthy()
  })

  it('should not contain duplicate entries', () => {
    const ExpectedList = Object.values(Layers)
    // @note
    // This duplication check assumes that entries of the Layers object are in order by their LayerID
    // and that their value matches their position on the array.
    // eg: Layers[ 0] ===  0 as LayerID
    //   : Layers[ 1] ===  1 as LayerID
    //   : Layers[42] === 42 as LayerID
    for (let id = 0; id < ExpectedList.length; ++id) {
      if ((id as LayerID) === ExpectedList[id]) continue
      for (const layerID of ExpectedList) expect(ExpectedList[id]).not.toBe(layerID)
    }
  })

  describe('*LayerComponent', () => {
    beforeEach(() => {
      createEngine()
    })

    afterEach(() => {
      destroyEngine()
    })

    describe('name', () => {
      const layerNameSuffix = LayerComponent.name

      it('should have the expected value', () => {
        for (const [name, id] of Object.entries(Layers)) {
          const result = LayerComponents[id].name
          expect(result).toBeTruthy()
          expect(result.endsWith(layerNameSuffix)).toBeTruthy()
          expect(result).toBe(name + layerNameSuffix)
        }
      })

      it('should respect the naming convention for Components', () => {
        for (const id of Object.values(Layers)) {
          const result = LayerComponents[id].name
          expect(result).toBeTruthy()
          expect(result.endsWith('Component')).toBeTruthy()
        }
      })
    }) //:: name

    describe('onSet', () => {
      describe("for every entity,relation pair returned by LayerFunctions.getLayerRelationsTypes for this component's layer ..", () => {
        it('.. should not do anything for this pair if the relation is not LayerRelationTypes.Propagate', () => {
          const allEntities = defineQuery([])
          const before1 = allEntities().length
          expect(before1).toBe(0)
          const layer = Layers.Simulation
          const testEntity = createEntity(layer)
          // Run and Check the result
          LayerComponents[layer].onSet(testEntity, {} as any)
          const result = allEntities().length
          expect(result).toBe(1)
        })

        describe('.. when the relation is LayerRelationTypes.Propagate ...', () => {
          it("... should create a new entity on this pair's layer", () => {
            const allEntities = defineQuery([])
            const before1 = allEntities().length
            expect(before1).toBe(0)
            const layer = Layers.Authoring
            const testEntity = createEntity(layer)
            // Run and Check the result
            setComponent(testEntity, LayerComponents[layer])
            const result = allEntities().length
            expect(result).toBe(2)
          })

          it("... should set the relations on the LayerComponent of this Layer to this pair's entity", () => {
            const allEntities = defineQuery([])
            expect(allEntities().length).toBe(0)
            const layer = Layers.Authoring
            const testEntity = createEntity(layer)
            // Run and Check the result
            setComponent(testEntity, LayerComponents[layer])
            const linkedLayer = LayerFunctions.getLayerRelationsTypes(layer)[0][0]
            const linkedEntity = allEntities().at(-1)!
            const result = getComponent(testEntity, LayerComponents[layer]).relations[linkedLayer]
            expect(allEntities().length).toBe(2)
            expect(result).toBe(linkedEntity)
          })

          it('... should set [linkedLayer].refs[linkedEntity] to `@param entity`', () => {
            const allEntities = defineQuery([])
            expect(allEntities().length).toBe(0)
            const layer = Layers.Authoring
            const testEntity = createEntity(layer)
            // Run and Check the result
            setComponent(testEntity, LayerComponents[layer])
            const linkedLayer = LayerFunctions.getLayerRelationsTypes(layer)[0][0]
            const linkedEntity = allEntities().at(-1)!
            const result = LayerComponents[linkedLayer].refs[linkedEntity]
            expect(allEntities().length).toBe(2)
            expect(result).toBe(testEntity)
          })
        })
      })
    }) //:: onSet

    describe('onRemove', () => {
      describe("for every entity,relation pair returned by LayerFunctions.getLayerRelationsTypes for this component's layer ..", () => {
        /** @todo */
        it.todo('.. should not do anything for this pair if the relation is not LayerRelationTypes.Propagate', () => {})
        it.todo(
          '.. should call removeEntity on the entity stored at getComponent(entity, LayerComponents[layer]).relations[linkedLayer]',
          () => {}
        )
        it.todo('.. should delete the LayerComponents[linkedLayer].refs[relation] array entry', () => {})
      })
    }) //:: onRemove
  }) //:: *LayerComponent
}) //:: LayerComponents

describe('LayerComponent', () => {
  beforeEach(() => {
    createEngine()
  })

  afterEach(() => {
    destroyEngine()
  })

  describe('name', () => {
    it('should have the expected value', () => {
      const Expected = 'LayerComponent'
      const result = LayerComponent.name
      expect(result).toBe(Expected)
    })

    it('should respect the naming convention for Components', () => {
      const result = LayerComponent.name
      expect(result).toBeTruthy()
      expect(result.endsWith('Component')).toBeTruthy()
    })
  }) //:: name

  describe('onSet', () => {
    it('should set the value of LayerComponent.layer for `@param entity` to the value of `@param layer`', () => {
      const Expected = Layers.Simulation
      const Initial = 42 as LayerID

      const layer = Expected
      const testEntity = createEntity(layer)
      LayerComponent.layer[testEntity] = Initial
      // Run and Check the result
      LayerComponent.onSet(testEntity, {} as any, layer)
      const result = LayerComponent.layer[testEntity]
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })

    it('should set the LayerComponents with `@param layer` id from the LayerComponents array into the entity', () => {
      const layer = Layers.Simulation
      const testEntity = createEntity(layer)
      const component = LayerComponents[layer]
      removeComponent(testEntity, component) // Manually remove the component to ensure the code adds it back as expected  (createEntity already added it)
      // Run and Check the result
      LayerComponent.onSet(testEntity, {} as any, layer)
      const result = hasComponent(testEntity, component)
      expect(result).toBeTruthy()
    })
  }) //:: onSet

  describe('get', () => {
    it('should return the `@param entity` entry of the LayerComponent.layer array/list as a LayerID type', () => {
      const Expected = 255 as LayerID
      const Initial = Layers.Simulation

      const layer = Initial
      const testEntity = createEntity(layer)
      // Run and Check the result
      LayerComponent.layer[testEntity] = Expected // @note Temporary fake layer. Needs cleanup at the end of the test.
      const result = LayerComponent.get(testEntity)
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
      // Cleanup after running
      LayerComponent.layer[testEntity] = Initial // Remove the fake layer from the list. Avoids errors on `destroyEngine`
    })
  }) //:: get

  describe('onRemove', () => {
    it('should remove the LayerComponent returned by LayerFunctions.getLayerComponent for the `@param entity`', () => {
      const layer = Layers.Simulation
      const testEntity = createEntity(layer)
      const component = LayerComponents[layer]
      // Run and Check the result
      // LayerComponent.onRemove(testEntity, {} as any)
      expect(hasComponent(testEntity, component)).not.toBeFalsy() // invert
    })

    it('should set the `@param entity` entry of the LayerComponent.layer array/list to 0', () => {
      const Expected = Object.values(Layers)[0]
      const Initial = Object.values(Layers)[1]

      const layer = Initial
      const testEntity = createEntity(layer)
      setComponent(testEntity, TestComponent)
      LayerComponent.layer[testEntity] = Initial // Temporary fake layer. Should be replaced by the function
      // Run and Check the result
      LayerComponent.onRemove(testEntity, {} as any)
      const result = LayerComponent.layer[testEntity]
      expect(result).not.toBe(Initial)
      expect(result).toBe(Expected)
    })
  }) //:: onRemove

  describe('hasUpstreamEntity', () => {
    it('should return false if LayerComponent.get(entity) is not Layers.Simulation', () => {
      const Expected = false

      const layer = Layers.Authoring
      const testEntity = createEntity(layer)
      // Run and Check the result
      const result = LayerComponent.hasUpstreamEntity(testEntity)
      expect(result).toBe(Expected)
    })

    describe('when LayerComponent.get(entity) is Layers.Simulation ..', () => {
      it('.. should return false if LayerComponents[Layers.Simulation].refs[entity] is undefined', () => {
        const Expected = false
        // Reset data
        LayerComponents[Layers.Simulation].refs = {}

        const layer = Layers.Simulation
        const testEntity = createEntity(layer)
        // Run and Check the result
        const result = LayerComponent.hasUpstreamEntity(testEntity)
        expect(result).toBe(Expected)
      })

      it('.. should return false if LayerComponents[Layers.Simulation].refs[entity] is UndefinedEntity', () => {
        const Expected = false

        const layer = Layers.Simulation
        const ref = UndefinedEntity
        const testEntity = createEntity(layer)
        LayerComponents[Layers.Simulation].refs[testEntity] = ref
        // Run and Check the result
        const result = LayerComponent.hasUpstreamEntity(testEntity)
        expect(result).toBe(Expected)
      })

      it('.. should return false if entityExists(LayerComponents[Layers.Simulation].refs[entity]) returns a falsy value', () => {
        const Expected = false

        const layer = Layers.Simulation
        const testEntity = createEntity(layer)
        const fakeEntity = Number.MAX_SAFE_INTEGER as Entity
        LayerComponents[Layers.Simulation].refs[testEntity] = fakeEntity
        // Run and Check the result
        const result = LayerComponent.hasUpstreamEntity(testEntity)
        expect(result).toBe(Expected)
      })

      it('.. should return true if LayerComponents[Layers.Simulation].refs[entity] is a valid entity that is considered to exist', () => {
        const Expected = true

        const layer = Layers.Simulation
        const testEntity = createEntity(layer)
        const otherEntity = createEntity()
        LayerComponents[Layers.Simulation].refs[testEntity] = otherEntity
        // Run and Check the result
        const result = LayerComponent.hasUpstreamEntity(testEntity)
        expect(result).toBe(Expected)
      })
    })
  }) //:: hasUpstreamEntity
}) //:: LayerComponent

describe('Queries', () => {
  // @todo After the refactor is merged
  describe('defineQuery', () => {}) //:: defineQuery
  describe('useQuery', () => {}) //:: useQuery
  // @note The rest of the QueryFunctions file is not affected by the Layers changes
}) //:: Queries
