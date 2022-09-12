import { Color } from 'three'

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
