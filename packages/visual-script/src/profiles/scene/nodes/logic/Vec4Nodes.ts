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
  Vec4,
  vec4Add,
  vec4Dot,
  vec4Equals,
  vec4Length,
  vec4Mix,
  vec4MultiplyByScalar,
  vec4Negate,
  vec4Normalize,
  vec4Subtract
} from '../../values/internal/Vec4'

export const Constant = makeInNOutFunctionDesc({
  name: 'math/vec4/constant',
  label: 'Vec4',
  in: ['vec4'],
  out: 'vec4',
  exec: (a) => a
})

export const Create = makeInNOutFunctionDesc({
  name: 'math/float/convert/toVec4',
  label: 'Float to Vec4',
  in: [{ x: 'float' }, { y: 'float' }, { z: 'float' }, { w: 'float' }],
  out: 'vec4',
  exec: (x: number, y: number, z: number, w: number) => new Vec4(x, y, z, w)
})

export const Elements = makeInNOutFunctionDesc({
  name: 'math/vec4/convert/toFloat',
  label: 'Vec4 to Float',
  in: ['vec4'],
  out: [{ x: 'float' }, { y: 'float' }, { z: 'float' }, { w: 'float' }],
  exec: (a: Vec4) => {
    return { x: a.x, y: a.y, z: a.z, w: a.z }
  }
})

export const Add = makeInNOutFunctionDesc({
  name: 'math/vec4/basic/add',
  label: '+',
  in: ['vec4', 'vec4'],
  out: 'vec4',
  exec: vec4Add
})

export const Subtract = makeInNOutFunctionDesc({
  name: 'math/vec4/basic/subtract',
  label: '-',
  in: ['vec4', 'vec4'],
  out: 'vec4',
  exec: vec4Subtract
})

export const Negate = makeInNOutFunctionDesc({
  name: 'math/vec4/negate',
  label: '-',
  in: ['vec4'],
  out: 'vec4',
  exec: vec4Negate
})

export const Scale = makeInNOutFunctionDesc({
  name: 'math/vec4/basic/scale',
  label: '×',
  in: ['vec4', 'float'],
  out: 'vec4',
  exec: vec4MultiplyByScalar
})

export const Length = makeInNOutFunctionDesc({
  name: 'math/vec4/length',
  label: 'Length',
  in: ['vec4'],
  out: 'float',
  exec: vec4Length
})

export const Normalize = makeInNOutFunctionDesc({
  name: 'math/vec4/normalize',
  label: 'Normalize',
  in: ['vec4'],
  out: 'vec4',
  exec: vec4Normalize
})

export const Dot = makeInNOutFunctionDesc({
  name: 'math/vec4/basic/dot',
  label: 'Dot Product',
  in: ['vec4', 'vec4'],
  out: 'float',
  exec: vec4Dot
})

export const Mix = makeInNOutFunctionDesc({
  name: 'math/vec4/basic/mix',
  label: '÷',
  in: [{ a: 'vec4' }, { b: 'vec4' }, { t: 'float' }],
  out: 'vec4',
  exec: vec4Mix
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/vec4/compare/equal',
  label: '=',
  in: [{ a: 'vec4' }, { b: 'vec4' }, { tolerance: 'float' }],
  out: 'boolean',
  exec: vec4Equals
})
