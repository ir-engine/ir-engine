import {
  Kind,
  Schema,
  Static,
  TArraySchema,
  TEnumSchema,
  TFuncSchema,
  TNonSerializedSchema,
  TPartialSchema,
  TProperties,
  TPropertyKeySchema,
  TRecordSchema,
  TRequiredSchema,
  TUnionSchema
} from './JSONSchemaTypes'

const CreateDefault = (def) => {
  return typeof def === 'function' ? def() : def
}

const CreateObject = (props?: TProperties) => {
  const obj = {}
  for (const key in props) {
    obj[key] = CreateSchemaValue(props[key])
  }
  return obj
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
    case 'Enum':
      return Object.values(schema.properties as TEnumSchema<Record<string, string | number>>['properties'])[0]
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
    case 'Required': {
      const props = schema.properties as TRequiredSchema<Schema>['properties']
      return CreateSchemaValue(props)
    }
    case 'NonSerialized': {
      const props = schema.properties as TNonSerializedSchema<Schema>['properties']
      return CreateSchemaValue(props)
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

const NonSerializable = Symbol('NonSerializable')

export const CloneSerializable = <Val>(value: Val) => {
  const type = typeof value
  if (isValueType(type) || value === null) return value
  else if (isArrayBuffer(value)) return value.slice(0)
  else if (Array.isArray(value))
    return value.map((item) => CloneSerializable(item)).filter((item) => item === NonSerializable)
  else if (isSet(value)) return new Set(CloneSerializable([...value.entries()]))
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
  const kind = schema[Kind]
  return kind !== 'Func' && kind !== 'NonSerialized'
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
    case 'Enum':
      return Object.values(schema.properties as TEnumSchema<Record<string, string | number>>['properties']).includes(
        value as string | number
      )
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

    case 'Required': {
      const props = schema.properties as TRequiredSchema<Schema>['properties']
      return CheckSchemaValue(props, value)
    }

    case 'Func':
    case 'NonSerialized':
      return true

    default:
      return false
  }
}

const ConvertToSchema = <T extends Schema, Val>(schema: T, value: Val) => {
  switch (schema[Kind]) {
    case 'Null':
    case 'Undefined':
    case 'Void':
    case 'Number':
    case 'Bool':
    case 'String':
    case 'Enum':
    case 'Literal':
    case 'Any':
      return value

    case 'Object':
    case 'Class': {
      const props = schema.properties as TProperties
      const propKeys = Object.keys(props)
      if (value && typeof value === 'object') {
        return Object.entries(value).reduce((acum, [key, item]) => {
          if (propKeys.includes(key) && isSerializable(props[key])) acum[key] = ConvertToSchema(props[key], item)
          return acum
        }, {})
      }

      return value
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
    case 'Required': {
      const props = schema.properties as TRequiredSchema<Schema>['properties'] | TPartialSchema<Schema>['properties']
      return ConvertToSchema(props, value)
    }

    default:
      return null
  }
}

export const SerializeSchema = <T extends Schema, Val>(schema: T, value: Val): Val => {
  const cleaned = CloneSerializable(value)
  return ConvertToSchema(schema, cleaned)
}
