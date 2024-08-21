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
  column4ToMat4,
  eulerToMat4,
  mat3ToMat4,
  Mat4,
  mat4Add,
  mat4Adjoint,
  mat4Determinant,
  mat4Equals,
  mat4Inverse,
  mat4LookAt,
  mat4Mix,
  mat4Multiply,
  mat4MultiplyByScalar,
  mat4Negate,
  mat4RotateByEuler,
  mat4RotateByQuat,
  mat4Scale,
  mat4SetColumn4,
  mat4SetRow4,
  mat4Subtract,
  mat4TransformNormal3,
  mat4TransformPoint3,
  mat4Translate,
  mat4Transpose,
  quatToMat4,
  scale3ToMat4,
  translation3ToMat4
} from '../../values/internal/Mat4'

export const Constant = makeInNOutFunctionDesc({
  name: 'math/mat4/constant',
  label: 'Mat4',
  in: ['mat4'],
  out: 'mat4',
  exec: (a: Mat4) => a
})

export const Column4ToMat4 = makeInNOutFunctionDesc({
  name: 'math/mat4/convert/toMat4/column4',
  label: 'Columns to Mat4',
  in: [{ x: 'vec4' }, { y: 'vec4' }, { z: 'vec4' }, { w: 'vec4' }],
  out: 'mat4',
  exec: column4ToMat4
})

export const SetColumn = makeInNOutFunctionDesc({
  name: 'math/mat4/setColumn',
  label: 'Set Column',
  in: ['mat4', 'integer', 'vec4'],
  out: 'mat4',
  exec: mat4SetColumn4
})

export const SetRow = makeInNOutFunctionDesc({
  name: 'math/mat4/setRow',
  label: 'Set Row',
  in: ['mat4', 'integer', 'vec4'],
  out: 'mat4',
  exec: mat4SetRow4
})

export const Elements = makeInNOutFunctionDesc({
  name: 'math/mat4/convert/toVec4', // should include columns4 in the name?
  label: 'Mat4 To Vec4',
  in: ['mat4'],
  out: [{ x: 'vec4' }, { y: 'vec4' }, { z: 'vec4' }, { w: 'vec4' }],
  exec: () => {
    throw new Error('not implemented')
  }
})

export const Add = makeInNOutFunctionDesc({
  name: 'math/mat4/basic/add',
  label: '+',
  in: ['mat4', 'mat4'],
  out: 'mat4',
  exec: mat4Add
})

export const Subtract = makeInNOutFunctionDesc({
  name: 'math/mat4/basic/subtract',
  label: '-',
  in: ['mat4', 'mat4'],
  out: 'mat4',
  exec: mat4Subtract
})

export const Negate = makeInNOutFunctionDesc({
  name: 'math/mat4/negate',
  label: '-',
  in: ['mat4'],
  out: 'mat4',
  exec: mat4Negate
})

export const MultiplyByScalar = makeInNOutFunctionDesc({
  name: 'math/mat4/basic/multiplyByScalar',
  label: '×',
  in: ['mat4', 'float'],
  out: 'mat4',
  exec: mat4MultiplyByScalar
})

export const Determinant = makeInNOutFunctionDesc({
  name: 'math/mat4/determinant',
  label: 'Determinant',
  in: ['mat4'],
  out: 'float',
  exec: mat4Determinant
})

export const Adjoint = makeInNOutFunctionDesc({
  name: 'math/mat4/basic/adjoint',
  label: 'Adjoint',
  in: ['mat4'],
  out: 'mat4',
  exec: mat4Adjoint
})

export const Inverse = makeInNOutFunctionDesc({
  name: 'math/mat4/basic/inverse',
  label: 'Inverse',
  in: ['mat4'],
  out: 'mat4',
  exec: mat4Inverse
})

export const Transpose = makeInNOutFunctionDesc({
  name: 'math/mat4/transpose',
  label: 'Transpose',
  in: ['mat4'],
  out: 'mat4',
  exec: mat4Transpose
})

export const Mat3ToMat4 = makeInNOutFunctionDesc({
  name: 'math/mat3/convert/toMat4',
  label: 'Mat3 To Mat4',
  in: ['mat3'],
  out: 'mat4',
  exec: mat3ToMat4
})

export const Scale3ToMat4 = makeInNOutFunctionDesc({
  name: 'math/mat4/convert/toMat4/scale3',
  label: 'Scale3 To Mat4',
  in: ['vec3'],
  out: 'mat4',
  exec: scale3ToMat4
})

export const Translate3ToMat4 = makeInNOutFunctionDesc({
  name: 'math/mat4/convert/toMat4/translate3',
  label: 'Translate3 To Mat4',
  in: ['vec3'],
  out: 'mat4',
  exec: translation3ToMat4
})

export const QuatToMat4 = makeInNOutFunctionDesc({
  name: 'math/quat/convert/toMat4',
  label: 'Quat To Mat4',
  in: ['quat'],
  out: 'mat4',
  exec: quatToMat4
})

export const EulerToMat4 = makeInNOutFunctionDesc({
  name: 'math/euler/convert/toMat4',
  label: 'Euler To Mat4',
  in: ['euler'],
  out: 'mat4',
  exec: eulerToMat4
})

export const Translate = makeInNOutFunctionDesc({
  name: 'math/mat4/translate',
  label: 'Translate',
  in: ['mat4', 'vec3'],
  out: 'mat4',
  exec: mat4Translate
})

export const Scale = makeInNOutFunctionDesc({
  name: 'math/mat4/basic/scale',
  label: 'Scale',
  in: ['mat4', 'vec3'],
  out: 'mat4',
  exec: mat4Scale
})

export const RotateByQuat = makeInNOutFunctionDesc({
  name: 'math/mat4/rotateByQuat',
  label: 'Rotate',
  in: ['mat4', 'quat'],
  out: 'mat4',
  exec: mat4RotateByQuat
})

export const RotateByEuler = makeInNOutFunctionDesc({
  name: 'math/mat4/rotateByEuler',
  label: 'Rotate',
  in: ['mat4', 'euler'],
  out: 'mat4',
  exec: mat4RotateByEuler
})

export const Multiply = makeInNOutFunctionDesc({
  name: 'math/mat4/basic/multiply',
  label: 'Matrix4 Multiply',
  in: ['mat4', 'mat4'],
  out: 'mat4',
  exec: mat4Multiply
})

export const Mix = makeInNOutFunctionDesc({
  name: 'math/mat4/basic/mix',
  label: 'Matrix4 Mix',
  in: [{ a: 'mat4' }, { b: 'mat4' }, { t: 'float' }],
  out: 'mat4',
  exec: mat4Mix
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/mat4/convert/equal',
  label: '=',
  in: [{ a: 'mat4' }, { b: 'mat4' }, { tolerance: 'float' }],
  out: 'boolean',
  exec: mat4Equals
})

export const TransformPoint3 = makeInNOutFunctionDesc({
  name: 'math/mat4/transformPoint3',
  label: 'Transform Point3',
  in: ['mat4', 'vec3'],
  out: 'vec3',
  exec: mat4TransformPoint3
})

export const TransformNormal3 = makeInNOutFunctionDesc({
  name: 'math/mat4/transformNormal3',
  label: 'Transform Normal',
  in: ['mat4', 'vec3'],
  out: 'vec3',
  exec: mat4TransformNormal3
})

export const LookAt = makeInNOutFunctionDesc({
  name: 'math/mat4/lookAt',
  label: 'Look At',
  in: [{ eye: 'vec3' }, { target: 'vec3' }, { up: 'vec3' }],
  out: 'mat4',
  exec: mat4LookAt
})
