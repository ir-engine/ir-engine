import { toQuat, toVector3, toVector4 } from '@behave-graph/scene'
import { Color, Matrix3, Matrix4, Quaternion, Vector2, Vector3, Vector4 } from 'three'

export const getSocketType = (value) => {
  switch (typeof value) {
    case 'number':
      if (name.toLowerCase().includes('entity')) return 'entity'
      else {
        return 'float'
      }
      // use float
      break
    case 'boolean':
      return 'boolean'
      // use boolean
      break
    case 'string':
    case 'undefined':
      return 'string'
    case 'object':
      if (value instanceof Vector2) {
        return 'vec2'
      } else if (value instanceof Vector3) {
        return 'vec3'
      } else if (value instanceof Vector4) {
        return 'vec4'
      } else if (value instanceof Quaternion) {
        return 'quat'
      } else if (value instanceof Matrix4) {
        return 'mat4'
      } else if (value instanceof Matrix3) {
        return 'mat3'
      } else if (value instanceof Color) {
        return 'color'
      }
      break
    case 'function':
      break
    default:
      return null
      break
    // add more objects later
  }
}

export function NodetoEnginetype(value, valuetype) {
  switch (valuetype) {
    case 'float':
    case 'integer':
      return Number(value)
      break
    case 'string':
      return String(value)
    case 'vec3':
    case 'vec2':
      return toVector3(value)
    case 'quat':
      return toQuat(value)
    case 'vec4':
      return toVector4(value)
    case 'mat4':
      return new Matrix4().fromArray(value.elements)
    case 'mat3':
      return new Matrix3().fromArray(value.elements)
    case 'color':
      return new Color().setFromVector3(value)
    case 'boolean':
      return Boolean(value)
    default:
  }
}

export function EnginetoNodetype(value) {
  if (typeof value === 'object') {
    if (value instanceof Color) {
      const style = value.getStyle() // 'rgb(255, 0, 0)'
      const rgbValues = style.match(/\d+/g)!.map(Number)
      return new Vector3(rgbValues[0], rgbValues[1], rgbValues[2])
    }
  }
  return value
}
