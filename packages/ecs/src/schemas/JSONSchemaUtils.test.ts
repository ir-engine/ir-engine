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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createEntity, removeEntity } from '../ComponentFunctions'
import { createEngine, destroyEngine } from '../Engine'
import { Entity, UndefinedEntity } from '../Entity'
import { Kind, NonSerializable, Schema, TArraySchema, TEnumSchema } from './JSONSchemaTypes'
import {
  CheckSchemaValue,
  CloneSerializable,
  CreateSchemaValue,
  DeserializeSchemaValue,
  flattenSchema,
  GenerateJSONSchema,
  HasRequiredSchema,
  HasRequiredSchemaValues,
  HasSchemaDeserializers,
  HasSchemaValidators,
  HasValidSchemaValues,
  IsSingleValueSchema,
  JSONSchema,
  JSONSchemaUtilsFunctions,
  requiresDeserialization,
  SerializeSchema
} from './JSONSchemaUtils'
import { S } from './JSONSchemas'

/**
 * @description Returns an object nested to `@param depth` levels of depth.
 * Adds the given `@param value` to each level of the object with fieldname `properties`
 * */
export function createDeeplyNestedSchemaObject<T extends object>(depth: number, value?: T): T {
  /* @todo Move out of this file into tests/utils */
  const result = { properties: value } as T
  for (let level = 0; level < depth; ++level) {
    let current = result
    for (let field = 0; field <= level; ++field) {
      current[field] = current[field] || {}
      current = current[field]
    }
    current[Kind] = 'Object'
    current['options'] = { deserialize: undefined }
    current['properties'] = value
  }
  return result
}

describe('DeserializeSchemaValue', () => {
  let testEntity = UndefinedEntity

  beforeEach(() => {
    createEngine()
    testEntity = createEntity()
  })

  afterEach(() => {
    removeEntity(testEntity)
    destroyEngine()
  })

  it('should return the result of `@param schema.options.deserialize` with (`@param curr`, `@param value`) as args when `@param value` is not null or undefined, and deserialize is truthy', () => {
    const Expected = 42

    const schema = { options: { deserialize: (_, __) => Expected } } as Schema
    const curr = {}
    const value = {}

    const result = DeserializeSchemaValue(testEntity, schema, curr, value)

    expect(result).toBe(Expected)
  })

  describe('case: Kind.Any', () => {
    const TestSchemaKind = 'Any'

    it('should return `@param value` as is for null value', () => {
      const Expected = null

      const schema = { [Kind]: TestSchemaKind } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return `@param value` as is for undefined value', () => {
      const Expected = undefined

      const schema = { [Kind]: TestSchemaKind } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return `@param value` as is for number value', () => {
      const Expected = 42

      const schema = { [Kind]: TestSchemaKind } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return `@param value` as is for string value', () => {
      const Expected = 'test string'

      const schema = { [Kind]: TestSchemaKind } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return `@param value` as is for boolean value', () => {
      const Expected = true

      const schema = { [Kind]: TestSchemaKind } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return `@param value` as is for object value', () => {
      const Expected = { test: 'value', nested: { prop: 42 } }

      const schema = { [Kind]: TestSchemaKind } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toEqual(Expected)
    })

    it('should return `@param value` as is for array value', () => {
      const Expected = [1, 'string', true, { prop: 'value' }]

      const schema = { [Kind]: TestSchemaKind } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toEqual(Expected)
    })

    it('should respect custom deserializer if provided', () => {
      const CustomValue = 'custom deserialized value'
      const schema = {
        [Kind]: TestSchemaKind,
        static: {},
        options: { deserialize: () => CustomValue }
      } as Schema
      const curr = {}
      const value = 'original value'

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(CustomValue)
    })
  })

  describe('case: Kind.Number', () => {
    const TestSchemaKind = 'Number'

    it('should return `@param value` when it is null', () => {
      const Expected = null

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it("should return undefined when typeof `@param value` is not 'number'", () => {
      const Expected = undefined

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = false

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it("should return `@param value` when its typeof is 'number'", () => {
      const Expected = 42

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })
  }) //:: Kind.Number

  describe('case: Kind.Bool', () => {
    const TestSchemaKind = 'Bool'
    const TestValueTypeof = 'boolean'

    it('should return `@param value` when it is null', () => {
      const Expected = null

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it("should return undefined when typeof `@param value` is not 'boolean'", () => {
      const Expected = undefined

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = 'IncorrectValue'

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it("should return `@param value` when its typeof is 'boolean'", () => {
      const Expected = false

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })
  }) //:: Kind.Bool

  describe('case: Kind.String', () => {
    const TestSchemaKind = 'String'
    const TestValueTypeof = 'string'
    const StringProtoValue = '__proto__'

    it('should return `@param value` when it is null', () => {
      const Expected = null

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it("should return undefined when typeof `@param value` is not 'string'", () => {
      const Expected = undefined

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = false

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it("should return undefined when `@param value` is '__proto__'", () => {
      const Expected = undefined

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = '__proto__'

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it("should return `@param value` when it is not null/undefined, its typeof is 'string' and its value is not '__proto__'", () => {
      const Expected = 'SomeTestString'

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })
  }) //:: Kind.String

  describe('case: Kind.Enum', () => {
    const TestSchemaKind = 'Enum'

    it('should return `@param value` when it is null', () => {
      const Expected = null

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it("should return undefined when `@param value` is not contained in the enum's schema", () => {
      const Expected = undefined

      const properties = {} as TEnumSchema<Record<string, string | number>>['properties']
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const value = 42

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it("should return `@param value` when its value is contained in the enum's schema", () => {
      const Expected = 42

      const properties = { one: 1, two: Expected } as TEnumSchema<Record<string, string | number>>['properties']
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })
  }) //:: Kind.Enum

  describe('case: Kind.Literal', () => {
    const TestSchemaKind = 'Literal'

    it('should return `@param value` when it is null', () => {
      const Expected = null

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return undefined when `@param value` is not equal to `@param schema`.properties', () => {
      const Expected = undefined

      const properties = 21
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const value = 42

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return `@param value` when its value is equal to `@param schema`.properties', () => {
      const Expected = 42

      const properties = Expected
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const value = properties

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })
  }) //:: Kind.Literal

  describe('case: Kind.Array', () => {
    const TestSchemaKind = 'Array'

    it('should return `@param value` when it is null', () => {
      const Expected = null

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return undefined when Array.isArray( `@param value` ) is falsy', () => {
      const Expected = undefined

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = 42

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should add default values to `@param curr` when its .length is less than `@param value`.length', () => {
      const Expected = [0, 0, 0, 0, 0]

      const options = { deserialize: undefined }
      const properties = { [Kind]: 'Number' } as TArraySchema<Schema>['properties']
      const schema = { [Kind]: TestSchemaKind, options: options, properties: properties } as Schema
      const curr = []
      const invalid = [
        { [Kind]: 'Null', properties: null, options: options } as Schema,
        { [Kind]: 'Undefined', properties: undefined, options: options } as Schema
      ]
      const valid = [
        { [Kind]: 'Number', properties: 42, options: options } as Schema,
        { [Kind]: 'String', properties: 'someString', options: options } as Schema,
        { [Kind]: 'Bool', properties: false, options: options } as Schema
      ]
      const value = [40, 41, 42, 43, 44]

      DeserializeSchemaValue(testEntity, schema, curr, value)
      const result = curr

      expect(result.length).toEqual(Expected.length)
      expect(result).toEqual(Expected)
    })

    it('should return a new array based on deserializing every entry of `@param value` and ignoring any of the entries that are not valid values', () => {
      const Expected = [40, 41, 42, 43, 44]

      const options = { deserialize: undefined }
      const properties = { [Kind]: 'Number' } as TArraySchema<Schema>['properties']
      const schema = { [Kind]: TestSchemaKind, options: options, properties: properties } as Schema
      const curr = [1, 2, 3, 4, 5]
      const value = [...Expected, undefined, null]

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)!

      expect(result.length).toEqual(Expected.length)
      expect(result).toEqual(Expected)
    })

    it('should return `@param curr` if `@param value` is an array and an error is thrown while deserializing its entries', () => {
      const Expected = [40, 41, 42, 43, 44]

      const options = { deserialize: undefined }
      const properties = undefined // This makes `value.map` throw an error and trigger the `catch(e) return curr` branch
      const schema = { [Kind]: TestSchemaKind, options: options, properties: properties } as Schema
      const curr = Expected
      const value = [0, 1, 2, 3, 4]

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)!

      expect(result).toBe(Expected)
    })

    it('should return a new array with the deserialized values of `@param value`, if `@param curr` is not an array', () => {
      const Expected = [40, 41, 42, 43, 44]

      const properties = { [Kind]: 'Number' } as TArraySchema<Schema>['properties']
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema

      // This occurs in the case that the array is optional
      const curr = null
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)!

      expect(result).toEqual(Expected)
    })
  }) //:: Kind.Array

  describe('case: Kind.Tuple', () => {
    const TestSchemaKind = 'Tuple'

    it('should return `@param value` when it is null', () => {
      const Expected = null

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return undefined when Array.isArray( `@param value` ) is falsy', () => {
      const Expected = undefined

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = 42

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return a new tuple array with the deserialized values of `@param value`, and replacing each nullish entry with the respective entry from `@param curr`', () => {
      const Expected = [40, '41_String', 42, '43_String', false]

      const properties = [
        { [Kind]: 'Number' } as Schema,
        { [Kind]: 'String' } as Schema,
        { [Kind]: 'Number' } as Schema,
        { [Kind]: 'String' } as Schema,
        { [Kind]: 'Bool' } as Schema
      ]
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = [0, Expected[1], 2, Expected[3], true]
      const value = [Expected[0], undefined, Expected[2], null, Expected[4]]

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toEqual(Expected)
    })
  }) //:: Kind.Tuple

  describe('case: Kind.Object', () => {
    const TestSchemaKind = 'Object'
    const TestValueTypeof = 'object'

    it('should return `@param value` when it is null', () => {
      const Expected = null

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it("should return undefined if typeof `@param value` when is not 'object'", () => {
      const Expected = undefined

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = 'IncorrectValue'

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should ignore every key of `@param value` (continue) that is not described by `@param schema`.properties', () => {
      const Expected = { valid1: 1, valid2: true, valid3: 'String' }

      const properties = {
        valid1: { [Kind]: 'Number', options: { deserialize: undefined } } as Schema,
        valid2: { [Kind]: 'Bool', options: { deserialize: undefined } } as Schema,
        valid3: { [Kind]: 'String', options: { deserialize: undefined } } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const value = { valid1: 1, valid2: true, valid3: 'String', ignore: 'IgnoredField' }

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toEqual(Expected)
    })

    it('should add the respective field of `@param curr` to the result if that same field at `@param value` represents an invalid value', () => {
      const Expected = { valid1: 1, valid2: true, valid3: 'ValidString', missing: 'MissingString' }

      const properties = {
        valid1: { [Kind]: 'Number', options: { deserialize: undefined } } as Schema,
        valid2: { [Kind]: 'Bool', options: { deserialize: undefined } } as Schema,
        valid3: { [Kind]: 'String', options: { deserialize: undefined } } as Schema,
        missing: { [Kind]: 'String', options: { deserialize: undefined } } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = { missing: Expected.missing }
      const value = {
        valid1: Expected.valid1,
        valid2: Expected.valid2,
        valid3: Expected.valid3,
        missing: undefined,
        ignore: 'IgnoredField'
      } as any

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toEqual(Expected)
    })

    it('should return a new object that contains every valid field of `@param value` deserialized', () => {
      const Expected = { valid1: 1, valid2: true, valid3: 'ValidString' }

      const properties = {
        valid1: { [Kind]: 'Number', options: { deserialize: undefined } } as Schema,
        valid2: { [Kind]: 'Bool', options: { deserialize: undefined } } as Schema,
        valid3: { [Kind]: 'String', options: { deserialize: undefined } } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const value = {
        valid1: Expected.valid1,
        valid2: Expected.valid2,
        valid3: Expected.valid3,
        invalid1: undefined,
        invalid2: null
      }

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toEqual(Expected)
    })

    it('should not add any field of `@param value` to the result when deserializing it results in an undefined value', () => {
      const Expected = { valid1: 1, valid2: true }

      const properties = {
        valid1: { [Kind]: 'Number', options: { deserialize: undefined } } as Schema,
        valid2: { [Kind]: 'Bool', options: { deserialize: undefined } } as Schema,
        valid3: { [Kind]: 'String', options: { deserialize: undefined } } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const invalid = 42
      const value = { valid1: Expected.valid1, valid2: Expected.valid2, valid3: invalid }

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toEqual(Expected)
    })
  }) //:: Kind.Object

  describe('case: Kind.Class', () => {
    const TestSchemaKind = 'Class'

    it('should return `@param value` when it is null', () => {
      const Expected = null

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should return `@param value` when it is undefined', () => {
      const Expected = undefined

      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })

    it('should mutate every `@param value` field to its deserialized value when value[key] is a valid value', () => {
      const Expected = { test: { one: 4, two: 5 } }

      const properties = {
        test: {
          [Kind]: 'Object',
          options: { deserialize: undefined },
          properties: {
            one: { [Kind]: 'Number', options: { deserialize: undefined } } as Schema,
            two: { [Kind]: 'Number', options: { deserialize: undefined } } as Schema
          }
        } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = { test: { one: 21, two: 22 } }
      const value = { test: { one: 4 as unknown, two: 5 as unknown } }

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(value)
      expect(result).toEqual(Expected)
    })

    it('should mutate every `@param value` field to its respective curr[key] when value[key] is an invalid value', () => {
      const Expected = { test: 42 }

      const properties = {
        test: { [Kind]: 'Number', options: { deserialize: undefined } } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = { test: Expected.test }
      const value = { test: undefined } as any

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(value)
      expect(result).toEqual(Expected)
    })

    it('should return `@param value`', () => {
      const Expected = { test: 42 }

      const properties = {
        test: { [Kind]: 'Number', options: { deserialize: undefined } } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })
  }) //:: Kind.Class

  describe.each(['Required', 'Proxy', 'NonSerialized', 'Partial'])('case: Kind.%s', (kind) => {
    const TestSchemaKind = kind

    it('should call DeserializeSchemaValue by passing the same arguments and `@param schema`.properties as the schema parameter value', () => {
      const Expected = 42

      const properties = { [Kind]: 'Number', options: { deserialize: undefined } } as Schema
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined }, properties: properties } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })
  }) //:: [Kind.Required, Kind.Proxy, Kind.NonSerialized, Kind.Partial]

  describe('case: Kind -> default', () => {
    const TestSchemaKind = 'UnknownKind'

    it('should return `@param value` for any other Kind', () => {
      const Expected = undefined

      // @ts-expect-error Coerce an invalid Kinds string into the Kind sympol field
      const schema = { [Kind]: TestSchemaKind, options: { deserialize: undefined } } as Schema
      const curr = {}
      const value = Expected

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(Expected)
    })
  }) //:: Kind -> default

  describe('case: Kind.Union', () => {
    it('should return undefined when value is null or undefined', () => {
      const schema = {
        [Kind]: 'Union',
        properties: [{ [Kind]: 'Number' } as Schema, { [Kind]: 'String' } as Schema]
      } as Schema
      const curr = {}
      const value = null

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(null)
    })

    it('should return undefined when properties array is empty', () => {
      const schema = {
        [Kind]: 'Union',
        properties: []
      } as Schema
      const curr = {}
      const value = 42

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(undefined)
    })

    it('should deserialize using the first matching schema in the Union array', () => {
      const schema = {
        [Kind]: 'Union',
        properties: [{ [Kind]: 'String' } as Schema, { [Kind]: 'Number' } as Schema]
      } as Schema
      const curr = {}
      const value = 42

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(42)
    })

    it('should return undefined if no schema in the Union array matches', () => {
      const schema = {
        [Kind]: 'Union',
        properties: [{ [Kind]: 'String' } as Schema, { [Kind]: 'Bool' } as Schema]
      } as Schema
      const curr = {}
      const value = 42

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(undefined)
    })

    it('should use custom deserializers in Union schemas if available', () => {
      const customValue = 'custom value'
      const schema = {
        [Kind]: 'Union',
        properties: [
          {
            [Kind]: 'Number',
            static: 0,
            options: { deserialize: () => customValue }
          } as Schema,
          { [Kind]: 'String', static: '' } as Schema
        ]
      } as Schema
      const curr = {}
      const value = 42

      const result = DeserializeSchemaValue(testEntity, schema, curr, value)

      expect(result).toBe(customValue)
    })

    it('should correctly deserialize objects with different shapes in a union', () => {
      // Create two different object schemas
      const objectSchema1 = {
        [Kind]: 'Object',
        static: { type: 'type1', value: 0 },
        properties: {
          type: { [Kind]: 'Literal', static: 'type1', properties: 'type1' } as Schema,
          value: { [Kind]: 'Number', static: 0 } as Schema
        }
      } as Schema

      const objectSchema2 = {
        [Kind]: 'Object',
        static: { type: 'type2', name: '' },
        properties: {
          type: { [Kind]: 'Literal', static: 'type2', properties: 'type2' } as Schema,
          name: { [Kind]: 'String', static: '' } as Schema
        }
      } as Schema

      const schema = {
        [Kind]: 'Union',
        static: { type: 'type1', value: 0 },
        properties: [objectSchema1, objectSchema2]
      } as Schema

      // Test with first object shape
      const value1 = { type: 'type1', value: 42 }
      const curr1 = {}
      const result1 = DeserializeSchemaValue(testEntity, schema, curr1, value1)
      expect(result1).toEqual({ type: 'type1', value: 42 })

      // Test with second object shape
      const value2 = { type: 'type2', name: 'test' }
      const curr2 = {}
      const result2 = DeserializeSchemaValue(testEntity, schema, curr2, value2)
      expect(result2).toEqual({ type: 'type2', name: 'test' })
    })

    it('should correctly identify the right schema based on string literal discriminators', () => {
      // Create schemas with string literal discriminators
      const schema1 = {
        [Kind]: 'Object',
        static: { kind: 'circle', radius: 0 },
        properties: {
          kind: { [Kind]: 'Literal', static: 'circle', properties: 'circle' } as Schema,
          radius: { [Kind]: 'Number', static: 0 } as Schema
        }
      } as Schema

      const schema2 = {
        [Kind]: 'Object',
        static: { kind: 'rectangle', width: 0, height: 0 },
        properties: {
          kind: { [Kind]: 'Literal', static: 'rectangle', properties: 'rectangle' } as Schema,
          width: { [Kind]: 'Number', static: 0 } as Schema,
          height: { [Kind]: 'Number', static: 0 } as Schema
        }
      } as Schema

      const unionSchema = {
        [Kind]: 'Union',
        static: { kind: 'circle', radius: 0 },
        properties: [schema1, schema2]
      } as Schema

      // Test with circle shape
      const circle = { kind: 'circle', radius: 5 }
      const currCircle = {}
      const resultCircle = DeserializeSchemaValue(testEntity, unionSchema, currCircle, circle)
      expect(resultCircle).toEqual({ kind: 'circle', radius: 5 })

      // Test with rectangle shape
      const rectangle = { kind: 'rectangle', width: 10, height: 20 }
      const currRect = {}
      const resultRect = DeserializeSchemaValue(testEntity, unionSchema, currRect, rectangle)
      expect(resultRect).toEqual({ kind: 'rectangle', width: 10, height: 20 })

      // Test with invalid shape (should return undefined)
      const invalid = { kind: 'triangle', sides: 3 }
      const currInvalid = {}
      const resultInvalid = DeserializeSchemaValue(testEntity, unionSchema, currInvalid, invalid)
      expect(resultInvalid).toBe(undefined)
    })

    it('should handle nested unions correctly', () => {
      // Create a nested union schema
      const numberSchema = { [Kind]: 'Number', static: 0 } as Schema
      const stringSchema = { [Kind]: 'String', static: '' } as Schema

      const innerUnionSchema = {
        [Kind]: 'Union',
        static: 0,
        properties: [numberSchema, stringSchema]
      } as Schema

      const objectWithUnionSchema = {
        [Kind]: 'Object',
        static: { type: 'complex', value: 0 },
        properties: {
          type: { [Kind]: 'Literal', static: 'complex', properties: 'complex' } as Schema,
          value: innerUnionSchema
        }
      } as Schema

      const simpleObjectSchema = {
        [Kind]: 'Object',
        static: { type: 'simple', value: false },
        properties: {
          type: { [Kind]: 'Literal', static: 'simple', properties: 'simple' } as Schema,
          value: { [Kind]: 'Bool', static: false } as Schema
        }
      } as Schema

      const outerUnionSchema = {
        [Kind]: 'Union',
        static: { type: 'complex', value: 0 },
        properties: [objectWithUnionSchema, simpleObjectSchema]
      } as Schema

      // Test with complex object with number
      const complexNumber = { type: 'complex', value: 42 }
      const currComplexNum = {}
      const resultComplexNum = DeserializeSchemaValue(testEntity, outerUnionSchema, currComplexNum, complexNumber)
      expect(resultComplexNum).toEqual({ type: 'complex', value: 42 })

      // Test with complex object with string
      const complexString = { type: 'complex', value: 'test' }
      const currComplexStr = {}
      const resultComplexStr = DeserializeSchemaValue(testEntity, outerUnionSchema, currComplexStr, complexString)
      expect(resultComplexStr).toEqual({ type: 'complex', value: 'test' })

      // Test with simple object
      const simple = { type: 'simple', value: true }
      const currSimple = {}
      const resultSimple = DeserializeSchemaValue(testEntity, outerUnionSchema, currSimple, simple)
      expect(resultSimple).toEqual({ type: 'simple', value: true })
    })

    it('should handle arrays of union types correctly', () => {
      // Create a simple test case
      const numberSchema = { [Kind]: 'Number', static: 0, options: {} } as Schema
      const stringSchema = { [Kind]: 'String', static: '', options: {} } as Schema

      // Create a union schema
      const unionSchema = {
        [Kind]: 'Union',
        static: 0,
        options: {},
        properties: [numberSchema, stringSchema]
      } as Schema

      // Create an array schema that contains the union schema
      const arraySchema = {
        [Kind]: 'Array',
        static: [],
        options: {},
        properties: unionSchema
      } as Schema

      // Test with an array containing both types
      const value = [42, 'test']
      const curr = []

      // Deserialize the array
      const result = DeserializeSchemaValue(testEntity, arraySchema, curr, value) as any

      // Check that both elements were properly deserialized
      expect(result.length).toBe(2)
      expect(result[0]).toBe(42)
      expect(result[1]).toBe('test')
    })

    it('should handle arrays of union types with existing current state', () => {
      // Create a simple test case
      const numberSchema = { [Kind]: 'Number', static: 0, options: {} } as Schema
      const stringSchema = { [Kind]: 'String', static: '', options: {} } as Schema

      // Create a union schema
      const unionSchema = {
        [Kind]: 'Union',
        static: 0,
        options: {},
        properties: [numberSchema, stringSchema]
      } as Schema

      // Create an array schema that contains the union schema
      const arraySchema = {
        [Kind]: 'Array',
        static: [],
        options: {},
        properties: unionSchema
      } as Schema

      // Test with an array containing both types
      const value = [42, 'test']

      // Current state with existing data (should be replaced)
      const curr = ['old', 'values']

      // Deserialize the array
      const result = DeserializeSchemaValue(testEntity, arraySchema, curr, value) as any

      // Check that both elements were properly deserialized
      expect(result.length).toBe(2)
      expect(result[0]).toBe(42)
      expect(result[1]).toBe('test')
    })

    it('should handle arrays of union types with different matching types for each index', () => {
      // Create schemas for different types
      const numberSchema = { [Kind]: 'Number', static: 0, options: {} } as Schema
      const stringSchema = { [Kind]: 'String', static: '', options: {} } as Schema
      const boolSchema = { [Kind]: 'Bool', static: false, options: {} } as Schema

      // Create a union schema that only accepts numbers and strings
      const unionSchema = {
        [Kind]: 'Union',
        static: 0,
        options: {},
        properties: [numberSchema, stringSchema]
      } as Schema

      // Create an array schema that contains the union schema
      const arraySchema = {
        [Kind]: 'Array',
        static: [],
        options: {},
        properties: unionSchema
      } as Schema

      // Test with an array containing mixed types including invalid ones
      const value = [42, 'test', true, null, undefined, {}, []]

      // Current state (empty array)
      const curr = []

      // Deserialize the array
      const result = DeserializeSchemaValue(testEntity, arraySchema, curr, value) as any

      // Check that only valid elements were properly deserialized (number and string)
      // The boolean, null, undefined, object, and array should be filtered out
      // as they don't match any type in the union
      expect(result.length).toBe(2)
      expect(result[0]).toBe(42)
      expect(result[1]).toBe('test')
    })

    it('should handle arrays of union of multiple different object schemas', () => {
      // Create schemas for different object types
      const userObjectSchema = {
        [Kind]: 'Object',
        static: { type: 'user', name: '', age: 0 },
        options: {},
        properties: {
          type: { [Kind]: 'Literal', static: 'user', properties: 'user', options: {} } as Schema,
          name: { [Kind]: 'String', static: '', options: {} } as Schema,
          age: { [Kind]: 'Number', static: 0, options: {} } as Schema
        }
      } as Schema

      const postObjectSchema = {
        [Kind]: 'Object',
        static: { type: 'post', title: '', content: '' },
        options: {},
        properties: {
          type: { [Kind]: 'Literal', static: 'post', properties: 'post', options: {} } as Schema,
          title: { [Kind]: 'String', static: '', options: {} } as Schema,
          content: { [Kind]: 'String', static: '', options: {} } as Schema
        }
      } as Schema

      const commentObjectSchema = {
        [Kind]: 'Object',
        static: { type: 'comment', text: '', likes: 0 },
        options: {},
        properties: {
          type: { [Kind]: 'Literal', static: 'comment', properties: 'comment', options: {} } as Schema,
          text: { [Kind]: 'String', static: '', options: {} } as Schema,
          likes: { [Kind]: 'Number', static: 0, options: {} } as Schema
        }
      } as Schema

      // Create a union schema that accepts all three object types
      const unionSchema = {
        [Kind]: 'Union',
        static: { type: 'user', name: '', age: 0 },
        options: {},
        properties: [userObjectSchema, postObjectSchema, commentObjectSchema]
      } as Schema

      // Create an array schema that contains the union schema
      const arraySchema = {
        [Kind]: 'Array',
        static: [],
        options: {},
        properties: unionSchema
      } as Schema

      // Test with an array containing mixed object types including invalid ones
      const value = [
        { type: 'user', name: 'John', age: 30 },
        { type: 'post', title: 'Hello World', content: 'This is a post' },
        { type: 'comment', text: 'Great post!', likes: 5 },
        { type: 'invalid', data: 'This should be filtered out' },
        { name: 'Missing type field' },
        null,
        undefined
      ]

      // Current state (empty array)
      const curr = []

      // Deserialize the array
      const result = DeserializeSchemaValue(testEntity, arraySchema, curr, value) as any

      // Check that only valid elements were properly deserialized
      // The invalid objects, null, and undefined should be filtered out
      expect(result.length).toBe(3)

      // Check the user object
      expect(result[0].type).toBe('user')
      expect(result[0].name).toBe('John')
      expect(result[0].age).toBe(30)

      // Check the post object
      expect(result[1].type).toBe('post')
      expect(result[1].title).toBe('Hello World')
      expect(result[1].content).toBe('This is a post')

      // Check the comment object
      expect(result[2].type).toBe('comment')
      expect(result[2].text).toBe('Great post!')
      expect(result[2].likes).toBe(5)
    })
  }) //:: Kind.Union
}) //:: DeserializeSchemaValue

describe('HasSchemaDeserializers', () => {
  const nested = {
    depth: 1_000, // depth=2000 runs in ~200ms
    timeout: 2_000 // waitUntil timeout is 1000ms (default)
  }
  async function checkNestedSchema(schema: Schema, depth = nested.depth, timeout = nested.timeout) {
    return vi.waitUntil(
      () => {
        HasSchemaDeserializers(createDeeplyNestedSchemaObject(depth, schema))
        return true
      },
      { timeout: timeout }
    )
  }

  describe('inputs.invalid', () => {
    it('should not error if `@param schema` is coerced from a type that does not match the Schema interface', () => {
      expect(() => {
        // @ts-expect-error Coerce number into Schema
        HasSchemaDeserializers(42)
      }).not.toThrowError()
      expect(() => {
        // @ts-expect-error Coerce string into Schema
        HasSchemaDeserializers('TestString')
      }).not.toThrowError()
      expect(() => {
        // @ts-expect-error Coerce object into Schema
        HasSchemaDeserializers({ thing: 42 })
      }).not.toThrowError()
      expect(() => {
        // @ts-expect-error Coerce function into Schema
        HasSchemaDeserializers(() => true)
      }).not.toThrowError()
    })
  }) //:: HasSchemaDeserializers.inputs.invalid

  describe('process.recursion', () => {
    it('should not fall into infinite recursion', async () => {
      const emptySchema = {} as Schema
      const validSchema = { options: { deserialize: (_, __) => {} } } as Schema
      await checkNestedSchema(emptySchema)
      await checkNestedSchema(validSchema)
    })
  }) //:: HasSchemaDeserializers.process.recursion

  describe('output.expected', () => {
    it('should return true if the toplevel of the `@param schema` object has a truthy .options?.deserialize field', () => {
      const Expected = true

      const emptySchema = {} as Schema
      const schema = createDeeplyNestedSchemaObject(nested.depth, emptySchema)
      schema.options = { deserialize: (_, __) => {} }

      const result = HasSchemaDeserializers(schema)

      expect(result).toBe(Expected)
    })

    it('should return false if the toplevel of the `@param schema` object has a falsy .options?.deserialize field and has no children', () => {
      const Expected = false

      const schema = { options: { deserialize: undefined } } as Schema

      const result = HasSchemaDeserializers(schema)

      expect(result).toBe(Expected)
    })

    it('should return true if the toplevel of the `@param schema` object has a falsy .options?.deserialize field but has a child where it is truthy', () => {
      const Expected = true

      const child = { testField: { options: { deserialize: (_, __) => {} } } as Schema }
      const schema = { [Kind]: 'Object', options: { deserialize: undefined }, properties: child } as Schema

      const result = HasSchemaDeserializers(schema)

      expect(result).toBe(Expected)
    })

    it('should return true if the toplevel of the `@param schema` object has a falsy .options?.deserialize field, all its children have no such field, but has a deeply nested children where it is truthy', () => {
      const Expected = true

      const deepChild = { testField: { options: { deserialize: (_, __) => {} } } as Schema }
      const child3 = {
        schema: { [Kind]: 'Object', options: { deserialize: undefined }, properties: deepChild } as Schema
      }
      const child2 = { schema: { [Kind]: 'Object', options: { deserialize: undefined }, properties: child3 } as Schema }
      const child1 = { schema: { [Kind]: 'Object', options: { deserialize: undefined }, properties: child2 } as Schema }
      const child0 = { schema: { [Kind]: 'Object', options: { deserialize: undefined }, properties: child1 } as Schema }
      const schema = { [Kind]: 'Object', options: { deserialize: undefined }, properties: child0 } as Schema

      const result = HasSchemaDeserializers(schema)

      expect(result).toBe(Expected)
    })
  }) //:: HasSchemaDeserializers.output.expected
}) //:: HasSchemaDeserializers

describe('HasRequiredSchema', () => {
  it('should return false if `@param schema` has no children and does not have a Kind.Required field', () => {
    const Expected = false

    const schema = { [Kind]: 'Number', properties: undefined } as Schema

    const result = HasRequiredSchema(schema)

    expect(result).toBe(Expected)
  })

  it('should return false if `@param schema` has children, does not have a Kind.Required field and none of its children have it either', () => {
    const Expected = false

    const child = { [Kind]: 'Any', properties: undefined } as Schema
    const children = {
      child1: child,
      child2: child,
      child3: child
    }
    const schema = { [Kind]: 'Object', properties: children } as Schema

    const result = HasRequiredSchema(schema)

    expect(result).toBe(Expected)
  })

  it('should return true if `@param schema` has a Kind.Required field', () => {
    const Expected = true

    const schema = { [Kind]: 'Required', properties: undefined } as Schema

    const result = HasRequiredSchema(schema)

    expect(result).toBe(Expected)
  })

  /** @todo Why is this setup not returning true ?? */
  it('should return true if `@param schema` has children, does not have a Kind.Required field and at least one of its children have a Kind.Required field ', () => {
    const Expected = true

    const child = { [Kind]: 'Any', properties: undefined } as Schema
    const required = { [Kind]: 'Required', properties: child } as Schema
    const children = {
      child1: child,
      child2: required,
      child3: child
    }
    const schema = { [Kind]: 'Object', properties: children } as Schema

    const result = HasRequiredSchema(schema)

    expect(result).toBe(Expected)
  })
}) //:: HasRequiredSchema

describe('HasSchemaValidators', () => {
  it('should return false if `@param schema` has no children and does not have an .options.validate field', () => {
    const Expected = false

    const schema = { [Kind]: 'Number', properties: undefined } as Schema

    const result = HasSchemaValidators(schema)

    expect(result).toBe(Expected)
  })

  it('should return false if `@param schema` has children, does not have an .options.validate field and none of its children have it either', () => {
    const Expected = false

    const child = { [Kind]: 'Any', properties: undefined } as Schema
    const children = {
      child1: child,
      child2: child,
      child3: child
    }
    const schema = { [Kind]: 'Object', properties: children } as Schema

    const result = HasSchemaValidators(schema)

    expect(result).toBe(Expected)
  })

  it('should return true if `@param schema` has an .options.validate field', () => {
    const Expected = true

    const schema = { [Kind]: 'Number', options: { validate: (_, __, ____) => {} }, properties: undefined } as Schema

    const result = HasSchemaValidators(schema)

    expect(result).toBe(Expected)
  })

  it('should return true if `@param schema` has children, does not have an .options.validate field and at least one of its children have an .options.validate field ', () => {
    const Expected = true

    const child = { [Kind]: 'Any', properties: undefined } as Schema
    const validate = { [Kind]: 'Any', options: { validate: (_, __, ____) => {} }, properties: undefined } as Schema
    const children = {
      child1: child,
      child2: validate,
      child3: child
    }
    const schema = { [Kind]: 'Object', properties: children } as Schema

    const result = HasSchemaValidators(schema)

    expect(result).toBe(Expected)
  })
}) //:: HasSchemaValidators

describe('requiresDeserialization', () => {
  it('should return false if `@param schema` has no children and does not have an .options.deserialize field', () => {
    const Expected = false

    const schema = { [Kind]: 'Number', properties: undefined } as Schema

    const result = requiresDeserialization(schema)

    expect(result).toBe(Expected)
  })

  it('should return false if `@param schema` has children, does not have an .options.deserialize field and none of its children have it either', () => {
    const Expected = false

    const child = { [Kind]: 'Any', properties: undefined } as Schema
    const children = {
      child1: child,
      child2: child,
      child3: child
    }
    const schema = { [Kind]: 'Object', properties: children } as Schema

    const result = requiresDeserialization(schema)

    expect(result).toBe(Expected)
  })

  it('should return true if `@param schema` has an .options.deserialize field', () => {
    const Expected = true

    const schema = { [Kind]: 'Number', options: { deserialize: (_, __) => {} }, properties: undefined } as Schema

    const result = requiresDeserialization(schema)

    expect(result).toBe(Expected)
  })

  it('should return true if `@param schema` has children, does not have an .options.deserialize field and at least one of its children have an .options.deserialize field ', () => {
    const Expected = true

    const child = { [Kind]: 'Any', properties: undefined } as Schema
    const validate = { [Kind]: 'Any', options: { deserialize: (_, __) => {} }, properties: undefined } as Schema
    const children = {
      child1: child,
      child2: validate,
      child3: child
    }
    const schema = { [Kind]: 'Object', properties: children } as Schema

    const result = requiresDeserialization(schema)

    expect(result).toBe(Expected)
  })
}) //:: requiresDeserialization

describe('IsSingleValueSchema', () => {
  it('should return false if `@param schema` is falsy', () => {
    const Expected = false

    const schema = undefined

    const result = IsSingleValueSchema(schema)

    expect(result).toBe(Expected)
  })

  it('should return false if `@param schema`[Kind] is falsy', () => {
    const Expected = false

    const schema = {} as Schema

    const result = IsSingleValueSchema(schema)

    expect(result).toBe(Expected)
  })

  describe.each([
    'Null',
    'Undefined',
    'Void',
    'Number',
    'Bool',
    'String',
    'Enum',
    'Literal',
    'Class',
    'Array',
    'Tuple',
    'Func'
  ])('case: Kind.%s', (kind) => {
    it('should return true', () => {
      const Expected = true

      const schema = { [Kind]: kind } as Schema

      const result = IsSingleValueSchema(schema)

      expect(result).toBe(Expected)
    })
  })

  describe.each(['Any', 'Object', 'Record', 'Partial'])('case: Kind.%s', (kind) => {
    it('should return false', () => {
      const Expected = false

      const schema = { [Kind]: kind } as Schema

      const result = IsSingleValueSchema(schema)

      expect(result).toBe(Expected)
    })
  })

  describe('case: Kind.Union', () => {
    const TestSchemaKind = 'Union'

    it('should return false when `@param schema`.properties has no values', () => {
      const Expected = false

      const properties = {} as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = IsSingleValueSchema(schema)

      expect(result).toBe(Expected)
    })

    it('should return false if any of the `@param schema`.properties is not a single value schema', () => {
      const Expected = false

      const properties = [{ [Kind]: 'Number' } as Schema, { [Kind]: 'Object' } as Schema]
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = IsSingleValueSchema(schema)

      expect(result).toBe(Expected)
    })

    it('should return true if `@param schema`.properties has values and all of them are single value schemas', () => {
      const Expected = true

      const properties = [{ [Kind]: 'Number' } as Schema]
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = IsSingleValueSchema(schema)

      expect(result).toBe(Expected)
    })
  }) //:: Kind.Union

  describe.each(['NonSerialized', 'Required', 'Proxy'])('case: Kind.%s', (kind) => {
    it('should return the result of IsSingleValueSchema( `@param schema`.properties )', () => {
      const properties = { [Kind]: kind } as Schema
      const schema = { [Kind]: kind, properties: properties } as Schema
      const Expected = IsSingleValueSchema(schema.properties as Schema)

      const result = IsSingleValueSchema(schema)

      expect(result).toBe(Expected)
    })
  })

  it('should return false if `@param schema`[Kind] is a value that is not mapped', () => {
    const Expected = false

    // @ts-expect-error Coerce an invalid Kinds string into the Kind sympol field
    const schema = { [Kind]: 'IncorrectKind' } as Schema

    const result = IsSingleValueSchema(schema)

    expect(result).toBe(Expected)
  })
}) //:: IsSingleValueSchema

describe('HasRequiredSchemaValues', () => {
  describe.each(['Object', 'Class'])('case: Kind.%s', (kind) => {
    const TestSchemaKind = kind

    it("should call HasRequiredSchemaValues recursively and return [false, 'fieldName'] when one of the fields of `@param schema`.properties or its children does not have a valid value", () => {
      const Expected = [false, 'wrongKey']

      const properties = {
        one: { [Kind]: 'Number' } as Schema,
        two: { [Kind]: 'String' } as Schema,
        container: {
          [Kind]: 'Object',
          properties: {
            wrongKey: { [Kind]: 'Required' } as Schema
          }
        } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = { one: 1, two: 'TWO', container: { wrongKey: undefined } }
      const currentKey = 'TestKey'

      const result = HasRequiredSchemaValues(schema, value, currentKey)

      expect(result).toEqual(Expected)
    })

    it("should return [true, ''] when all fields of `@param schema`.properties and its children have valid values", () => {
      const Expected = [true, '']

      const properties = {
        one: { [Kind]: 'Number' } as Schema,
        two: { [Kind]: 'String' } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = { one: 1, two: 'TWO' }
      const currentKey = 'TestKey'

      const result = HasRequiredSchemaValues(schema, value, currentKey)

      expect(result).toEqual(Expected)
    })
  }) //:: [Kind.Object, Kind.Class]

  describe.each(['Proxy', 'Partial', 'NonSerialized'])('case: Kind.%s', (kind) => {
    const TestSchemaKind = kind

    it('should return the result of calling HasRequiredSchemaValues with (`@param schema`.properties, `@param value`) as arguments', () => {
      const OtherKey = 'other'
      const properties = {
        [Kind]: 'Object',
        properties: {
          one: { [Kind]: 'Number' } as Schema,
          two: { [Kind]: 'String' } as Schema,
          [OtherKey]: { [Kind]: 'Required' } as Schema
        }
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = { one: 1, two: 'TWO', other: undefined }
      const currentKey = 'TestKey'
      const Expected = HasRequiredSchemaValues(schema.properties as Schema, value, currentKey)

      const result = HasRequiredSchemaValues(schema, value, currentKey)

      expect(result).toEqual(Expected)
      expect(result[1]).toBe(OtherKey)
    })
  }) //:: [Kind.Proxy, Kind.Partial, Kind.NonSerialized]

  describe('case: Kind.Required', () => {
    const TestSchemaKind = 'Required'

    it('should return [false, `@param current`] when `@param value` is null', () => {
      const Expected = [false, 'CurrentKey'] as [boolean, string]

      const OtherKey = Expected[1]
      const properties = {
        [Kind]: 'Object',
        properties: {
          one: { [Kind]: 'Number' } as Schema,
          two: { [Kind]: 'String' } as Schema,
          [OtherKey]: { [Kind]: 'Required' } as Schema
        }
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = null
      const currentKey = Expected[1]

      const result = HasRequiredSchemaValues(schema, value, currentKey)

      expect(result).toEqual(Expected)
      expect(result[1]).toBe(OtherKey)
    })

    it('should return [false, `@param current`] when `@param value` is undefined', () => {
      const Expected = [false, 'CurrentKey'] as [boolean, string]

      const OtherKey = Expected[1]
      const properties = {
        [Kind]: 'Object',
        properties: {
          one: { [Kind]: 'Number' } as Schema,
          two: { [Kind]: 'String' } as Schema,
          [OtherKey]: { [Kind]: 'Required' } as Schema
        }
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = undefined
      const currentKey = Expected[1]

      const result = HasRequiredSchemaValues(schema, value, currentKey)

      expect(result).toEqual(Expected)
      expect(result[1]).toBe(OtherKey)
    })

    it('should return [true, `@param current`] when `@param value` is not null or undefined', () => {
      const Expected = [true, 'CurrentKey'] as [boolean, string]

      const OtherKey = Expected[1]
      const properties = {
        [Kind]: 'Object',
        properties: {
          one: { [Kind]: 'Number' } as Schema,
          two: { [Kind]: 'String' } as Schema,
          [OtherKey]: { [Kind]: 'Required' } as Schema
        }
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = { one: 1, two: 'TWO' }
      const currentKey = Expected[1]

      const result = HasRequiredSchemaValues(schema, value, currentKey)

      expect(result).toEqual(Expected)
      expect(result[1]).toBe(OtherKey)
    })
  }) //:: Kind.Required

  describe('case: default', () => {
    const TestSchemaKind = 'UnknownKind' as any

    it("should return [true, ''] when `@param schema`[Kind] is not one of [Kind.Object, Kind.Class, Kind.Proxy, Kind.Partial, Kind.NonSerialized, Kind.Required]", () => {
      const Expected = [true, ''] as [boolean, string]

      const properties = {
        [Kind]: 'Object',
        properties: {
          one: { [Kind]: 'Number' } as Schema,
          two: { [Kind]: 'String' } as Schema,
          otherKey: { [Kind]: 'Required' } as Schema
        }
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = { one: 1, two: 'TWO' }
      const currentKey = 'TestKey'

      const result = HasRequiredSchemaValues(schema, value, currentKey)

      expect(result).toEqual(Expected)
    })
  }) //:: default
}) //:: HasRequiredSchemaValues

describe('HasValidSchemaValues', () => {
  describe.each(['Object', 'Class'])('case: Kind.%s', (kind) => {
    const TestSchemaKind = kind

    it("should call HasValidSchemaValues recursively and return [false, 'fieldName'] when one of the fields of `@param schema`.properties or its children does not have a valid value", () => {
      const Expected = [false, 'wrongKey'] as [boolean, string]

      const properties = {
        one: { [Kind]: 'Number' } as Schema,
        two: { [Kind]: 'String' } as Schema,
        container: {
          [Kind]: 'Object',
          properties: {
            [Expected[1]]: { [Kind]: 'Number', options: { validate: (_, __, ___) => false } } as Schema
          }
        } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = { one: 1, two: 'TWO', container: { [Expected[1]]: 'InvalidNumber' } }
      const prev = { one: 61, two: 'prev_TWO', container: { [Expected[1]]: 'prev_InvalidNumber' } }
      const testEntity = 12345 as Entity
      const currentKey = 'TestKey'

      const result = HasValidSchemaValues(schema, value, prev, testEntity, currentKey)

      expect(result).toEqual(Expected)
    })

    it("should return [true, ''] when all fields of `@param schema`.properties and its children have valid values", () => {
      const Expected = [true, ''] as [boolean, string]

      const properties = {
        one: { [Kind]: 'Number' } as Schema,
        two: { [Kind]: 'String' } as Schema,
        container: {
          [Kind]: 'Object',
          properties: {
            [Expected[1]]: { [Kind]: 'Number' } as Schema
          }
        } as Schema
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = {}
      const prev = {}
      const testEntity = 12345 as Entity
      const currentKey = 'TestKey'

      const result = HasValidSchemaValues(schema, value, prev, testEntity, currentKey)

      expect(result).toEqual(Expected)
    })
  }) //:: [Kind.Object, Kind.Class]

  describe.each(['Proxy', 'Partial', 'NonSerialized', 'Partial'])('case: Kind.%s', (kind) => {
    const TestSchemaKind = kind

    it('should return the result of calling HasValidSchemaValues with (`@param schema`.properties, `@param value`, `@param prev`, `@param entity`) as arguments', () => {
      const Expected = [false, 'wrongKey'] as [boolean, string]

      const properties = {
        [Kind]: 'Object',
        properties: {
          one: { [Kind]: 'Number' } as Schema,
          two: { [Kind]: 'String' } as Schema,
          container: {
            [Kind]: 'Object',
            properties: {
              [Expected[1]]: { [Kind]: 'Number', options: { validate: (_, __, ___) => false } } as Schema
            }
          } as Schema
        }
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = { one: 1, two: 'TWO', container: { [Expected[1]]: 'InvalidNumber' } }
      const prev = { one: 61, two: 'prev_TWO', container: { [Expected[1]]: 'prev_InvalidNumber' } }
      const testEntity = 12345 as Entity
      const currentKey = 'TestKey'

      const result = HasValidSchemaValues(schema, value, prev, testEntity, currentKey)

      expect(result).toEqual(Expected)
    })
  }) //:: [Kind.Proxy, Kind.Partial, Kind.NonSerialized, Kind.Partial]

  describe('case: default', () => {
    const TestSchemaKind = 'UnknownKind' as any

    it("should return [true, ''] when `@param schema`[Kind] is not one of [Kind.Object, Kind.Class, Kind.Proxy, Kind.Partial, Kind.NonSerialized, Kind.Required]", () => {
      const Expected = [true, ''] as [boolean, string]

      const properties = {
        [Kind]: 'Object',
        properties: {
          one: { [Kind]: 'Number' } as Schema,
          two: { [Kind]: 'String' } as Schema,
          container: {
            [Kind]: 'Object',
            properties: {
              [Expected[1]]: { [Kind]: 'Number', options: { validate: (_, __, ___) => false } } as Schema
            }
          } as Schema
        }
      }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema
      const value = { one: 1, two: 'TWO', container: { [Expected[1]]: 'InvalidNumber' } }
      const prev = { one: 61, two: 'prev_TWO', container: { [Expected[1]]: 'prev_InvalidNumber' } }
      const testEntity = 12345 as Entity
      const currentKey = 'TestKey'

      const result = HasValidSchemaValues(schema, value, prev, testEntity, currentKey)

      expect(result).toEqual(Expected)
    })
  }) //:: default
}) //:: HasValidSchemaValues

describe('CreateSchemaValue', () => {
  it('should return a deepcopy of `@param schema`.options.default when it is not a function, options is truthy and options has a field called default', () => {
    const Expected = { one: 41, two: 42 }

    const defaultField = structuredClone(Expected)
    const schema = { options: { default: defaultField } } as Schema
    const testEntity = 12345 as Entity

    const result = CreateSchemaValue(testEntity, schema)

    expect(result).not.toBe(Expected)
    expect(result).toEqual(Expected)
  })

  it('should return the result of `@param schema`.options.default() when it is a function, options is truthy and options has a field called default', () => {
    const Expected = { one: 41, two: 42 }

    const schema = { options: { default: () => Expected } } as Schema
    const testEntity = 12345 as Entity

    const result = CreateSchemaValue(testEntity, schema)

    expect(result).toBe(Expected)
    expect(result).toEqual(Expected)
  })

  it.each([
    [null, 'Null'],
    [undefined, 'Undefined'],
    [undefined, 'Void'],
    [0, 'Number'],
    [false, 'Bool'],
    ['', 'String']
  ])('should return %s when `@param schema`[Kind] is %s', (Expected, kind) => {
    const schema = { [Kind]: kind } as Schema
    const testEntity = 12345 as Entity

    const result = CreateSchemaValue(testEntity, schema)

    expect(result).toBe(Expected)
    expect(result).toEqual(Expected)
  })

  it("should return the first value that can be represented by the `@param schema`.properties enum when schema[Kind] is 'Enum'", () => {
    const Expected = 42

    const kind = 'Enum'
    const properties = { expectedValue: Expected, One: 1, Two: 2 }
    const schema = { [Kind]: kind, properties: properties } as Schema
    const testEntity = 12345 as Entity

    const result = CreateSchemaValue(testEntity, schema)

    expect(result).toBe(Expected)
    expect(result).toEqual(Expected)
  })

  it("should return `@param schema`.properties when schema[Kind] is 'Literal'", () => {
    const Expected = { thing: 42 }

    const kind = 'Literal'
    const properties = Expected
    const schema = { [Kind]: kind, properties: properties } as Schema
    const testEntity = 12345 as Entity

    const result = CreateSchemaValue(testEntity, schema)

    expect(result).toBe(Expected)
    expect(result).toEqual(Expected)
  })

  it.each(['Object', 'Class'])(
    'should create an object as defined by `@schema properties` with all proxies flattened (Kind.Proxy) when `@param schema`[Kind] is Kind.%s',
    (kind) => {
      const Expected = { one: 42, two: 'SomeString' }

      const schema = {
        [Kind]: kind,
        properties: {
          one: {
            [Kind]: 'Proxy',
            options: {
              create: () => {
                return Expected.one
              }
            },
            properties: { [Kind]: 'Number' }
          } as unknown as Schema,
          two: {
            [Kind]: 'Proxy',
            options: {
              create: () => {
                return Expected.two
              }
            },
            properties: { [Kind]: 'String' }
          } as unknown as Schema
        }
      } as Schema
      const testEntity = 12345 as Entity

      const result = CreateSchemaValue(testEntity, schema)

      expect(result).not.toBe(Expected)
      expect(result).toEqual(Expected)
    }
  )

  it.each(['Any', 'Record', 'Partial'])(
    'should return an empty object when `@param schema`[Kind] is Kind.%s',
    (kind) => {
      const Expected = {}

      const schema = { [Kind]: kind } as Schema
      const testEntity = 12345 as Entity

      const result = CreateSchemaValue(testEntity, schema)

      expect(typeof result).toBe(typeof Expected)
      expect(result).toEqual(Expected)
    }
  )

  it.each(['Array', 'Tuple'])('should return an empty array when `@param schema`[Kind] is Kind.%s', (kind) => {
    const Expected = []

    const schema = { [Kind]: kind } as Schema
    const testEntity = 12345 as Entity

    const result = CreateSchemaValue(testEntity, schema)

    expect(Array.isArray(result)).toBeTruthy()
    expect(result).toEqual(Expected)
  })

  it("should return null when `@param schema`[Kind] is 'Union' and the `@param schema`.properties array has no child schemas ", () => {
    const Expected = null

    const kind = 'Union'
    const properties = []
    const schema = { [Kind]: kind, properties: properties } as Schema
    const testEntity = 12345 as Entity

    const result = CreateSchemaValue(testEntity, schema)

    expect(result).toBe(Expected)
    expect(result).toEqual(Expected)
  })

  it("should return the first value representable by `@param schema`.properties when schema[Kind] is 'Union' and the `@param schema`.properties array has at least one child schema", () => {
    const Expected = 0

    const kind = 'Union'
    const properties = [{ [Kind]: 'Number' } as Schema, { [Kind]: 'String' } as Schema]
    const schema = { [Kind]: kind, properties: properties } as Schema
    const testEntity = 12345 as Entity

    const result = CreateSchemaValue(testEntity, schema)

    expect(result).toBe(Expected)
    expect(result).toEqual(Expected)
    expect(result).not.toEqual('')
  })

  it("should return a new function as represented by `@param schema`.properties.return when schema[Kind] is 'Func'", () => {
    const Expected = 0

    const kind = 'Func'
    const returnSchema = { [Kind]: 'Number' } as Schema
    const properties = { params: [], return: returnSchema }
    const schema = { [Kind]: kind, properties: properties } as Schema
    const testEntity = 12345 as Entity

    const result = (CreateSchemaValue(testEntity, schema) as any)()

    expect(result).toBe(Expected)
    expect(result).not.toEqual('')
  })

  it.each(['Required', 'NonSerialized'])(
    'should call CreateSchemaValue to create a schema value from (`@param entity`, `@param schema`.properties) when schema[Kind] is %s',
    (kind) => {
      const Expected = 0

      const properties = {
        [Kind]: 'Union',
        properties: [{ [Kind]: 'Number' } as Schema, { [Kind]: 'String' } as Schema]
      }
      const schema = { [Kind]: kind, properties: properties } as Schema
      const testEntity = 12345 as Entity

      const result = CreateSchemaValue(testEntity, schema)

      expect(result).toBe(Expected)
      expect(result).toEqual(Expected)
      expect(result).not.toEqual('')
    }
  )

  it('should return undefined for every other `@param schema`[Kind] (case: default)', () => {
    const Expected = undefined

    const kind = 'UnknownKind' as any
    const properties = { [Kind]: 'Union', properties: [{ [Kind]: 'Number' } as Schema, { [Kind]: 'String' } as Schema] }
    const schema = { [Kind]: kind, properties: properties } as Schema
    const testEntity = 12345 as Entity

    const result = CreateSchemaValue(testEntity, schema)

    expect(result).toBe(Expected)
    expect(result).toEqual(Expected)
    expect(result).not.toEqual('')
  })
}) //:: CreateSchemaValue

describe('CheckSchemaValue', () => {
  describe.each([
    ['Null', { one: null, two: 42 }],
    ['Undefined', { one: undefined, two: 42 }]
  ])('case Kind.%s', (kind, value) => {
    it(`should return true if '@param value' is ${value.one}`, () => {
      const Expected = true

      const schema = { [Kind]: kind } as Schema

      const result = CheckSchemaValue(schema, value.one)

      expect(result).toBe(Expected)
    })

    it(`should return false if '@param value' is not ${value.one}`, () => {
      const Expected = false

      const schema = { [Kind]: kind } as Schema

      const result = CheckSchemaValue(schema, value.two)

      expect(result).toBe(Expected)
    })
  }) //:: Kind.Null

  describe.each([
    ['Number', 'number', { one: 1, two: false }],
    ['Bool', 'boolean', { one: false, two: 42 }],
    ['String', 'string', { one: 'SomeString', two: 42 }]
  ])('case Kind.%s', (kind, typ, value) => {
    it("should return true if typeof `@param value` is 'number'", () => {
      const Expected = true

      const schema = { [Kind]: kind } as Schema

      const result = CheckSchemaValue(schema, value.one)

      expect(result).toBe(Expected)
    })

    it("should return false if typeof `@param value` is not 'number'", () => {
      const Expected = false

      const schema = { [Kind]: kind } as Schema

      const result = CheckSchemaValue(schema, value.two)

      expect(result).toBe(Expected)
    })
  }) //:: Kind.Number

  describe('case Kind.Enum', () => {
    const TestSchemaKind = 'Enum'

    it('should return true if `@param schema`.properties includes `@param value`', () => {
      const Expected = true

      const value = 42
      const properties = { expectedValue: value, One: 1, Two: 2 }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it('should return false if `@param schema`.properties does not include `@param value`', () => {
      const Expected = false

      const value = 42
      const properties = { One: 1, Two: 2 }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })
  }) //:: Kind.Enum

  describe('case Kind.Literal', () => {
    const TestSchemaKind = 'Literal'

    it('should return true if `@param schema`.properties is `@param value`', () => {
      const Expected = true

      const value = { one: 42 }
      const properties = value
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it('should return false if `@param schema`.properties is not `@param value`', () => {
      const Expected = false

      const value = { one: 41 }
      const properties = { two: 42 }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })
  }) //:: Kind.Literal

  describe.each(['Object', 'Class'])('case Kind.%s', (kind) => {
    it('should ignore any `@param schema`.properties or their children when they are not serializable', () => {
      const Expected = true

      const value = { one: 41, two: 'SomeString', ignored1: null, ignored2: { ignoredChild1: null } }
      const properties = {
        one: { [Kind]: 'Number' } as Schema,
        two: { [Kind]: 'String' } as Schema,
        ignored1: { [Kind]: 'NonSerialized' } as Schema,
        ignored2: {
          [Kind]: 'Object',
          properties: {
            ignoredChild1: { [Kind]: 'NonSerialized' } as Schema
          }
        } as Schema
      }
      const schema = { [Kind]: kind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it('should return false if any of the `@param schema`.properties is not a schema value', () => {
      const Expected = false

      const value = { one: 'ShouldBeNumber', two: 'SomeString', ignored1: null, ignored2: { ignoredChild1: null } }
      const properties = {
        one: { [Kind]: 'Number' } as Schema,
        two: { [Kind]: 'String' } as Schema,
        ignored1: { [Kind]: 'NonSerialized' } as Schema,
        ignored2: {
          [Kind]: 'Object',
          properties: {
            ignoredChild1: { [Kind]: 'NonSerialized' } as Schema
          }
        } as Schema
      }
      const schema = { [Kind]: kind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it('should return true if all `@param schema`.properties are schema values', () => {
      const Expected = true

      const value = { one: 41, two: 'SomeString' }
      const properties = {
        one: { [Kind]: 'Number' } as Schema,
        two: { [Kind]: 'String' } as Schema
      }
      const schema = { [Kind]: kind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })
  }) //:: [Kind.Object, Kind.Class]

  it('should return true if `@param schema`[Kind] is Kind.Any', () => {
    const Expected = true

    const TestSchemaKind = 'Any'
    const value = null
    const schema = { [Kind]: TestSchemaKind, properties: {} } as Schema

    const result = CheckSchemaValue(schema, value)

    expect(result).toBe(Expected)
  })

  describe('case Kind.Record', () => {
    const TestSchemaKind = 'Record'

    it('should return true if `@param schema`.properties.value is not serializable', () => {
      const Expected = true

      const value = null
      const properties = { key: { [Kind]: 'String' } as Schema, value: { [Kind]: 'NonSerialized' } as Schema }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it("should return false if `@param value` is truthy, its typeof is 'object' and one of its .properties.values is not a schema value", () => {
      const Expected = false

      const value = { One: 1, Two: 2, 3: 'test' } as Record<number, string>
      const properties = { key: { [Kind]: 'String' } as Schema, value: { [Kind]: 'Number' } as Schema }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it('should return true if `@param schema`.properties.value is not serializable', () => {
      const Expected = true

      const value = { One: 1, Two: 2 } as Record<string, number>
      const properties = { key: { [Kind]: 'String' } as Schema, value: { [Kind]: 'NonSerialized' } as Schema }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it('should return true if `@param schema`.properties.value is serializable and `@param value` is falsy', () => {
      const Expected = true

      const value = null
      const properties = { key: { [Kind]: 'String' } as Schema, value: { [Kind]: 'Number' } as Schema }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it("should return true if `@param schema`.properties.value is serializable, `@param value` is truthy but its typeof is not 'object'", () => {
      const Expected = true

      const value = 42
      const properties = { key: { [Kind]: 'String' } as Schema, value: { [Kind]: 'Number' } as Schema }
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })
  }) //:: Kind.Record

  describe('case Kind.Array', () => {
    const TestSchemaKind = 'Array'

    it('should return true if `@param schema`.properties is not serializable', () => {
      const Expected = true

      const value = 42
      const properties = { [Kind]: 'NonSerialized' } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties, options: {} } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it('should return false if `@param value` is not an array', () => {
      const Expected = false

      const value = 42
      const properties = { [Kind]: 'Number' } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it('should return true if `@param value` is an array of length 0', () => {
      const Expected = true

      const value = []
      const properties = { [Kind]: 'Number' } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it('should return false if `@param value` is an array and at least one of its entries is not a schema value', () => {
      const Expected = false

      const value = [42, 'invalid']
      const properties = { [Kind]: 'Number' } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it('should return true if `@param value` is an array and all its entries are schema values', () => {
      const Expected = true

      const value = [41, 42]
      const properties = { [Kind]: 'Number' } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })
  }) //:: Kind.Array

  describe('case Kind.Tuple', () => {
    const TestSchemaKind = 'Tuple'

    it('should return false if `@param value` is not an array', () => {
      const Expected = false

      const value = 42
      const properties = undefined
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it('should return false if `@param value` is an array and at least one of its entries is not a schema value', () => {
      const Expected = false

      const value = [41, 42]
      const properties = [{ [Kind]: 'Number' } as Schema, { [Kind]: 'String' } as Schema]
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it('should return true if `@param value` is an array and all its entries are schema values', () => {
      const Expected = true

      const value = [42, 'SomeString']
      const properties = [{ [Kind]: 'Number' } as Schema, { [Kind]: 'String' } as Schema]
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })
  }) //:: Kind.Tuple

  describe('case Kind.Union', () => {
    const TestSchemaKind = 'Union'

    it('should return false if `@param schema`.properties.length is 0', () => {
      const Expected = false

      const value = 42
      const properties = []
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it('should return true if `@param value` is a schema value of any of the `@param schema`.properties fields', () => {
      const Expected = true

      const value = 42
      const properties = [{ [Kind]: 'Number' } as Schema, { [Kind]: 'String' } as Schema]
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it('should ignore (continue) any values of `@param schema`.properties that are not serializable', () => {
      const Expected = false

      const value = 42
      const properties = [
        { [Kind]: 'NonSerialized', properties: { [Kind]: 'Number' } as Schema } as Schema,
        { [Kind]: 'String' } as Schema
      ]
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it('should return false if `@param schema`.properties.length is not 0 and `@param value` is not a schema value of any of the `@param schema`.properties fields', () => {
      const Expected = false

      const value = 42
      const properties = [{ [Kind]: 'Bool' } as Schema, { [Kind]: 'String' } as Schema]
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })
  }) //:: Kind.Union

  describe.each(['Required', 'Proxy'])('case Kind.%s', (kind) => {
    const TestSchemaKind = kind

    it('should return true if `@param value` is a schema value of any of the `@param schema`.properties fields', () => {
      const Expected = true

      const value = 42
      const properties = { [Kind]: 'Number' } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })

    it('should return false if `@param value` is not a schema value of any of the `@param schema`.properties fields', () => {
      const Expected = false

      const value = 42
      const properties = { [Kind]: 'String' } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = CheckSchemaValue(schema, value)

      expect(result).toBe(Expected)
    })
  }) //:: [Kind.Required, Kind.Proxy]

  it.each(['Partial', 'Func', 'NonSerialized'])('should return true if `@param schema`[Kind] is Kind.%s', (kind) => {
    const Expected = true

    const TestSchemaKind = kind
    const value = 42
    const schema = { [Kind]: TestSchemaKind } as Schema

    const result = CheckSchemaValue(schema, value)

    expect(result).toBe(Expected)
  })

  it('should return false for every other `@param schema`[Kind] value  (case: default)', () => {
    const Expected = false

    const TestSchemaKind = 'InvalidSchemaKind' as any
    const value = 42
    const schema = { [Kind]: TestSchemaKind } as Schema

    const result = CheckSchemaValue(schema, value)

    expect(result).toBe(Expected)
  })
}) //:: CheckSchemaValue

describe('CloneSerializable', () => {
  it('should return null if typeof `@param value` is undefined', () => {
    const Expected = null

    const value = undefined

    const result = CloneSerializable(value)

    expect(result).toBe(Expected)
  })

  it.each([
    [BigInt(42), 'bigint'],
    [true, 'boolean'],
    [42, 'number'],
    ['thing', 'string'],
    [Symbol('thing'), 'symbol']
  ])('should return `@param value` if its typeof is a value type', (value, typ) => {
    const Expected = value

    const result = CloneSerializable(value)

    expect(result).toBe(Expected)
  })

  it('should return `@param value` if its null', () => {
    const Expected = null

    const value = Expected

    const result = CloneSerializable(value)

    expect(result).toBe(Expected)
  })

  it('should return a duplicate of `@param value` if it is an ArrayBuffer', () => {
    const Expected = new Int32Array(42)

    const value = Expected

    const result = CloneSerializable(value)

    expect(result).not.toBe(Expected)
    expect(result).toEqual(Expected)
  })

  it('should return a duplicate of `@param value` without any of its NonSerializable entries if value is an Array', () => {
    const Expected = [41, 42, null]

    const value = [Expected[0], Expected[1], undefined]

    const result = CloneSerializable(value)

    expect(result).not.toBe(Expected)
    expect(result).toEqual(Expected)
  })

  it('should return a new Set containing all the serializable values of `@param value`.entries() if value is a Set', () => {
    const one = 41
    const two = 42
    const Expected = new Set([one, two, null])

    const value = new Set([one, two, undefined])

    const result = CloneSerializable(value)

    expect(result).not.toBe(Expected)
    expect(result).toEqual(Expected)
  })

  it('should return a new Map containing all the serializable values of `@param value`.entries() if value is a Map', () => {
    const one = 41
    const two = 42
    const Expected = new Map([
      ['one', one],
      ['two', two],
      ['thr', null]
    ])

    const value = new Map([
      ['one', one],
      ['two', two],
      ['thr', undefined]
    ])

    const result = CloneSerializable(value)

    expect(result).not.toBe(Expected)
    expect(result).toEqual(Expected)
  })

  it("should return a new object containing all the serializable values of `@param value` if typeof value is 'object'", () => {
    const one = 41
    const two = 42
    const Expected = { one: one, two: two, thr: null }

    const value = { one: one, two: two, thr: undefined }

    const result = CloneSerializable(value)

    expect(result).not.toBe(Expected)
    expect(result).toEqual(Expected)
  })

  /** Just for reference. This branch/case can never be hit */
  it.skip("should return NonSerializable if typeof `@param value` is not 'undefined', its typeof is not a value type, and it is not null, an ArrayBuffer, an Array, a Set, a Map or an object", () => {
    const Expected = NonSerializable

    const value = new ArrayBuffer(2) // @todo Is there any value that could trigger this case ?

    const result = CloneSerializable(value)

    expect(result).not.toBe(Expected)
    expect(result).toEqual(Expected)
  })
}) //:: CloneSerializable

describe('ConvertToSchema', () => {
  describe('when `@param schema`.options.serialize is truthy ..', () => {
    it('.. should return the result of calling schema.options.serialize with (`@param value`) as arguments', () => {
      const Expected = 42

      const resultSpy = vi.fn((_: any): any => Expected)
      const value = 21
      const schema = { options: { serialize: resultSpy as any } } as Schema

      const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

      expect(resultSpy).toHaveBeenCalled()
      expect(resultSpy).toHaveBeenCalledWith(value)
      expect(result).toBe(Expected)
    })
  })

  describe('when `@param schema`.options.serialize is falsy ..', () => {
    it.todo.each(['Null', 'Undefined', 'Void', 'Number', 'Bool', 'String', 'Enum', 'Literal', 'Any'])(
      "should return `@param value` when `@param schema`[Kind] is '%s'",
      (kind) => {
        const Expected = { one: 42 }

        const TestSchemaKind = kind
        const value = Expected
        const schema = { [Kind]: TestSchemaKind, options: { serialize: undefined } } as Schema

        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

        expect(result).toBe(Expected)
        expect(result).toEqual(Expected)
      }
    )

    describe.each(['Object', 'Class'])('case: Kind.%s', (kind) => {
      describe("when schema.properties has keys, `@param value` is truthy and its typeof is 'object' ..", () => {
        it('.. should return an object that contains all serializable fields of `@param value` converted to schema values', () => {
          const Expected = { one: 42 }

          const TestSchemaKind = kind
          const value = { one: 42, two: undefined }
          const properties = {
            one: { [Kind]: 'Number' } as Schema,
            two: { [Kind]: 'NonSerialized', properties: { [Kind]: 'Number' } as Schema } as Schema
          }
          const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

          const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

          expect(result).not.toBe(Expected)
          expect(result).toEqual(Expected)
        })
      })

      describe("when schema.properties has no keys, `@param value` is truthy or its typeof is not 'object' ..", () => {
        it(".. should return null if `@param schema`[Kind] is 'Class'", () => {
          const Expected = kind === 'Class' ? null : { one: 42, two: undefined }

          const TestSchemaKind = kind
          const value = { one: 42, two: undefined }
          const properties = {}
          const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

          const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

          expect(result).toEqual(Expected)
        })

        it(".. should return `@param value` if `@param schema`[Kind] is not 'Class',", () => {
          const Expected = kind !== 'Class' ? { one: 42, two: undefined } : null

          const TestSchemaKind = kind
          const value = { one: 42, two: undefined }
          const properties = {}
          const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

          const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

          expect(result).toEqual(Expected)
        })
      })
    }) //:: case: ['Object', 'Class']

    describe("case 'Record'", () => {
      const TestSchemaKind = 'Record'

      it('should return null if `@param schema`.properties.value is falsy', () => {
        const Expected = null

        const value = { one: 42, two: undefined }
        const properties = {}
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

        expect(result).toEqual(Expected)
      })

      it("should return a new record object with all the (key:value)s from `@param value` converted to schema values if value is truthy and its typeof is 'object'", () => {
        const one = 41
        const two = 42
        const Expected = { one: one, two: two }

        const value = structuredClone(Expected)
        const properties = {
          key: { [Kind]: 'String' } as Schema,
          value: { [Kind]: 'Number' } as Schema
        }
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

        expect(result).toEqual(Expected)
      })

      it('should return `@param value` if it is falsy', () => {
        const Expected = null

        const value = Expected
        const properties = {
          key: { [Kind]: 'String' } as Schema,
          value: { [Kind]: 'Number' } as Schema
        }
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

        expect(result).toBe(Expected)
        expect(result).toEqual(Expected)
      })

      it("should return `@param value` if it its typeof is not 'object'", () => {
        const Expected = 42

        const value = Expected
        const properties = {
          key: { [Kind]: 'String' } as Schema,
          value: { [Kind]: 'Number' } as Schema
        }
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

        expect(result).toBe(Expected)
        expect(result).toEqual(Expected)
      })
    }) //:: case 'Record'

    describe("case 'Array'", () => {
      const TestSchemaKind = 'Array'

      it('should return null if `@param schema`.properties is not serializable', () => {
        const Expected = null

        const value = 42
        const properties = { [Kind]: 'NonSerialized' } as Schema
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

        expect(result).toBe(Expected)
      })

      it('should return a new array with the values of `@param schema`.properties used to convert `@param value` to schema values if value is an array', () => {
        const Expected = [41, 42]

        const value = Expected
        const properties = { [Kind]: 'Number' } as Schema
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

        expect(result).not.toBe(Expected)
        expect(result).toEqual(Expected)
      })

      it('should return `@param value` if it is not an array', () => {
        const Expected = { one: 42 }

        const value = Expected
        const properties = { [Kind]: 'Number' } as Schema
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

        expect(result).toBe(Expected)
        expect(result).toEqual(Expected)
      })
    }) //:: case 'Array'

    describe("case 'Tuple'", () => {
      const TestSchemaKind = 'Tuple'

      it('should return a new tuple/array with the values of `@param schema`.properties used to convert `@param value` to schema values if value is an array', () => {
        const Expected = [42, 'SomeString']

        const value = Expected
        const properties = [{ [Kind]: 'Number' } as Schema, { [Kind]: 'String' } as Schema]
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

        expect(result).not.toBe(Expected)
        expect(result).toEqual(Expected)
      })

      it('should return `@param value` if it is not an array', () => {
        const Expected = { one: 42 }

        const value = Expected
        const properties = { [Kind]: 'Number' } as Schema
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

        expect(result).toBe(Expected)
        expect(result).toEqual(Expected)
      })
    }) //:: case 'Tuple'

    describe("case 'Union'", () => {
      const TestSchemaKind = 'Union'

      it('should return null if `@param schema`.properties has no values', () => {
        const Expected = null

        const value = 42
        const properties = []
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

        expect(result).toBe(Expected)
      })

      it('should return `@param value` converted to the first entry of `@param schema`.properties that matches its value', () => {
        const Expected = 42

        const value = Expected
        const properties = [
          { [Kind]: 'String' } as Schema,
          { [Kind]: 'Void' } as Schema,
          { [Kind]: 'Number' } as Schema
        ]
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

        expect(result).toBe(Expected)
      })

      it('should return null if no entry of `@param schema`.properties matches `@param value`', () => {
        const Expected = null

        const value = 42
        const properties = [{ [Kind]: 'String' } as Schema, { [Kind]: 'Void' } as Schema]
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

        expect(result).toBe(Expected)
      })

      it('should ignore (continue) all values of `@param schema`.properties that are not serializable', () => {
        const Expected = null

        const value = 42
        const properties = [
          { [Kind]: 'String' } as Schema,
          { [Kind]: 'Void' } as Schema,
          { [Kind]: 'NonSerialized', properties: { [Kind]: 'Number' } as Schema } as Schema
        ]
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

        expect(result).toBe(Expected)
      })

      describe('with arrays of object unions', () => {
        it('should correctly serialize an array of union of different object types', () => {
          // Create schemas for different object types
          const userObjectSchema = {
            [Kind]: 'Object',
            properties: {
              type: { [Kind]: 'Literal', properties: 'user' } as Schema,
              name: { [Kind]: 'String' } as Schema,
              age: { [Kind]: 'Number' } as Schema
            }
          } as Schema

          const postObjectSchema = {
            [Kind]: 'Object',
            properties: {
              type: { [Kind]: 'Literal', properties: 'post' } as Schema,
              title: { [Kind]: 'String' } as Schema,
              content: { [Kind]: 'String' } as Schema
            }
          } as Schema

          const commentObjectSchema = {
            [Kind]: 'Object',
            properties: {
              type: { [Kind]: 'Literal', properties: 'comment' } as Schema,
              text: { [Kind]: 'String' } as Schema,
              likes: { [Kind]: 'Number' } as Schema
            }
          } as Schema

          // Create a union schema that accepts all three object types
          const unionSchema = {
            [Kind]: 'Union',
            properties: [userObjectSchema, postObjectSchema, commentObjectSchema]
          } as Schema

          // Create an array schema that contains the union schema
          const arraySchema = {
            [Kind]: 'Array',
            properties: unionSchema
          } as Schema

          // Test with an array containing mixed object types
          const value = [
            { type: 'user', name: 'John', age: 30 },
            { type: 'post', title: 'Hello World', content: 'This is a post' },
            { type: 'comment', text: 'Great post!', likes: 5 }
          ]

          const result = JSONSchemaUtilsFunctions.ConvertToSchema(arraySchema, value)

          // Check that all objects were properly serialized
          expect(result).toEqual([
            { type: 'user', name: 'John', age: 30 },
            { type: 'post', title: 'Hello World', content: 'This is a post' },
            { type: 'comment', text: 'Great post!', likes: 5 }
          ])
        })

        it('should correctly serialize an array of union of different object types with some invalid objects', () => {
          // Create schemas for different object types
          const userObjectSchema = {
            [Kind]: 'Object',
            properties: {
              type: { [Kind]: 'Literal', properties: 'user' } as Schema,
              name: { [Kind]: 'String' } as Schema,
              age: { [Kind]: 'Number' } as Schema
            }
          } as Schema

          const postObjectSchema = {
            [Kind]: 'Object',
            properties: {
              type: { [Kind]: 'Literal', properties: 'post' } as Schema,
              title: { [Kind]: 'String' } as Schema,
              content: { [Kind]: 'String' } as Schema
            }
          } as Schema

          // Create a union schema that accepts only user and post object types
          const unionSchema = {
            [Kind]: 'Union',
            properties: [userObjectSchema, postObjectSchema]
          } as Schema

          // Create an array schema that contains the union schema
          const arraySchema = {
            [Kind]: 'Array',
            properties: unionSchema
          } as Schema

          // Test with an array containing mixed object types including invalid ones
          const value = [
            { type: 'user', name: 'John', age: 30 },
            { type: 'post', title: 'Hello World', content: 'This is a post' },
            { type: 'comment', text: 'Great post!', likes: 5 }, // Should be null (not in union)
            { type: 'invalid', data: 'This should be null' }, // Should be null (not in union)
            { name: 'Missing type field' } // Should be null (not in union)
          ]

          const result = JSONSchemaUtilsFunctions.ConvertToSchema(arraySchema, value)

          // Check that only valid objects were properly serialized
          // Invalid objects should be converted to null
          expect(result).toEqual([
            { type: 'user', name: 'John', age: 30 },
            { type: 'post', title: 'Hello World', content: 'This is a post' },
            null,
            null,
            null
          ])
        })

        it('should correctly serialize an array of union of different object types with nested objects', () => {
          // Create schemas for nested object types
          const addressSchema = {
            [Kind]: 'Object',
            properties: {
              street: { [Kind]: 'String' } as Schema,
              city: { [Kind]: 'String' } as Schema,
              zipCode: { [Kind]: 'String' } as Schema
            }
          } as Schema

          const userObjectSchema = {
            [Kind]: 'Object',
            properties: {
              type: { [Kind]: 'Literal', properties: 'user' } as Schema,
              name: { [Kind]: 'String' } as Schema,
              address: addressSchema
            }
          } as Schema

          const companyObjectSchema = {
            [Kind]: 'Object',
            properties: {
              type: { [Kind]: 'Literal', properties: 'company' } as Schema,
              name: { [Kind]: 'String' } as Schema,
              employees: {
                [Kind]: 'Array',
                properties: {
                  [Kind]: 'Object',
                  properties: {
                    name: { [Kind]: 'String' } as Schema,
                    role: { [Kind]: 'String' } as Schema
                  }
                } as Schema
              } as Schema
            }
          } as Schema

          // Create a union schema that accepts both object types
          const unionSchema = {
            [Kind]: 'Union',
            properties: [userObjectSchema, companyObjectSchema]
          } as Schema

          // Create an array schema that contains the union schema
          const arraySchema = {
            [Kind]: 'Array',
            properties: unionSchema
          } as Schema

          // Test with an array containing nested object types
          const value = [
            {
              type: 'user',
              name: 'John',
              address: {
                street: '123 Main St',
                city: 'Anytown',
                zipCode: '12345'
              }
            },
            {
              type: 'company',
              name: 'Acme Inc',
              employees: [
                { name: 'Alice', role: 'Developer' },
                { name: 'Bob', role: 'Designer' }
              ]
            }
          ]

          const result = JSONSchemaUtilsFunctions.ConvertToSchema(arraySchema, value)

          // Check that nested objects were properly serialized
          expect(result).toEqual([
            {
              type: 'user',
              name: 'John',
              address: {
                street: '123 Main St',
                city: 'Anytown',
                zipCode: '12345'
              }
            },
            {
              type: 'company',
              name: 'Acme Inc',
              employees: [
                { name: 'Alice', role: 'Developer' },
                { name: 'Bob', role: 'Designer' }
              ]
            }
          ])
        })
      })
    }) //:: case 'Union'

    it.each(['Partial', 'Required', 'Proxy'])(
      'should flatten the schema and return `@param value` converted to the schema defined by `@param schema`.properties when schema[Kind] is "%s"',
      (kind) => {
        const Expected = [41, 42]
        const TestSchemaKind = kind

        const value = Expected
        const properties = { [Kind]: 'Array', properties: { [Kind]: 'Number' } as Schema } as Schema
        const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

        const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

        expect(result).not.toBe(Expected)
        expect(result).toEqual(Expected)
      }
    ) //:: case: ['Partial', 'Required', 'Proxy']

    it("should return undefined when `@param schema`[Kind] is 'NonSerialized'", () => {
      const Expected = undefined
      const TestSchemaKind = 'NonSerialized'

      const value = [41, 42]
      const properties = { [Kind]: 'Array', properties: { [Kind]: 'Number' } as Schema } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

      expect(result).toBe(Expected)
      expect(result).toEqual(Expected)
    })

    it('should return null for every other value of `@param schema`[Kind]  (case: default)', () => {
      const Expected = null
      const TestSchemaKind = 'UnknownSchemaKind' as any

      const value = [41, 42]
      const properties = { [Kind]: 'Array', properties: { [Kind]: 'Number' } as Schema } as Schema
      const schema = { [Kind]: TestSchemaKind, properties: properties } as Schema

      const result = JSONSchemaUtilsFunctions.ConvertToSchema(schema, value)

      expect(result).toBe(Expected)
      expect(result).toEqual(Expected)
    })
  })
}) //:: ConvertToSchema

describe('SerializeSchema', () => {
  it('should return a deep clone of `@param value` with all its serializable values converted based on `@param schema`', () => {
    const Expected = { one: 41, two: 'TWO' }

    const value = { one: Expected.one, two: Expected.two, three: undefined, four: null }
    const properties = {
      one: { [Kind]: 'Number' } as Schema,
      two: { [Kind]: 'String' } as Schema
    }
    const schema = { [Kind]: 'Object', properties: properties } as Schema

    const result = SerializeSchema(schema, value)

    expect(result).not.toBe(Expected)
    expect(result).toEqual(Expected)
  })
}) //:: SerializeSchema

describe('GenerateJSONSchema', () => {
  it('should generate schema for Null type', () => {
    const schema = S.Null()
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toBeUndefined()
  })

  it('should generate schema for Undefined type', () => {
    const schema = S.Undefined()
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toBeUndefined()
  })

  it('should generate schema for Void type', () => {
    const schema = S.Void()
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toBeUndefined()
  })

  it('should generate schema for Number type', () => {
    const schema = S.Number(0, { maximum: 100, minimum: 0 })
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({
      type: 'number',
      maximum: 100,
      minimum: 0
    })
  })

  it('should generate schema for Bool type', () => {
    const schema = S.Bool(false)
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({ type: 'boolean' })
  })

  it('should generate schema for String type', () => {
    const schema = S.String('test')
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({ type: 'string' })
  })

  it('should generate schema for Enum type', () => {
    const schema = S.Enum({ A: 'a', B: 'b' }, 'a')
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({
      enum: ['a', 'b']
    })
  })

  it('should generate schema for Literal type', () => {
    const schema = S.Literal('test')
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({
      const: 'test'
    })
  })

  it('should generate schema for Object type', () => {
    const schema = S.Object({
      name: S.String(),
      age: S.Number(),
      active: S.Bool()
    })
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        active: { type: 'boolean' }
      },
      required: []
    })
  })

  it('should generate schema for Object type with required fields', () => {
    const schema = S.Object({
      name: S.Required(S.String()),
      age: S.Number(),
      active: S.Bool()
    })
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        active: { type: 'boolean' }
      },
      required: ['name']
    })
  })

  it('should generate schema for Record type', () => {
    const schema = S.Record(S.String(), S.Number())
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({
      type: 'object',
      additionalProperties: { type: 'number' }
    })
  })

  it('should generate schema for Partial type', () => {
    const schema = S.Partial(
      S.Object({
        name: S.String(),
        age: S.Number()
      })
    )
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({
      type: 'object',
      required: [],
      properties: {
        name: { type: 'string' },
        age: { type: 'number' }
      }
    })
  })

  it('should generate schema for Array type', () => {
    const schema = S.Array(S.Number(), [], { minItem: 1, maxItem: 10 })
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({
      type: 'array',
      items: { type: 'number' },
      minItems: 1,
      maxItems: 10
    })
  })

  it('should generate schema for Tuple type', () => {
    const schema = S.Tuple([S.String(), S.Number(), S.Bool()])
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({
      type: 'array',
      items: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }],
      minItems: 3,
      maxItems: 3
    })
  })

  it('should generate schema for Union type', () => {
    const schema = S.Union([S.String(), S.Number()])
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({
      oneOf: [{ type: 'string' }, { type: 'number' }]
    })
  })

  it('should not generate schema for Func type', () => {
    const schema = S.Func([S.String()], S.Number())
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toBeUndefined()
  })

  it('should not generate schema for NonSerialized type', () => {
    const schema = S.NonSerialized(S.String())
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toBeUndefined()
  })

  it('should not add to record non Func type', () => {
    const schema = S.Object({ prop: S.Func([S.String()], S.Number()) })
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({ type: 'object', required: [] })
  })

  it('should not add to record non Func type', () => {
    const schema = S.Object({ prop: S.NonSerialized(S.String()) })
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({ type: 'object', required: [] })
  })

  it('should generate schema for Class type', () => {
    const MyClass = class {
      name: string
      age: number
    }
    const schema = S.Class(() => new MyClass())
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toBeUndefined()
  })

  it('should generate schema for Proxy type', () => {
    const schema = S.Proxy(S.String(), () => ({}))
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({ type: 'string' })
  })

  it('should generate schema for Any type', () => {
    const schema = S.Any()
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toBeUndefined()
  })

  it('should include $id when provided in options', () => {
    const schema = S.String('test', { id: 'test-id' })
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({
      type: 'string',
      $id: 'test-id'
    })
  })

  it('should handle nested schemas correctly', () => {
    const schema = S.Object({
      user: S.Object({
        name: S.String(),
        age: S.Number(),
        tags: S.Array(S.String())
      }),
      active: S.Bool()
    })
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
            tags: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: []
        },
        active: { type: 'boolean' }
      },
      required: []
    })
  })

  it('should include $comment when provided in options', () => {
    const schema = S.String('test', { $comment: 'test-comment' })
    const jsonSchema = GenerateJSONSchema(schema)
    expect(jsonSchema).toEqual({
      type: 'string',
      $comment: 'test-comment'
    })
  })
}) //:: GenerateJSONSchema

describe('flattenSchema', () => {
  it('should flatten a simple object schema', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' }
      }
    }
    const result = flattenSchema(schema)
    expect(result).toEqual({
      name: { type: 'string' },
      age: { type: 'number' }
    })
  })

  it('should flatten a nested object schema', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        person: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' }
          }
        }
      }
    }
    const result = flattenSchema(schema)
    expect(result).toEqual({
      'person.name': { type: 'string' },
      'person.age': { type: 'number' }
    })
  })

  it('should flatten an array of objects', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        people: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' }
            }
          }
        }
      }
    }
    const sampleData = {
      people: [{ name: 'John', age: 30 }]
    }
    const result = flattenSchema(schema, '', sampleData)
    expect(result).toEqual({
      'people.0.name': { type: 'string' },
      'people.0.age': { type: 'number' }
    })
  })

  it('should flatten an array of arrays with fixed length', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        matrix: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'number' }
          }
        }
      }
    }
    const sampleData = {
      matrix: [
        [1, 2],
        [3, 4]
      ]
    }
    const result = flattenSchema(schema, '', sampleData)
    expect(result).toEqual({
      'matrix.0': { type: 'number' },
      'matrix.1': { type: 'number' }
    })
  })

  it('should flatten an array of arrays without fixed length', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        matrix: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'number' }
          }
        }
      }
    }
    const sampleData = {
      matrix: [
        [1, 2],
        [3, 4, 5]
      ]
    }
    const result = flattenSchema(schema, '', sampleData)
    expect(result).toEqual({
      matrix: { type: 'number' }
    })
  })

  it('should flatten an array of primitives', () => {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
    const sampleData = {
      tags: ['tag1', 'tag2']
    }
    const result = flattenSchema(schema, '', sampleData)
    expect(result).toEqual({
      /** @todo this isn't right... */
      tags: { type: 'string' }
    })
  })

  it('should handle an empty schema', () => {
    // @ts-ignore
    const schema: JSONSchema = {}
    const result = flattenSchema(schema)
    expect(result).toEqual({})
  })

  it('should handle a schema with no properties', () => {
    const schema: JSONSchema = {
      type: 'object'
    }
    const result = flattenSchema(schema)
    expect(result).toEqual({})
  })
}) //:: flattenSchema
