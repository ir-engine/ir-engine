import { Parser, isArray } from '.'
import { IParser, OnParse } from './interfaces'

/**
 * Given an object, we want to make sure the key exists and that the value on
 * the key matches the parser
 * Note: This will mutate the value sent through
 */
export class ArrayOfParser<A extends unknown[], B> implements IParser<A, B[]> {
  constructor(
    readonly parser: Parser<A[number], B>,
    readonly description = {
      name: 'ArrayOf',
      children: [parser],
      extras: []
    } as const
  ) {}
  parse<C, D>(a: A, onParse: OnParse<A, B[], C, D>): C | D {
    const values = [...a]
    for (let index = 0; index < values.length; index++) {
      const result = this.parser.enumParsed(values[index])
      if ('error' in result) {
        result.error.keys.push('' + index)
        return onParse.invalid(result.error)
      } else {
        values[index] = result.value
      }
    }
    return onParse.parsed(values as any)
  }
}
/**
 * We would like to validate that all of the array is of the same type
 * @param validator What is the validator for the values in the array
 */
export function arrayOf<A>(validator: Parser<unknown, A>): Parser<unknown, A[]> {
  return isArray.concat(new ArrayOfParser(validator))
}
