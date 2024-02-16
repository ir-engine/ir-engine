import { makeInNOutFunctionDesc } from '../../../VisualScriptModule'

export const Constant = makeInNOutFunctionDesc({
  name: 'logic/string/constant',
  label: 'String',
  in: ['string'],
  out: 'string',
  exec: (a: string) => a
})

export const Concat = makeInNOutFunctionDesc({
  name: 'logic/string/concat',
  label: 'Concat',
  in: ['string', 'string'],
  out: 'string',
  exec: (a: string, b: string) => a.concat(b)
})

export const Includes = makeInNOutFunctionDesc({
  name: 'logic/string/includes',
  label: 'Includes',
  in: ['string', 'string'],
  out: 'boolean',
  exec: (a: string, b: string) => a.includes(b)
})

export const Length = makeInNOutFunctionDesc({
  name: 'logic/string/length',
  label: 'Length',
  in: ['string'],
  out: 'integer',
  exec: (a: string) => BigInt(a.length)
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/string/compare/equal',
  label: '=',
  in: ['string', 'string'],
  out: 'boolean',
  exec: (a: string, b: string) => a === b
})
