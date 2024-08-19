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
  Vec3,
  vec3Add,
  vec3Cross,
  vec3Dot,
  vec3Equals,
  vec3Length,
  vec3Mix,
  vec3MultiplyByScalar,
  vec3Negate,
  vec3Normalize,
  vec3Subtract
} from '../../values/internal/Vec3'

export const Constant = makeInNOutFunctionDesc({
  name: 'math/vec3/constant',
  label: 'Vec3',
  in: ['vec3'],
  out: 'vec3',
  exec: (a: Vec3) => a
})

export const Create = makeInNOutFunctionDesc({
  name: 'math/float/convert/toVec3',
  label: 'Float to Vec3',
  in: [{ x: 'float' }, { y: 'float' }, { z: 'float' }],
  out: 'vec3',
  exec: (x: number, y: number, z: number) => new Vec3(x, y, z)
})

export const Elements = makeInNOutFunctionDesc({
  name: 'math/vec3/convert/toFloat',
  label: 'Vec3 To Float',
  in: ['vec3'],
  out: [{ x: 'float' }, { y: 'float' }, { z: 'float' }],
  exec: (a: Vec3) => {
    return { x: a.x, y: a.y, z: a.z }
  }
})

export const Add = makeInNOutFunctionDesc({
  name: 'math/vec3/basic/add',
  label: '+',
  in: ['vec3', 'vec3'],
  out: 'vec3',
  exec: vec3Add
})

export const Subtract = makeInNOutFunctionDesc({
  name: 'math/vec3/basic/subtract',
  label: '-',
  in: ['vec3', 'vec3'],
  out: 'vec3',
  exec: vec3Subtract
})

export const Negate = makeInNOutFunctionDesc({
  name: 'math/vec3/negate',
  label: '-',
  in: ['vec3'],
  out: 'vec3',
  exec: vec3Negate
})

export const Scale = makeInNOutFunctionDesc({
  name: 'math/vec3/basic/scale',
  label: '×',
  in: ['vec3', 'float'],
  out: 'vec3',
  exec: vec3MultiplyByScalar
})

export const Length = makeInNOutFunctionDesc({
  name: 'math/vec3/length',
  label: 'Length',
  in: ['vec3'],
  out: 'float',
  exec: vec3Length
})

export const Normalize = makeInNOutFunctionDesc({
  name: 'math/vec3/normalize',
  label: 'Normalize',
  in: ['vec3'],
  out: 'vec3',
  exec: vec3Normalize
})

export const Cross = makeInNOutFunctionDesc({
  name: 'math/vec3/basic/cross',
  label: 'Cross',
  in: ['vec3', 'vec3'],
  out: 'vec3',
  exec: vec3Cross
})

export const Dot = makeInNOutFunctionDesc({
  name: 'math/vec3/basic/dot',
  label: 'Dot',
  in: ['vec3', 'vec3'],
  out: 'float',
  exec: vec3Dot
})

export const Mix = makeInNOutFunctionDesc({
  name: 'math/vec3/basic/mix',
  label: '÷',
  in: [{ a: 'vec3' }, { b: 'vec3' }, { t: 'float' }],
  out: 'vec3',
  exec: vec3Mix
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/vec3/compare/equal',
  label: '=',
  in: [{ a: 'vec3' }, { b: 'vec3' }, { tolerance: 'float' }],
  out: 'boolean',
  exec: vec3Equals
})
