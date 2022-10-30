import { Color, Texture } from 'three'

export const BoolArg = { default: false, type: 'boolean' }

export const FloatArg = { default: 0.0, type: 'float' }
export const NormalizedFloatArg = { ...FloatArg, min: 0.0, max: 1.0, type: 'normalized-float' }

export const Vec2Arg = { default: [1, 1], type: 'vec2' }
export const Vec3Arg = { default: [1, 1, 1], type: 'vec3' }
export const ColorArg = { default: new Color(), type: 'color' }

export const TextureArg = { default: undefined, type: 'texture' }

export const SelectArg = { default: '', options: [], type: 'select' }
export const StringArg = { default: '', type: 'string' }
export const ShaderArg = { default: '', type: 'shader' }

export const ObjectArg = { default: {}, type: 'object' }

export function getDefaultType(value) {
  switch (typeof value) {
    case 'boolean':
    case 'string':
      return typeof value
    case 'number':
      return 'float'
    case 'object':
      if ((value as Texture).isTexture) {
        return 'texture'
      }
      if ((value as Color).isColor) {
        return 'color'
      }
    //todo: vectors, selects, objects
    default:
      return ''
  }
}

export function generateDefaults(value) {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([k, v]) => getDefaultType(v))
      .map(([k, v]) => {
        return [
          k,
          {
            type: getDefaultType(v),
            default: v
          }
        ]
      })
  )
}
