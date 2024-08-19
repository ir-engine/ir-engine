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

import { makeInNOutFunctionDesc } from '../../../../VisualScriptModule'
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
} from '../../values/internal/Vec4'

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
