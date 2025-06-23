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

import { Entity } from '../Entity'
import {
  Kind,
  NonSerializable,
  Schema,
  Static,
  TArraySchema,
  TFuncSchema,
  TLiteralSchema,
  TLiteralValue,
  TNumberSchema,
  TPartialSchema,
  TProperties,
  TPropertyKeySchema,
  TProxySchema,
  TRecordSchema,
  TTupleSchema,
  TUnionSchema
} from './JSONSchemaTypes'

const CreateDefault = (def) => {
  const res = typeof def === 'function' ? def() : structuredClone(def)
  return res
}

const CreateObject = (props?: TProperties) => {
  const obj = {}
  for (const key in props) {
    const schema = props[key]
    obj[key] = CreateSchemaValue(schema)
  }
  return obj
}

const validValue = (value) => {
  return value !== undefined && value !== null
}

const IterateSchema = <T extends Schema>(schema: T, pred: (curr: T) => boolean): boolean => {
  if (pred(schema)) return true

  switch (schema[Kind]) {
    case 'Object':
    case 'Class': {
      const props = schema.properties as TProperties
      const propKeys = Object.keys(props)

      for (const key of propKeys) {
        if (IterateSchema(props[key], pred)) return true
      }

      return false
    }

    case 'Partial':
    case 'Proxy': {
      const props = schema.properties as TPartialSchema<Schema>['properties'] | TProxySchema<Schema>['properties']
      return IterateSchema(props, pred)
    }

    default:
      return false
  }
}

export const HasSchemaDeserializers = <T extends Schema>(schema: T): boolean => {
  return IterateSchema(schema, (curr) => !!curr.options?.deserialize)
}

export const DeserializeSchemaValue = <T extends Schema, Val>(schema: T, curr: Val, value: Val): Val | undefined => {
  if (validValue(value) && schema.options?.deserialize) return schema.options.deserialize(curr, value) as Val

  switch (schema[Kind]) {
    case 'Number': {
      if (!validValue(value)) return value
      return typeof value === 'number' ? value : undefined
    }
    case 'Bool': {
      if (!validValue(value)) return value
      return typeof value === 'boolean' ? value : undefined
    }
    case 'String': {
      if (!validValue(value)) return value
      if (typeof value !== 'string') return undefined
      if (value === '__proto__') return undefined
      return value
    }
    case 'Literal': {
      if (!validValue(value)) return value
      return schema.properties === value ? value : undefined
    }
    case 'Array': {
      if (!validValue(value)) return value
      if (!Array.isArray(value)) return undefined
      const props = schema.properties as TArraySchema<Schema>['properties']
      const _curr = curr as Array<any>
      const currentLength = _curr.length
      if (currentLength < value.length) {
        for (let i = currentLength; i < value.length; i++) {
          _curr.push(CreateSchemaValue(props))
        }
      }
      try {
        return value
          .map((item, i) => DeserializeSchemaValue(props, curr[i], item))
          .filter((item) => validValue(item)) as Val
      } catch (e) {
        console.log(e)
        return curr
      }
    }
    case 'Tuple': {
      if (!validValue(value)) return value
      if (!Array.isArray(value)) return undefined
      const props = schema.properties as TTupleSchema<Schema[]>['properties']
      return value.map((item, i) => DeserializeSchemaValue(props[i], curr[i], item) ?? curr[i]) as Val
    }
    case 'Union': {
      if (!validValue(value)) return value
      const props = schema.properties as TUnionSchema<Schema[]>['properties']
      for (const prop of props) {
        const deserializedValue = DeserializeSchemaValue(prop, curr, value)
        if (validValue(deserializedValue)) return deserializedValue
      }
      return undefined
    }
    case 'Object': {
      if (!validValue(value)) return value
      if (typeof value !== 'object') return undefined

      const newValue = {} as Val
      const valueKeys = Object.keys(value as object)
      const props = (schema.properties as TProperties) ?? {}

      for (const key of valueKeys) {
        if (!props[key]) continue
        newValue[key] = curr[key]
        if (validValue(value![key])) {
          const deserializedValue = DeserializeSchemaValue(props[key], curr[key], value![key])
          if (typeof deserializedValue !== 'undefined') newValue[key] = deserializedValue
        }
      }

      return newValue
    }

    case 'Class': {
      if (!validValue(value)) return value

      const props = (schema.properties as TProperties) ?? {}
      const propKeys = Object.keys(props)

      for (const key of propKeys) {
        /** @todo should we be mutating value here? */
        if (validValue(value[key])) value[key] = DeserializeSchemaValue(props[key], curr[key], value[key])
        else value[key] = curr[key]
      }

      break
    }

    case 'Proxy':
    case 'Partial': {
      const props = schema.properties as TPartialSchema<Schema>['properties'] | TProxySchema<Schema>['properties']
      return DeserializeSchemaValue(props, curr, value)
    }

    default:
      break
  }

  return value
}

export const HasRequiredSchema = <T extends Schema>(schema: T): boolean => {
  return IterateSchema(schema, (curr) => !!curr.options?.required)
}

export const HasRequiredSchemaValues = <T extends Schema>(schema: T, value, current = ''): [boolean, string] => {
  if (schema.options?.required) return [validValue(value), current]

  switch (schema[Kind]) {
    case 'Object':
    case 'Class': {
      const props = schema.properties as TProperties
      const propKeys = Object.keys(props)

      for (const key of propKeys) {
        const [valid, fromKey] = HasRequiredSchemaValues(props[key], value?.[key], key)
        if (!valid) return [valid, fromKey]
      }

      return [true, '']
    }

    case 'Proxy':
    case 'Partial': {
      const props = schema.properties as TPartialSchema<Schema>['properties'] | TProxySchema<Schema>['properties']
      return HasRequiredSchemaValues(props, value)
    }

    default:
      return [true, '']
  }
}

export const HasSchemaValidators = <T extends Schema>(schema: T): boolean => {
  return IterateSchema(schema, (curr) => !!curr.options?.validate)
}

export const HasValidSchemaValues = <T extends Schema, Val>(
  schema: T,
  value: Val,
  prev: Val,
  entity: Entity,
  current = ''
): [boolean, string] => {
  if (schema.options?.validate && !schema.options.validate(value, prev, entity)) return [false, current]

  switch (schema[Kind]) {
    case 'Object':
    case 'Class': {
      const props = schema.properties as TProperties
      const propKeys = Object.keys(props)

      for (const key of propKeys) {
        const [valid, fromKey] = HasValidSchemaValues(props[key], value?.[key], prev?.[key], entity, key)
        if (!valid) return [valid, fromKey]
      }

      return [true, '']
    }

    case 'Proxy':
    case 'Partial': {
      const props = schema.properties as TPartialSchema<Schema>['properties'] | TProxySchema<Schema>['properties']
      return HasValidSchemaValues(props, value, prev, entity)
    }

    default:
      return [true, '']
  }
}

export const requiresDeserialization = <T extends Schema>(schema: T): boolean => {
  return IterateSchema(schema, (curr) => !!curr.options?.deserialize)
}

export const IsSingleValueSchema = <T extends Schema>(schema?: T): boolean => {
  if (!schema || !schema[Kind]) return false

  switch (schema[Kind]) {
    case 'Null':
    case 'Undefined':
    case 'Void':
    case 'Number':
    case 'Bool':
    case 'String':
    case 'Literal':
    case 'Class':
    case 'Array':
    case 'Tuple':
    case 'Func':
      return true

    case 'Any':
    case 'Object':
    case 'Record':
    case 'Partial':
      return false

    case 'Union': {
      const props = schema.properties as TUnionSchema<Schema[]>['properties']
      if (!props.length) return false
      for (const prop of props) {
        if (!IsSingleValueSchema(prop)) return false
      }
      return true
    }

    case 'Proxy': {
      const props = schema.properties as TProxySchema<Schema>['properties']
      return IsSingleValueSchema(props)
    }
    default:
      return false
  }
}

export const CreateSchemaValue = <T extends Schema>(schema: T): Static<T> => {
  if (schema.options && 'default' in schema.options) return CreateDefault(schema.options.default)

  switch (schema[Kind]) {
    case 'Null':
      return null
    case 'Undefined':
      return undefined
    case 'Void':
      return undefined
    case 'Number':
      return 0
    case 'Bool':
      return false
    case 'String':
      return ''
    case 'Literal':
      return schema.properties

    case 'Object':
    case 'Class': {
      const props = schema.properties as TProperties
      return CreateObject(props)
    }

    case 'Any':
    case 'Record':
    case 'Partial':
      return {}
    case 'Array':
    case 'Tuple':
      return []
    case 'Union': {
      const props = schema.properties as TUnionSchema<Schema[]>['properties']
      if (!props.length) return null
      return CreateSchemaValue(props[0])
    }
    case 'Func': {
      const props = schema.properties as TFuncSchema<Schema[], Schema>['properties']
      return () => CreateSchemaValue(props.return)
    }
    default:
      return undefined
  }
}

const isArrayBuffer = (value: unknown): value is ArrayBuffer => {
  return ArrayBuffer.isView(value)
}

const isSet = (value: unknown): value is Set<any> => {
  return value instanceof Set
}

const isMap = (value: unknown): value is Map<any, any> => {
  return value instanceof Map
}

const isValueType = (type: string) => {
  return (
    type === 'bigint' ||
    type === 'boolean' ||
    type === 'number' ||
    type === 'string' ||
    type === 'symbol' ||
    type === 'undefined'
  )
}

export const CloneSerializable = <Val>(value: Val) => {
  const type = typeof value
  if (typeof value === 'undefined') return null
  if (isValueType(type) || value === null) return value
  else if (isArrayBuffer(value)) return value.slice(0)
  else if (Array.isArray(value))
    return value.map((item) => CloneSerializable(item))?.filter((item) => item !== NonSerializable)
  else if (isSet(value)) return new Set(CloneSerializable([...value.values()]))
  else if (isMap(value)) return new Map(CloneSerializable([...value.entries()]))
  else if (type === 'object') {
    const obj = {}
    for (const key in value as object) {
      const item = CloneSerializable(value![key])
      if (item !== NonSerializable) obj[key] = item
    }
    return obj
  }

  return NonSerializable
}

const isSerializable = <T extends Schema>(schema: T) => {
  return !!schema?.options?.serialized
}

export const CheckSchemaValue = <T extends Schema, Val>(schema: T, value: Val) => {
  switch (schema[Kind]) {
    case 'Null':
      return value === null
    case 'Undefined':
      return value === undefined
    case 'Number':
      return typeof value === 'number'
    case 'Bool':
      return typeof value === 'boolean'
    case 'String':
      return typeof value === 'string'
    case 'Literal':
      return value === schema.properties

    case 'Object':
    case 'Class': {
      const props = schema.properties as TProperties
      for (const key in props) {
        if (!isSerializable(props[key])) continue
        if (!CheckSchemaValue(props[key], value[key])) return false
      }

      return true
    }

    case 'Any':
      return true

    case 'Record': {
      const props = schema.properties as TRecordSchema<TPropertyKeySchema, Schema>['properties']
      const keySchema = props.key
      const valueSchema = props.value

      if (!isSerializable(valueSchema)) return true
      if (value && typeof value === 'object') {
        for (const [key, item] of Object.entries(value)) {
          const keyValue = CheckSchemaValue(keySchema, key) as PropertyKey | null | undefined
          const itemValue = CheckSchemaValue(valueSchema, item)
          if (!keyValue || !itemValue) return false
        }
      }

      return true
    }

    case 'Partial':
      return true

    case 'Array': {
      const props = schema.properties as TArraySchema<Schema>['properties']
      if (!isSerializable(props)) return true

      if (!Array.isArray(value)) return false
      else if (value.length === 0) return true
      else {
        for (const item of value) {
          if (!CheckSchemaValue(props, item)) return false
        }

        return true
      }
    }

    case 'Tuple': {
      const props = schema.properties as TTupleSchema<Schema[]>['properties']
      if (!Array.isArray(value)) return false
      // Tuple of optional values?
      // else if (value.length !== props.length) return false
      for (let i = 0; i < props.length; i++) {
        if (!CheckSchemaValue(props[i], value[i])) return false
      }

      return true
    }

    case 'Union': {
      const props = schema.properties as TUnionSchema<Schema[]>['properties']
      if (!props.length) return false
      else {
        let nonSerializable = true
        for (const prop of props) {
          if (!isSerializable(prop)) continue
          else nonSerializable = false

          if (CheckSchemaValue(prop, value)) return true
        }

        return nonSerializable
      }
    }

    case 'Proxy': {
      const props = schema.properties as TProxySchema<Schema>['properties']
      return CheckSchemaValue(props, value)
    }

    case 'Func':
      return true

    default:
      return false
  }
}

const ConvertToSchema = <T extends Schema, Val>(schema: T, value: Val) => {
  if (!isSerializable(schema)) return undefined
  if (schema.options?.serialize) return schema.options?.serialize(value)

  switch (schema[Kind]) {
    case 'Null':
    case 'Undefined':
    case 'Void':
    case 'Number':
    case 'Bool':
    case 'String':
    case 'Literal':
    case 'Any':
      return value

    case 'Object':
    case 'Class': {
      const props = schema.properties as TProperties
      const propKeys = Object.keys(props)
      if (propKeys.length && value && typeof value === 'object') {
        return Object.entries(value).reduce((acum, [key, item]) => {
          if (propKeys.includes(key) && isSerializable(props[key])) acum[key] = ConvertToSchema(props[key], item)
          return acum
        }, {})
      }

      return schema[Kind] === 'Class' ? null : value
    }

    case 'Record': {
      const props = schema.properties as TRecordSchema<TPropertyKeySchema, Schema>['properties']
      const keySchema = props.key
      const valueSchema = props.value

      if (!isSerializable(valueSchema)) return null
      if (value && typeof value === 'object') {
        return Object.entries(value).reduce((acum, [key, item]) => {
          const keyValue = ConvertToSchema(keySchema, key) as PropertyKey | null | undefined
          const itemValue = ConvertToSchema(valueSchema, item)
          if (keyValue !== null && keyValue !== undefined) acum[keyValue] = itemValue
          return acum
        }, {})
      }

      return value
    }

    case 'Array': {
      const props = schema.properties as TArraySchema<Schema>['properties']
      if (!isSerializable(props)) return null
      if (Array.isArray(value)) return value.map((item) => ConvertToSchema(props, item))
      else return value
    }

    case 'Tuple': {
      const props = schema.properties as TTupleSchema<Schema[]>['properties']
      if (Array.isArray(value)) return value.map((item, i) => ConvertToSchema(props[i], item))
      else return value
    }

    case 'Union': {
      const props = schema.properties as TUnionSchema<Schema[]>['properties']
      if (!props.length) return null

      for (const schema of props) {
        if (!isSerializable(schema)) continue

        const item = ConvertToSchema(schema, value)
        if (CheckSchemaValue(schema, item)) return item
      }

      return null
    }

    case 'Partial':
    case 'Proxy': {
      const props = schema.properties as TPartialSchema<Schema>['properties'] | TProxySchema<Schema>['properties']
      return ConvertToSchema(props, value)
    }

    default:
      return null
  }
}

// Generate a JSON Schema from the Typebox Schema
export const GenerateJSONSchema = <T extends Schema>(schema: T): JSONSchema | undefined => {
  if (schema.options?.serialized === false) return undefined

  const jsonSchema: any = {}

  // Add type based on schema kind
  switch (schema[Kind]) {
    case 'Number': {
      const options = schema.options as TNumberSchema['options']
      jsonSchema.type = 'number'
      if (options?.maximum !== undefined) jsonSchema.maximum = options.maximum
      if (options?.minimum !== undefined) jsonSchema.minimum = options.minimum
      break
    }
    case 'Bool':
      jsonSchema.type = 'boolean'
      break
    case 'String':
      jsonSchema.type = 'string'
      break
    case 'Literal':
      jsonSchema.const = schema.properties
      break
    case 'Object': {
      jsonSchema.type = 'object'
      const props = schema.properties as TProperties
      jsonSchema.required = []

      for (const [key, propSchema] of Object.entries(props)) {
        const propJsonSchema = GenerateJSONSchema(propSchema)
        if (!propJsonSchema || propJsonSchema.type === 'null') continue
        if (!jsonSchema.properties) jsonSchema.properties = {}
        jsonSchema.properties[key] = propJsonSchema

        if (propSchema.options?.required) {
          jsonSchema.required.push(key)
        }
      }
      break
    }
    case 'Record': {
      const props = schema.properties as TRecordSchema<TPropertyKeySchema, Schema>['properties']
      jsonSchema.type = 'object'
      jsonSchema.additionalProperties = GenerateJSONSchema(props.value)
      break
    }
    case 'Partial': {
      const props = schema.properties as TPartialSchema<Schema>['properties']
      jsonSchema.type = 'object'
      const subSchema = GenerateJSONSchema(props)
      jsonSchema.properties = subSchema?.properties
      jsonSchema.required = []
      break
    }
    case 'Array': {
      const props = schema.properties as TArraySchema<Schema>['properties']
      const options = schema.options as TArraySchema<Schema>['options']

      jsonSchema.type = 'array'
      jsonSchema.items = GenerateJSONSchema(props)
      if (options?.minItems !== undefined) jsonSchema.minItems = options.minItems
      if (options?.maxItems !== undefined) jsonSchema.maxItems = options.maxItems
      break
    }
    case 'Tuple': {
      const props = schema.properties as TTupleSchema<Schema[]>['properties']
      jsonSchema.type = 'array'
      jsonSchema.items = props.map((prop) => GenerateJSONSchema(prop))
      jsonSchema.minItems = props.length
      jsonSchema.maxItems = props.length
      break
    }
    case 'Union': {
      const props = schema.properties as TUnionSchema<Schema[]>['properties']
      const isLiteralUnion = props.every((prop) => prop[Kind] === 'Literal')
      if (isLiteralUnion) {
        const enumValues = Object.values(
          schema.properties as TUnionSchema<TLiteralSchema<TLiteralValue>[]>['properties']
        ).map((prop) => prop.properties)
        jsonSchema.enum = enumValues
        if (schema.options?.metadata?.objectRef) {
          jsonSchema.metadata ??= {}
          jsonSchema.metadata.enumKeys = Object.keys(schema.options.metadata.objectRef)
        }
        break
      }

      jsonSchema.oneOf = props.map((prop) => GenerateJSONSchema(prop))
      break
    }
    case 'Proxy': {
      const props = schema.properties as TProxySchema<Schema>['properties']
      return GenerateJSONSchema(props)
    }
    // These types are not to be serialized
    case 'Null':
    case 'Undefined':
    case 'Void':
    case 'Func':
    case 'Class':
    case 'Any':
    default:
      return undefined
  }

  // Add any additional options that might be relevant for JSON Schema
  if (schema.options?.id) {
    jsonSchema.$id = schema.options.id
  }

  // Add $comment if provided in options
  if (schema.options?.$comment) {
    jsonSchema.$comment = schema.options.$comment
  }

  return jsonSchema
}

/**
 * Temporary type for JSON Schema until we implement a proper package to handle this.
 */
export type JSONSchema = {
  type: string
  properties?: { [key: string]: JSONSchema }
  items?: JSONSchema
  minItems?: number
  maxItems?: number
  oneOf?: JSONSchema[]
  $comment?: string
  $id?: string
}

export const SerializeSchema = <T extends Schema, Val>(schema: T, value: Val): Val => {
  const converted = ConvertToSchema(schema, value)
  return CloneSerializable(converted)
}

/** @private Exported for Unit Tests access */
export const JSONSchemaUtilsFunctions = {
  ConvertToSchema
}
