import { makeInNOutFunctionDesc } from '../../../../VisualScriptModule.js'
import {
  angleAxisToQuat,
  eulerToQuat,
  mat3ToQuat,
  mat4ToQuat,
  quatConjugate,
  quatExp,
  quatLn,
  quatMultiply,
  quatPow,
  quatSlerp,
  Vec4,
  vec4Dot,
  vec4Equals,
  vec4Length,
  vec4MultiplyByScalar,
  vec4Normalize,
  vec4ToArray
} from '../../Values/Internal/Vec4.js'

/*
- from Angle Axis
- from Euler
- to Angle Axis
- to Euler
- Conjugate
- Multiply
- Slerp
- Squad
- Scale
- 
*/

export const Constant = makeInNOutFunctionDesc({
  name: 'math/quat/constants',
  label: 'Quaternion',
  in: ['quat'],
  out: 'quat',
  exec: (a: Vec4) => a
})

export const Create = makeInNOutFunctionDesc({
  name: 'math/float/convert/toQuat',
  label: 'Float to Quat',
  in: [{ x: 'float' }, { y: 'float' }, { z: 'float' }, { w: 'float' }],
  out: 'quat',
  exec: (x: number, y: number, z: number, w: number) => new Vec4(x, y, z, w)
})

export const Elements = makeInNOutFunctionDesc({
  name: 'math/quat/convert/toFloat',
  label: 'Quat to Float',
  in: ['quat'],
  out: [{ x: 'float' }, { y: 'float' }, { z: 'float' }, { w: 'float' }],
  exec: vec4ToArray
})

export const Negate = makeInNOutFunctionDesc({
  name: 'math/quat/conjugate',
  label: 'Conjugate',
  in: ['quat'],
  out: 'quat',
  exec: quatConjugate
})

export const Multiply = makeInNOutFunctionDesc({
  name: 'math/quat/basic/multiply',
  label: '×',
  in: ['quat', 'quat'],
  out: 'quat',
  exec: quatMultiply
})

export const Scale = makeInNOutFunctionDesc({
  name: 'math/quat/basic/scale',
  label: '×',
  in: ['quat', 'float'],
  out: 'quat',
  exec: vec4MultiplyByScalar
})

export const Length = makeInNOutFunctionDesc({
  name: 'math/quat/length',
  label: 'Length',
  in: ['quat'],
  out: 'float',
  exec: vec4Length
})

export const Normalize = makeInNOutFunctionDesc({
  name: 'math/quat/normalize',
  label: 'Normalize',
  in: ['quat'],
  out: 'quat',
  exec: vec4Normalize
})

export const Dot = makeInNOutFunctionDesc({
  name: 'math/quat/basic/dot',
  label: 'Dot Product',
  in: ['quat', 'quat'],
  out: 'float',
  exec: vec4Dot
})

export const Ln = makeInNOutFunctionDesc({
  name: 'math/quat/transcendental/ln',
  label: 'Ln',
  in: ['quat'],
  out: 'quat',
  exec: quatLn
})

export const Exp = makeInNOutFunctionDesc({
  name: 'math/quat/transcendental/exp',
  label: 'Exp',
  in: ['quat'],
  out: 'quat',
  exec: quatExp
})

export const Pow = makeInNOutFunctionDesc({
  name: 'math/quat/transcendental/pow',
  label: 'Pow',
  in: ['quat', 'float'],
  out: 'quat',
  exec: quatPow
})

export const Mat3ToQuat = makeInNOutFunctionDesc({
  name: 'math/mat3/convert/toQuat',
  label: 'To Quat',
  in: ['mat3'],
  out: 'quat',
  exec: mat3ToQuat
})

export const Mat4ToQuat = makeInNOutFunctionDesc({
  name: 'math/mat4/convert/toQuat',
  label: 'To Quat',
  in: ['mat4'],
  out: 'quat',
  exec: mat4ToQuat
})

export const EulerToQuat = makeInNOutFunctionDesc({
  name: 'math/euler/convert/toQuat',
  label: '÷',
  in: ['euler'],
  out: 'quat',
  exec: eulerToQuat
})

export const AngleAxisToQuat = makeInNOutFunctionDesc({
  name: 'math/quat/convert/toQuat/angleAxis',
  label: 'Angle Axis to Quat',
  in: ['float', 'vec3'],
  out: 'quat',
  exec: angleAxisToQuat
})

export const Slerp = makeInNOutFunctionDesc({
  name: 'math/quat/slerp',
  label: 'Slerp',
  in: [{ a: 'quat' }, { b: 'quat' }, { t: 'float' }],
  out: 'quat',
  exec: quatSlerp
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/quat/compare/equal',
  label: '=',
  in: [{ a: 'quat' }, { b: 'quat' }, { tolerance: 'float' }],
  out: 'boolean',
  exec: vec4Equals
})
