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
  column3ToMat3,
  eulerToMat3,
  Mat3,
  mat3Add,
  mat3Determinant,
  mat3Equals,
  mat3Inverse,
  mat3Mix,
  mat3Multiply,
  mat3MultiplyByScalar,
  mat3Negate,
  mat3SetColumn3,
  mat3SetRow3,
  mat3Subtract,
  mat3ToScale2,
  mat3ToTranslation2,
  mat3Transpose,
  mat4ToMat3,
  scale2ToMat3,
  translation2ToMat3
} from '../../values/internal/Mat3'

export const Constant = makeInNOutFunctionDesc({
  name: 'math/mat3/constant',
  label: 'Mat3',
  in: ['mat3'],
  out: 'mat3',
  exec: (a: Mat3) => a
})

export const Column3ToMat3 = makeInNOutFunctionDesc({
  name: 'math/mat3/convert/toMat3/column3',
  label: 'Columns to Mat3',
  in: ['vec3', 'vec3', 'vec3'],
  out: 'mat3',
  exec: column3ToMat3
})

export const SetColumn = makeInNOutFunctionDesc({
  name: 'math/mat3/setColumn',
  label: 'Set Column',
  in: ['mat3', 'integer', 'vec3'],
  out: 'mat3',
  exec: mat3SetColumn3
})

export const SetRow = makeInNOutFunctionDesc({
  name: 'math/mat3/setRow',
  label: 'Set Row',
  in: ['mat3', 'integer', 'vec3'],
  out: 'mat3',
  exec: mat3SetRow3
})

export const Elements = makeInNOutFunctionDesc({
  name: 'math/mat3/convert/toVec3',
  label: 'Mat3 To Vec3',
  in: ['mat3'],
  out: [{ x: 'vec3' }, { y: 'vec3' }, { z: 'vec3' }],
  exec: (a: Mat3) => {
    throw new Error('not implemented')
  }
})

export const Add = makeInNOutFunctionDesc({
  name: 'math/mat3/basic/add',
  label: '+',
  in: ['mat3', 'mat3'],
  out: 'mat3',
  exec: mat3Add
})

export const Subtract = makeInNOutFunctionDesc({
  name: 'math/mat3/basic/subtract',
  label: '-',
  in: ['mat3', 'mat3'],
  out: 'mat3',
  exec: mat3Subtract
})

export const Negate = makeInNOutFunctionDesc({
  name: 'math/mat3/negate',
  label: '-',
  in: ['mat3'],
  out: 'mat3',
  exec: mat3Negate
})

export const Scale = makeInNOutFunctionDesc({
  name: 'math/mat3/basic/scale',
  label: '×',
  in: ['mat3', 'float'],
  out: 'mat3',
  exec: mat3MultiplyByScalar
})

export const Determinant = makeInNOutFunctionDesc({
  name: 'math/mat3/determinant',
  label: 'Determinant',
  in: ['mat3'],
  out: 'float',
  exec: mat3Determinant
})

export const Inverse = makeInNOutFunctionDesc({
  name: 'math/mat3/basic/inverse',
  label: 'Inverse',
  in: ['mat3'],
  out: 'mat3',
  exec: mat3Inverse
})

export const Mat4ToMat3 = makeInNOutFunctionDesc({
  name: 'math/mat4/convert/toMat3',
  label: 'Mat4 To Mat3',
  in: ['mat4'],
  out: 'mat3',
  exec: mat4ToMat3
})

export const Transpose = makeInNOutFunctionDesc({
  name: 'math/mat3/transpose',
  label: 'Transpose',
  in: ['mat3'],
  out: 'mat3',
  exec: mat3Transpose
})

export const Multiply = makeInNOutFunctionDesc({
  name: 'math/mat3/basic/multiply',
  label: 'Cross',
  in: ['mat3', 'mat3'],
  out: 'mat3',
  exec: mat3Multiply
})

export const Mix = makeInNOutFunctionDesc({
  name: 'math/mat3/basic/mix',
  label: '÷',
  in: [{ a: 'mat3' }, { b: 'mat3' }, { t: 'float' }],
  out: 'mat3',
  exec: mat3Mix
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/mat3/compare/equal',
  label: '=',
  in: [{ a: 'mat3' }, { b: 'mat3' }, { tolerance: 'float' }],
  out: 'boolean',
  exec: mat3Equals
})

export const EulerToMat3 = makeInNOutFunctionDesc({
  name: 'math/euler/convert/toMat3',
  label: 'To Mat3',
  in: ['euler'],
  out: 'mat3',
  exec: eulerToMat3
})

export const QuatToMat3 = makeInNOutFunctionDesc({
  name: 'math/quat/convert/toMat3',
  label: 'To Mat3',
  in: ['quat'],
  out: 'mat3',
  exec: eulerToMat3
})

export const Scale2ToMat3 = makeInNOutFunctionDesc({
  name: 'math/mat3/convert/toMat3/scale2',
  label: 'Scale2 To Mat3',
  in: ['vec2'],
  out: 'mat3',
  exec: scale2ToMat3
})

export const Mat3ToScale2 = makeInNOutFunctionDesc({
  name: 'math/mat3/toScale2',
  label: 'Mat3 to Scale2',
  in: ['mat3'],
  out: 'vec2',
  exec: mat3ToScale2
})

export const Translation2ToMat3 = makeInNOutFunctionDesc({
  name: 'math/mat3/convert/toMat3/translation2',
  label: 'Translation2 To Mat3',
  in: ['vec2'],
  out: 'mat3',
  exec: translation2ToMat3
})

export const Mat3ToTranslation3 = makeInNOutFunctionDesc({
  name: 'math/mat3/toTranslation2',
  label: 'Mat3 to Translation2',
  in: ['mat3'],
  out: 'vec2',
  exec: mat3ToTranslation2
})
