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

// Unreal Engine Blueprint Float nodes: https://docs.unrealengine.com/4.27/en-US/BlueprintAPI/Math/Float/

import {
  degreesToRadians,
  equalsTolerance,
  makeInNOutFunctionDesc,
  radiansToDegrees
} from '../../../VisualScriptModule'

export const Constant = makeInNOutFunctionDesc({
  name: 'math/float/constant',
  label: 'Float',
  in: ['float'],
  out: 'float',
  exec: (a: number) => a
})

export const Add = makeInNOutFunctionDesc({
  name: 'math/float/basic/add',
  label: '+',
  in: ['float', 'float'],
  out: 'float',
  exec: (a: number, b: number) => a + b
})

export const Subtract = makeInNOutFunctionDesc({
  name: 'math/float/basic/subtract',
  label: '-',
  in: ['float', 'float'],
  out: 'float',
  exec: (a: number, b: number) => a - b
})

export const Negate = makeInNOutFunctionDesc({
  name: 'math/float/negate',
  label: '-',
  in: ['float'],
  out: 'float',
  exec: (a: number) => -a
})

export const Multiply = makeInNOutFunctionDesc({
  name: 'math/float/basic/multiply',
  label: '×',
  in: ['float', 'float'],
  out: 'float',
  exec: (a: number, b: number) => a * b
})

export const Divide = makeInNOutFunctionDesc({
  name: 'math/float/basic/divide',
  label: '÷',
  in: ['float', 'float'],
  out: 'float',
  exec: (a: number, b: number) => a / b
})

export const Modulus = makeInNOutFunctionDesc({
  name: 'math/float/basic/modulus',
  label: 'MOD',
  in: ['float', 'float'],
  out: 'float',
  exec: (a: number, b: number) => a % b
})

export const Power = makeInNOutFunctionDesc({
  name: 'math/float/transcendental/pow',
  label: 'POW',
  in: ['float', 'float'],
  out: 'float',
  exec: Math.pow
})

export const SquareRoot = makeInNOutFunctionDesc({
  name: 'math/float/transcendental/sqrt',
  label: '√',
  in: ['float'],
  out: 'float',
  exec: Math.sqrt
})

export const E = makeInNOutFunctionDesc({
  name: 'math/float/constant/e',
  label: '𝑒',
  out: 'float',
  exec: () => Math.E
})

export const Phi = makeInNOutFunctionDesc({
  name: 'math/float/constant/phi',
  label: 'Φ',
  out: 'float',
  exec: () => 1.6180339887 // phi value
})

export const Exp = makeInNOutFunctionDesc({
  name: 'math/float/transcendental/exp',
  label: 'EXP',
  in: ['float'],
  out: 'float',
  exec: Math.exp
})

export const Ln = makeInNOutFunctionDesc({
  name: 'math/float/transcendental/ln',
  label: 'LN',
  in: ['float'],
  out: 'float',
  exec: Math.log
})

export const Log2 = makeInNOutFunctionDesc({
  name: 'math/float/transcendental/log2',
  label: 'LOG2',
  in: ['float'],
  out: 'float',
  exec: Math.log2
})

export const Log10 = makeInNOutFunctionDesc({
  name: 'math/float/transcendental/log10',
  label: 'LOG10',
  in: ['float'],
  out: 'float',
  exec: Math.log10
})

export const PI = makeInNOutFunctionDesc({
  name: 'math/float/constant/pi',
  label: 'π',
  out: 'float',
  exec: () => Math.PI
})

export const Sin = makeInNOutFunctionDesc({
  name: 'math/float/trig/sin',
  label: 'SIN',
  in: ['float'],
  out: 'float',
  exec: Math.sin
})

export const Asin = makeInNOutFunctionDesc({
  name: 'math/float/trig/asin',
  label: 'ASIN',
  in: ['float'],
  out: 'float',
  exec: Math.asin
})

export const Cos = makeInNOutFunctionDesc({
  name: 'math/float/trig/cos',
  label: 'COS',
  in: ['float'],
  out: 'float',
  exec: Math.cos
})

export const Acos = makeInNOutFunctionDesc({
  name: 'math/float/trig/acos',
  label: 'ACOS',
  in: ['float'],
  out: 'float',
  exec: Math.acos
})

export const Tan = makeInNOutFunctionDesc({
  name: 'math/float/trig/tan',
  label: 'TAN',
  in: ['float'],
  out: 'float',
  exec: Math.tan
})

export const RadiansToDegrees = makeInNOutFunctionDesc({
  name: 'math/float/trig/radiansToDegrees',
  label: 'To Degrees',
  in: ['float'],
  out: 'float',
  exec: radiansToDegrees
})

export const DegreesToRadians = makeInNOutFunctionDesc({
  name: 'math/float/trig/degreesToRadians',
  label: 'To Radians',
  in: ['float'],
  out: 'float',
  exec: degreesToRadians
})

export const Atan = makeInNOutFunctionDesc({
  name: 'math/float/trig/atan',
  label: 'ATAN',
  in: ['float'],
  out: 'float',
  exec: Math.atan
})

export const Mix = makeInNOutFunctionDesc({
  name: 'math/float/basic/mix',
  label: 'MIX',
  in: ['float', 'float', 'float'],
  out: 'float',
  exec: (a: number, b: number, t: number) => {
    const s = 1 - t
    return a * s + b * t
  }
})

export const ToFloat = makeInNOutFunctionDesc({
  name: 'math/float/convert/toFloat',
  label: 'To Float',
  in: ['float'],
  out: 'float',
  exec: (a: number) => Number(a)
})

export const Min = makeInNOutFunctionDesc({
  name: 'math/float/basic/min',
  label: 'MIN',
  in: ['float', 'float'],
  out: 'float',
  exec: (a: number, b: number) => Math.min(a, b) // TODO: can I jsut pass in Math.min?
})

export const Max = makeInNOutFunctionDesc({
  name: 'math/float/basic/max',
  label: 'MAX',
  in: ['float', 'float'],
  out: 'float',
  exec: (a: number, b: number) => Math.max(a, b) // TODO: can I jsut pass in Math.max?
})

export const Clamp = makeInNOutFunctionDesc({
  name: 'math/float/precision/clamp',
  label: 'CLAMP',
  in: [{ value: 'float' }, { min: 'float' }, { max: 'float' }],
  out: 'float',
  exec: (value: number, min: number, max: number) => (value < min ? min : value > max ? max : value)
})

export const Abs = makeInNOutFunctionDesc({
  name: 'math/float/abs',
  label: 'ABS',
  in: ['float'],
  out: 'float',
  exec: Math.abs
})

export const Sign = makeInNOutFunctionDesc({
  name: 'math/float/sign',
  label: 'SIGN',
  in: ['float'],
  out: 'float',
  exec: Math.sign
})

export const Floor = makeInNOutFunctionDesc({
  name: 'math/float/precision/floor',
  label: 'FLOOR',
  in: ['float'],
  out: 'float',
  exec: Math.floor
})

export const Ceil = makeInNOutFunctionDesc({
  name: 'math/float/precision/ceil',
  label: 'CEIL',
  in: ['float'],
  out: 'float',
  exec: Math.ceil
})

export const Round = makeInNOutFunctionDesc({
  name: 'math/float/precision/round',
  label: 'ROUND',
  in: ['float'],
  out: 'float',
  exec: Math.round
})

export const Trunc = makeInNOutFunctionDesc({
  name: 'math/float/precision/trunc',
  label: 'TRUNC',
  in: ['float'],
  out: 'float',
  exec: Math.trunc
})

export const Random = makeInNOutFunctionDesc({
  name: 'math/float/random',
  label: 'RANDOM',
  out: 'float',
  exec: Math.random
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/float/compare/equal',
  label: '=',
  in: ['float', 'float'],
  out: 'boolean',
  exec: (a: number, b: number) => a === b
})

export const EqualTolerance = makeInNOutFunctionDesc({
  name: 'math/float/compare/equalTolerance',
  label: '=',
  in: ['float', 'float', 'float'],
  out: 'boolean',
  exec: (a: number, b: number, tolerance: number) => equalsTolerance(a, b, tolerance)
})

export const GreaterThan = makeInNOutFunctionDesc({
  name: 'math/float/compare/greaterThan',
  label: '>',
  in: ['float', 'float'],
  out: 'boolean',
  exec: (a: number, b: number) => a > b
})

export const GreaterThanOrEqual = makeInNOutFunctionDesc({
  name: 'math/float/compare/greaterThanOrEqual',
  label: '≥',
  in: ['float', 'float'],
  out: 'boolean',
  exec: (a: number, b: number) => a >= b
})

export const LessThan = makeInNOutFunctionDesc({
  name: 'math/float/compare/lessThan',
  label: '<',
  in: ['float', 'float'],
  out: 'boolean',
  exec: (a: number, b: number) => a < b
})

export const LessThanOrEqual = makeInNOutFunctionDesc({
  name: 'math/float/compare/lessThanOrEqual',
  label: '≤',
  in: ['float', 'float'],
  out: 'boolean',
  exec: (a: number, b: number) => a <= b
})

export const IsNaN = makeInNOutFunctionDesc({
  name: 'math/float/compare/isNaN',
  label: 'isNaN',
  in: ['float'],
  out: 'boolean',
  exec: Number.isNaN
})

export const IsInf = makeInNOutFunctionDesc({
  name: 'math/float/compare/isInf',
  label: 'isInf',
  in: ['float'],
  out: 'boolean',
  exec: (a: number) => !Number.isFinite(a) && !Number.isNaN(a)
})
