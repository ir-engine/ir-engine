import { Color, ColorRepresentation, Vector2, Vector3 } from 'three'

export enum PropertyType {
  COLOR,
  NUMBER,
  STRING,
  VECTOR2,
  VECTOR3,
  SELECT
}

export type Schema<T> = {
  allowNull?: boolean
  defaultValue?: T
}

export type ColorSchema = {
  type: PropertyType.COLOR
} & Schema<Color>

export type NumberSchema = {
  type: PropertyType.NUMBER
  min?: number
  max?: number
  steps?: number[]
  unit?: string
} & Schema<number>

export type StringSchema = {
  type: PropertyType.STRING
} & Schema<string>

export type Vector2Schema = {
  type: PropertyType.VECTOR2
} & Schema<Vector2>

export type Vector3Schema = {
  type: PropertyType.VECTOR3
} & Schema<Vector3>

export type SelectSchema<T> = {
  type: PropertyType.SELECT
} & Schema<T>

export type ComponentSchema<T, S = any> = {
  [key in keyof T]: ColorSchema | NumberSchema | StringSchema | Vector2Schema | Vector3Schema | SelectSchema<S>
}

export const parseColor = (schema: ColorSchema, value?: ColorRepresentation): Color | undefined => {
  if (!value) {
    if (schema.allowNull) return
    else return schema.defaultValue?.clone()
  }

  return new Color(value)
}

export const parseNumber = (schema: NumberSchema, value?: number) => {
  if (!value) {
    if (schema.allowNull) return
    else return schema.defaultValue
  }

  if (schema.min) value = Math.min(schema.min, value)
  if (schema.max) value = Math.max(schema.max, value)

  return value
}

export const parseString = (schema: StringSchema, value?: string): string | undefined => {
  if (!value) {
    if (schema.allowNull) return
    else return schema.defaultValue
  }

  return value
}

export const parseVector2 = (schema: Vector2Schema, value?: Vector2): Vector2 | undefined => {
  if (!value) {
    if (schema.allowNull) return
    else return schema.defaultValue?.clone()
  }

  return new Vector2(value.x, value.y)
}

export const parseVector3 = (schema: Vector3Schema, value?: Vector3): Vector3 | undefined => {
  console.debug(value)
  if (!value) {
    if (schema.allowNull) return
    else return schema.defaultValue?.clone()
  }

  return new Vector3(value.x, value.y, value.z)
}

export const parseSelect = <T>(schema: SelectSchema<T>, value?: T): T | undefined => {
  if (!value) {
    if (schema.allowNull) return
    else return schema.defaultValue
  }

  return value
}

export const parseProperties = <T>(props: any, schema: ComponentSchema<T>): T => {
  if (!props) props = {} as T

  const result = {} as T

  const keys = Object.keys(schema)

  for (const key of keys) {
    if (!Object.hasOwnProperty.call(schema, key)) continue

    switch (schema[key].type) {
      case PropertyType.COLOR:
        result[key] = parseColor(schema[key] as ColorSchema, props[key])
        break
      case PropertyType.NUMBER:
        result[key] = parseNumber(schema[key] as NumberSchema, props[key])
        break
      case PropertyType.STRING:
        result[key] = parseString(schema[key] as StringSchema, props[key])
        break
      case PropertyType.VECTOR2:
        result[key] = parseVector2(schema[key] as Vector2Schema, props[key])
        break
      case PropertyType.VECTOR3:
        result[key] = parseVector3(schema[key] as Vector3Schema, props[key])
        break
      case PropertyType.SELECT:
        result[key] = parseSelect(schema[key] as SelectSchema<T>, props[key])
        break
    }
  }

  return result
}
