/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { makeInNOutFunctionDesc } from '../../../../'

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
} from '../../Values/Internal/Vec3.js'

export const Constant = makeInNOutFunctionDesc({
  name: 'math/vec3',
  label: 'Vec3',
  in: ['vec3'],
  out: 'vec3',
  exec: (a: Vec3) => a
})

export const Create = makeInNOutFunctionDesc({
  name: 'math/toVec3/float',
  label: 'Float to Vec3',
  in: [{ x: 'float' }, { y: 'float' }, { z: 'float' }],
  out: 'vec3',
  exec: (x: number, y: number, z: number) => new Vec3(x, y, z)
})

export const Elements = makeInNOutFunctionDesc({
  name: 'math/toFloat/vec3',
  label: 'Vec3 To Float',
  in: ['vec3'],
  out: [{ x: 'float' }, { y: 'float' }, { z: 'float' }],
  exec: () => {
    throw new Error('not implemented')
  }
})

export const Add = makeInNOutFunctionDesc({
  name: 'math/add/vec3',
  label: '+',
  in: ['vec3', 'vec3'],
  out: 'vec3',
  exec: vec3Add
})

export const Subtract = makeInNOutFunctionDesc({
  name: 'math/subtract/vec3',
  label: '-',
  in: ['vec3', 'vec3'],
  out: 'vec3',
  exec: vec3Subtract
})

export const Negate = makeInNOutFunctionDesc({
  name: 'math/negate/vec3',
  label: '-',
  in: ['vec3'],
  out: 'vec3',
  exec: vec3Negate
})

export const Scale = makeInNOutFunctionDesc({
  name: 'math/scale/vec3',
  label: '×',
  in: ['vec3', 'float'],
  out: 'vec3',
  exec: vec3MultiplyByScalar
})

export const Length = makeInNOutFunctionDesc({
  name: 'math/length/vec3',
  label: 'Length',
  in: ['vec3'],
  out: 'float',
  exec: vec3Length
})

export const Normalize = makeInNOutFunctionDesc({
  name: 'math/normalize/vec3',
  label: 'Normalize',
  in: ['vec3'],
  out: 'vec3',
  exec: vec3Normalize
})

export const Cross = makeInNOutFunctionDesc({
  name: 'math/cross/vec3',
  label: 'Cross',
  in: ['vec3', 'vec3'],
  out: 'vec3',
  exec: vec3Cross
})

export const Dot = makeInNOutFunctionDesc({
  name: 'math/dot/vec3',
  label: 'Dot',
  in: ['vec3', 'vec3'],
  out: 'float',
  exec: vec3Dot
})

export const Mix = makeInNOutFunctionDesc({
  name: 'math/mix/vec3',
  label: '÷',
  in: [{ a: 'vec3' }, { b: 'vec3' }, { t: 'float' }],
  out: 'vec3',
  exec: vec3Mix
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/equal/vec3',
  label: '=',
  in: [{ a: 'vec3' }, { b: 'vec3' }, { tolerance: 'float' }],
  out: 'boolean',
  exec: vec3Equals
})
