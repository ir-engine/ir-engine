import { Parser } from '.'
import { AnyParser } from './AnyParser'
import { ArrayParser } from './ArrayParser'
import { BoolParser } from './BoolParser'
import { FunctionParser } from './FunctionParser'
import { NilParser } from './NillParser'
import { NumberParser } from './NumberParser'
import { ObjectParser } from './ObjectParser'
import { StringParser } from './StringParser'
import { UnknownParser } from './UnknownParser'
/**
 * Create a custom type guard
 * @param test A function that will determine runtime if the value matches
 * @param testName A name for that function, useful when it fails
 */
export function guard<A, B extends A>(test: (value: A) => value is B, testName?: string): Parser<A, B> {
  return Parser.isA(test, testName || test.name)
}

export const any = new Parser(new AnyParser())

export const unknown = new Parser(new UnknownParser())

export const number = new Parser(new NumberParser())

export const isNill = new Parser(new NilParser())

export const natural = number.refine((x): x is number => x >= 0 && x === Math.floor(x))

export const isFunction = new Parser(new FunctionParser())

export const boolean = new Parser(new BoolParser())

export const object = new Parser(new ObjectParser())

export const isArray = new Parser(new ArrayParser())

export const string = new Parser(new StringParser())
export const instanceOf = <C>(classCreator: { new (...args: any[]): C }): Parser<unknown, C> =>
  guard((x): x is C => x instanceof classCreator, `is${classCreator.name}`)

export const regex = (tester: RegExp) =>
  string.refine(function (x): x is string {
    return tester.test(x)
  }, tester.toString())
