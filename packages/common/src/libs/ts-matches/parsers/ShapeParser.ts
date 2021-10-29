import { Parser, object } from '.'
import { saferStringify } from '../utils'
import { IParser, OnParse } from './interfaces'

/**
 * Given an object, we want to make sure the key exists and that the value on
 * the key matches the parser
 */
export class ShapeParser<A extends unknown, Key extends string | number | symbol, B> implements IParser<A, B> {
  constructor(
    readonly parserMap: { [key in keyof B]: Parser<unknown, B[key]> },
    readonly isPartial: boolean,
    readonly parserKeys = Object.keys(parserMap) as Array<string & keyof typeof parserMap>,
    readonly description = {
      name: isPartial ? 'Partial' : 'Shape',
      children: parserKeys.map((key) => parserMap[key]),
      extras: parserKeys
    } as const
  ) {}
  parse<C, D>(a: unknown, onParse: OnParse<A, { [key in Key]?: B }, C, D>): C | D {
    const parser: IParser<unknown, unknown> = this
    if (!object.test(a)) {
      return onParse.invalid({
        value: a,
        keys: [],
        parser
      })
    }
    const { parserMap, isPartial } = this
    const value: any = { ...a }
    if (Array.isArray(a)) {
      value.length = a.length
    }
    for (const key in parserMap) {
      if (key in value) {
        const parser = parserMap[key]
        const state = parser.enumParsed((a as any)[key])
        if ('error' in state) {
          const { error } = state
          error.keys.push(saferStringify(key))
          return onParse.invalid(error)
        }
        const smallValue = state.value
        value[key] = smallValue
      } else if (!isPartial) {
        return onParse.invalid({
          value: 'missingProperty',
          parser,
          keys: [saferStringify(key)]
        })
      }
    }

    return onParse.parsed(value)
  }
}
export const isPartial = <A extends {}>(testShape: {
  [key in keyof A]: Parser<unknown, A[key]>
}): Parser<unknown, Partial<A>> => {
  return new Parser(new ShapeParser(testShape, true)) as any
}

/**
 * Good for duck typing an object, with optional values
 * @param testShape Shape of validators, to ensure we match the shape
 */
export const partial = isPartial
/**
 * Good for duck typing an object
 * @param testShape Shape of validators, to ensure we match the shape
 */

export const isShape = <A extends {}>(testShape: {
  [key in keyof A]: Parser<unknown, A[key]>
}): Parser<unknown, A> => {
  return new Parser(new ShapeParser(testShape, false)) as any
}
export const shape = <A extends {}>(testShape: {
  [key in keyof A]: Parser<unknown, A[key]>
}): Parser<unknown, A> => isShape(testShape)
