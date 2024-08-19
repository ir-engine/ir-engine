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
  hexToRGB,
  hslToRGB,
  rgbToHex,
  rgbToHSL,
  Vec3,
  vec3Add,
  vec3Equals,
  vec3Mix,
  vec3MultiplyByScalar,
  vec3Negate,
  vec3Subtract
} from '../../values/internal/Vec3'

export const Constant = makeInNOutFunctionDesc({
  name: 'math/color/constant',
  label: 'Color',
  in: ['color'],
  out: 'color',
  exec: (a: Vec3) => a
})

export const Create = makeInNOutFunctionDesc({
  name: 'math/color/convert/toColor/rgb',
  label: 'RGB To Color',
  in: [{ r: 'float' }, { g: 'float' }, { b: 'float' }],
  out: 'color',
  exec: (r: number, g: number, b: number) => new Vec3(r, g, b)
})

export const Elements = makeInNOutFunctionDesc({
  name: 'math/color/toRgb',
  label: 'Color to RGB',
  in: ['color'],
  out: [{ r: 'float' }, { g: 'float' }, { b: 'float' }],
  exec: (a: Vec3) => {
    return { r: a.x, g: a.y, b: a.z }
  }
})

export const Add = makeInNOutFunctionDesc({
  name: 'math/color/basic/add',
  label: '+',
  in: ['color', 'color'],
  out: 'color',
  exec: vec3Add
})

export const Subtract = makeInNOutFunctionDesc({
  name: 'math/color/basic/subtract',
  label: '-',
  in: ['color', 'color'],
  out: 'color',
  exec: vec3Subtract
})

export const Negate = makeInNOutFunctionDesc({
  name: 'math/color/negate',
  label: '-',
  in: ['color'],
  out: 'color',
  exec: vec3Negate
})

export const Scale = makeInNOutFunctionDesc({
  name: 'math/color/basic/scale',
  label: '×',
  in: ['color', 'float'],
  out: 'color',
  exec: vec3MultiplyByScalar
})

export const Mix = makeInNOutFunctionDesc({
  name: 'math/color/basic/mix',
  label: '÷',
  in: [{ a: 'color' }, { b: 'color' }, { t: 'float' }],
  out: 'color',
  exec: vec3Mix
})

export const HslToColor = makeInNOutFunctionDesc({
  name: 'math/color/convert/toColor/hsl',
  label: 'HSL to Color',
  in: ['vec3'],
  out: 'color',
  exec: hslToRGB
})

export const ColorToHsl = makeInNOutFunctionDesc({
  name: 'math/color/toHsl',
  label: 'Color to HSL',
  in: ['color'],
  out: 'vec3',
  exec: rgbToHSL
})

export const HexToColor = makeInNOutFunctionDesc({
  name: 'math/color/convert/toColor/hex',
  label: 'HEX to Color',
  in: ['float'],
  out: 'color',
  exec: hexToRGB
})

export const ColorToHex = makeInNOutFunctionDesc({
  name: 'math/color/toHex',
  label: 'Color to HEX',
  in: ['color'],
  out: 'float',
  exec: rgbToHex
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/color/compare/equal',
  label: '=',
  in: [{ a: 'color' }, { b: 'color' }, { tolerance: 'float' }],
  out: 'boolean',
  exec: vec3Equals
})
