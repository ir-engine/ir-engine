import { ISimpleParsedError, OnParse } from './interfaces'

export const isObject = (x: unknown): x is object => typeof x === 'object' && x != null
export const isFunctionTest = (x: unknown): x is Function => typeof x === 'function'
export const isNumber = (x: unknown): x is number => typeof x === 'number'
export const isString = (x: unknown): x is string => typeof x === 'string'
export const empty: any[] = []

export const booleanOnParse: OnParse<unknown, unknown, true, false> = {
  parsed(_) {
    return true
  },
  invalid(_) {
    return false
  }
}

export type OneOf<T> = T extends [infer A] | readonly [infer A]
  ? A
  : T extends [infer A, ...infer B] | readonly [infer A, ...infer B]
  ? A | OneOf<B>
  : never
