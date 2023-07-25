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
  mat3ToEuler,
  mat4ToEuler,
  quatToEuler,
  Vec3,
  vec3Add,
  vec3Equals,
  vec3Mix,
  vec3MultiplyByScalar,
  vec3Negate,
  vec3Subtract
} from '../../Values/Internal/Vec3.js'

export const Constant = makeInNOutFunctionDesc({
  name: 'math/euler',
  label: 'Euler',
  in: ['euler'],
  out: 'euler',
  exec: (a: Vec3) => a
})

export const Create = makeInNOutFunctionDesc({
  name: 'math/toEuler/float',
  label: 'Float to Euler',
  in: [{ x: 'float' }, { y: 'float' }, { z: 'float' }],
  out: 'euler',
  exec: (x: number, y: number, z: number) => new Vec3(x, y, z)
})

export const Elements = makeInNOutFunctionDesc({
  name: 'math/toFloat/euler',
  label: 'Euler to Float',
  in: ['euler'],
  out: [{ x: 'float' }, { y: 'float' }, { z: 'float' }],
  exec: (a: Vec3) => {
    return { x: a.x, y: a.y, z: a.z }
  }
})

export const Add = makeInNOutFunctionDesc({
  name: 'math/add/euler',
  label: '+',
  in: ['euler', 'euler'],
  out: 'euler',
  exec: vec3Add
})

export const Subtract = makeInNOutFunctionDesc({
  name: 'math/subtract/euler',
  label: '-',
  in: ['euler', 'euler'],
  out: 'euler',
  exec: vec3Subtract
})

export const Negate = makeInNOutFunctionDesc({
  name: 'math/negate/euler',
  label: '-',
  in: ['euler'],
  out: 'euler',
  exec: vec3Negate
})

export const Scale = makeInNOutFunctionDesc({
  name: 'math/scale/euler',
  label: '×',
  in: ['euler', 'float'],
  out: 'euler',
  exec: vec3MultiplyByScalar
})

export const Mix = makeInNOutFunctionDesc({
  name: 'math/mix/euler',
  label: '÷',
  in: [{ a: 'euler' }, { b: 'euler' }, { t: 'float' }],
  out: 'euler',
  exec: (a: Vec3, b: Vec3, t: number) => {
    console.warn('TODO: this is not shortest path')
    return vec3Mix(a, b, t)
  }
})

export const Mat3ToEuler = makeInNOutFunctionDesc({
  name: 'math/toEuler/mat3',
  label: 'To Euler',
  in: ['mat3'],
  out: 'euler',
  exec: mat3ToEuler
})

export const Mat4ToEuler = makeInNOutFunctionDesc({
  name: 'math/toEuler/mat4',
  label: 'To Euler',
  in: ['mat4'],
  out: 'euler',
  exec: mat4ToEuler
})

export const QuatToEuler = makeInNOutFunctionDesc({
  name: 'math/toEuler/quat',
  label: 'To Euler',
  in: ['quat'],
  out: 'euler',
  exec: quatToEuler
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/equal/euler',
  label: '=',
  in: [{ a: 'euler' }, { b: 'euler' }, { tolerance: 'float' }],
  out: 'boolean',
  exec: vec3Equals
})
