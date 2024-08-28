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
  Vec2,
  vec2Add,
  vec2Dot,
  vec2Equals,
  vec2Length,
  vec2Mix,
  vec2MultiplyByScalar,
  vec2Negate,
  vec2Normalize,
  vec2Subtract,
  vec2ToArray
} from '../../values/internal/Vec2'

export const Constant = makeInNOutFunctionDesc({
  name: 'math/vec2/constant',
  label: 'Vec2',
  in: ['vec2'],
  out: 'vec2',
  exec: (a: Vec2) => a
})

export const Create = makeInNOutFunctionDesc({
  name: 'math/float/convert/toVec2',
  label: 'Float to Vec2',
  in: [{ x: 'float' }, { y: 'float' }],
  out: 'vec2',
  exec: (x: number, y: number) => new Vec2(x, y)
})

export const Elements = makeInNOutFunctionDesc({
  name: 'math/vec2/convert/toFloat',
  label: 'Vec2 To Float',
  in: ['vec2'],
  out: [{ x: 'float' }, { y: 'float' }],
  exec: vec2ToArray
})

export const Add = makeInNOutFunctionDesc({
  name: 'math/vec2/basic/add',
  label: '+',
  in: ['vec2', 'vec2'],
  out: 'vec2',
  exec: vec2Add
})

export const Subtract = makeInNOutFunctionDesc({
  name: 'math/vec2/basic/subtract',
  label: '-',
  in: ['vec2', 'vec2'],
  out: 'vec2',
  exec: vec2Subtract
})

export const Negate = makeInNOutFunctionDesc({
  name: 'math/vec2/negate',
  label: '-',
  in: ['vec2'],
  out: 'vec2',
  exec: vec2Negate
})

export const Scale = makeInNOutFunctionDesc({
  name: 'math/vec2/basic/scale',
  label: '×',
  in: ['vec2', 'float'],
  out: 'vec2',
  exec: vec2MultiplyByScalar
})

export const Length = makeInNOutFunctionDesc({
  name: 'math/vec2/length',
  label: 'Length',
  in: ['vec2'],
  out: 'float',
  exec: vec2Length
})

export const Normalize = makeInNOutFunctionDesc({
  name: 'math/vec2/normalize',
  label: 'Normalize',
  in: ['vec2'],
  out: 'vec2',
  exec: vec2Normalize
})

export const Dot = makeInNOutFunctionDesc({
  name: 'math/vec2/basic/dot',
  label: 'Dot Product',
  in: ['vec2', 'vec2'],
  out: 'float',
  exec: vec2Dot
})

export const Mix = makeInNOutFunctionDesc({
  name: 'math/vec2/basic/mix',
  label: '÷',
  in: [{ a: 'vec2' }, { b: 'vec2' }, { t: 'float' }],
  out: 'vec2',
  exec: vec2Mix
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/vec2/compare/equal',
  label: '=',
  in: [{ a: 'vec2' }, { b: 'vec2' }, { tolerance: 'float' }],
  out: 'boolean',
  exec: vec2Equals
})
