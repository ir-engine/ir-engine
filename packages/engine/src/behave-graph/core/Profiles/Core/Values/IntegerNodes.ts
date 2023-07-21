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

import { makeInNOutFunctionDesc } from '../../../Nodes/FunctionNode.js'

// Unreal Engine Integer Blueprints API: https://docs.unrealengine.com/4.27/en-US/BlueprintAPI/Math/Integer/

export const Constant = makeInNOutFunctionDesc({
  name: 'math/integer',
  label: 'Integer',
  in: ['integer'],
  out: 'integer',
  exec: (a: bigint) => a
})

export const Add = makeInNOutFunctionDesc({
  name: 'math/add/integer',
  label: '+',
  in: ['integer', 'integer'],
  out: 'integer',
  exec: (a: bigint, b: bigint) => a + b
})

export const Subtract = makeInNOutFunctionDesc({
  name: 'math/subtract/integer',
  label: '-',
  in: ['integer', 'integer'],
  out: 'integer',
  exec: (a: bigint, b: bigint) => a - b
})

export const Negate = makeInNOutFunctionDesc({
  name: 'math/negate/integer',
  label: '-',
  in: ['integer'],
  out: 'integer',
  exec: (a: bigint) => -a
})

export const Multiply = makeInNOutFunctionDesc({
  name: 'math/multiply/integer',
  label: '×',
  in: ['integer', 'integer'],
  out: 'integer',
  exec: (a: bigint, b: bigint) => a * b
})

export const Divide = makeInNOutFunctionDesc({
  name: 'math/divide/integer',
  label: '÷',
  in: ['integer', 'integer'],
  out: 'integer',
  exec: (a: bigint, b: bigint) => a / b
})

export const Modulus = makeInNOutFunctionDesc({
  name: 'math/modulus/integer',
  label: 'MOD',
  in: ['integer', 'integer'],
  out: 'integer',
  exec: (a: bigint, b: bigint) => a % b
})

export const ToFloat = makeInNOutFunctionDesc({
  name: 'math/toFloat/integer',
  label: 'To Float',
  in: ['integer'],
  out: 'float',
  exec: (a: bigint) => Number(a)
})

export const Min = makeInNOutFunctionDesc({
  name: 'math/min/integer',
  label: 'MIN',
  in: ['integer', 'integer'],
  out: 'integer',
  exec: (a: bigint, b: bigint) => (a > b ? b : a)
})

export const Max = makeInNOutFunctionDesc({
  name: 'math/max/integer',
  label: 'MAX',
  in: ['integer', 'integer'],
  out: 'integer',
  exec: (a: bigint, b: bigint) => (a > b ? a : b)
})

export const Clamp = makeInNOutFunctionDesc({
  name: 'math/clamp/integer',
  label: 'CLAMP',
  in: [{ value: 'integer' }, { min: 'integer' }, { max: 'integer' }],
  out: 'integer',
  exec: (value: bigint, min: bigint, max: bigint) => (value < min ? min : value > max ? max : value)
})

export const Abs = makeInNOutFunctionDesc({
  name: 'math/abs/integer',
  label: 'ABS',
  in: ['integer'],
  out: 'integer',
  exec: (a: bigint) => (a < BigInt(0) ? -a : a)
})

export const Sign = makeInNOutFunctionDesc({
  name: 'math/sign/integer',
  label: 'SIGN',
  in: ['integer'],
  out: 'integer',
  exec: (a: bigint) => BigInt(a < 0 ? -1 : a > 0 ? 1 : 0)
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/equal/integer',
  label: '=',
  in: ['integer', 'integer'],
  out: 'boolean',
  exec: (a: bigint, b: bigint) => a === b
})

export const GreaterThan = makeInNOutFunctionDesc({
  name: 'math/greaterThan/integer',
  label: '>',
  in: ['integer', 'integer'],
  out: 'boolean',
  exec: (a: bigint, b: bigint) => a > b
})

export const GreaterThanOrEqual = makeInNOutFunctionDesc({
  name: 'math/greaterThanOrEqual/integer',
  label: '≥',
  in: ['integer', 'integer'],
  out: 'boolean',
  exec: (a: bigint, b: bigint) => a >= b
})

export const LessThan = makeInNOutFunctionDesc({
  name: 'math/lessThan/integer',
  label: '<',
  in: ['integer', 'integer'],
  out: 'boolean',
  exec: (a: bigint, b: bigint) => a < b
})

export const LessThanOrEqual = makeInNOutFunctionDesc({
  name: 'math/lessThanOrEqual/integer',
  label: '≤',
  in: ['integer', 'integer'],
  out: 'boolean',
  exec: (a: bigint, b: bigint) => a <= b
})

export const toBoolean = makeInNOutFunctionDesc({
  name: 'math/toBoolean/integer',
  label: 'To Boolean',
  in: ['integer'],
  out: 'boolean',
  exec: (a: bigint) => a !== 0n
})
