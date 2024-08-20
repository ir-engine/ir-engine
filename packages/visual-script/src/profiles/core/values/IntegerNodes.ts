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

// Unreal Engine Integer Blueprints API: https://docs.unrealengine.com/4.27/en-US/BlueprintAPI/Math/Integer/

import { makeInNOutFunctionDesc } from '../../../VisualScriptModule'

export const Constant = makeInNOutFunctionDesc({
  name: 'math/integer/constant',
  label: 'Integer',
  in: ['integer'],
  out: 'integer',
  exec: (a: bigint) => a
})

export const Add = makeInNOutFunctionDesc({
  name: 'math/integer/basic/add',
  label: '+',
  in: ['integer', 'integer'],
  out: 'integer',
  exec: (a: bigint, b: bigint) => a + b
})

export const Subtract = makeInNOutFunctionDesc({
  name: 'math/integer/basic/subtract',
  label: '-',
  in: ['integer', 'integer'],
  out: 'integer',
  exec: (a: bigint, b: bigint) => a - b
})

export const Negate = makeInNOutFunctionDesc({
  name: 'math/integer/negate',
  label: '-',
  in: ['integer'],
  out: 'integer',
  exec: (a: bigint) => -a
})

export const Multiply = makeInNOutFunctionDesc({
  name: 'math/integer/basic/multiply',
  label: '×',
  in: ['integer', 'integer'],
  out: 'integer',
  exec: (a: bigint, b: bigint) => a * b
})

export const Divide = makeInNOutFunctionDesc({
  name: 'math/integer/basic/divide',
  label: '÷',
  in: ['integer', 'integer'],
  out: 'integer',
  exec: (a: bigint, b: bigint) => a / b
})

export const Modulus = makeInNOutFunctionDesc({
  name: 'math/integer/basic/modulus',
  label: 'MOD',
  in: ['integer', 'integer'],
  out: 'integer',
  exec: (a: bigint, b: bigint) => a % b
})

export const ToFloat = makeInNOutFunctionDesc({
  name: 'math/integer/convert/toFloat',
  label: 'To Float',
  in: ['integer'],
  out: 'float',
  exec: (a: bigint) => Number(a)
})

export const Min = makeInNOutFunctionDesc({
  name: 'math/integer/basic/min',
  label: 'MIN',
  in: ['integer', 'integer'],
  out: 'integer',
  exec: (a: bigint, b: bigint) => (a > b ? b : a)
})

export const Max = makeInNOutFunctionDesc({
  name: 'math/integer/basic/max',
  label: 'MAX',
  in: ['integer', 'integer'],
  out: 'integer',
  exec: (a: bigint, b: bigint) => (a > b ? a : b)
})

export const Clamp = makeInNOutFunctionDesc({
  name: 'math/integer/precision/clamp',
  label: 'CLAMP',
  in: [{ value: 'integer' }, { min: 'integer' }, { max: 'integer' }],
  out: 'integer',
  exec: (value: bigint, min: bigint, max: bigint) => (value < min ? min : value > max ? max : value)
})

export const Abs = makeInNOutFunctionDesc({
  name: 'math/integer/abs',
  label: 'ABS',
  in: ['integer'],
  out: 'integer',
  exec: (a: bigint) => (a < BigInt(0) ? -a : a)
})

export const Sign = makeInNOutFunctionDesc({
  name: 'math/integer/sign',
  label: 'SIGN',
  in: ['integer'],
  out: 'integer',
  exec: (a: bigint) => BigInt(a < 0 ? -1 : a > 0 ? 1 : 0)
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/integer/compare/equal',
  label: '=',
  in: ['integer', 'integer'],
  out: 'boolean',
  exec: (a: bigint, b: bigint) => a === b
})

export const GreaterThan = makeInNOutFunctionDesc({
  name: 'math/integer/compare/greaterThan',
  label: '>',
  in: ['integer', 'integer'],
  out: 'boolean',
  exec: (a: bigint, b: bigint) => a > b
})

export const GreaterThanOrEqual = makeInNOutFunctionDesc({
  name: 'math/integer/compare/greaterThanOrEqual',
  label: '≥',
  in: ['integer', 'integer'],
  out: 'boolean',
  exec: (a: bigint, b: bigint) => a >= b
})

export const LessThan = makeInNOutFunctionDesc({
  name: 'math/integer/compare/lessThan',
  label: '<',
  in: ['integer', 'integer'],
  out: 'boolean',
  exec: (a: bigint, b: bigint) => a < b
})

export const LessThanOrEqual = makeInNOutFunctionDesc({
  name: 'math/integer/compare/lessThanOrEqual',
  label: '≤',
  in: ['integer', 'integer'],
  out: 'boolean',
  exec: (a: bigint, b: bigint) => a <= b
})

export const toBoolean = makeInNOutFunctionDesc({
  name: 'math/integer/convert/toBoolean',
  label: 'To Boolean',
  in: ['integer'],
  out: 'boolean',
  exec: (a: bigint) => a !== 0n
})
