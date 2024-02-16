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
