import { any, Parser } from '.'
import { EnsureParser, AndParser, IParser } from './interfaces'

// prettier-ignore
export type EveryParser<T> =
  T extends [] | readonly [] ? IParser<unknown, any> 
  : T extends [infer A] | readonly [infer A] ? EnsureParser<A>
  : T extends [infer A, ...infer B] | readonly [infer A, ...infer B] ? AndParser<A, EveryParser<B>>
  : never
/**
 * Intersection is a good tool to make sure that the validated value
 * is in the intersection of all the validators passed in. Basically an `and`
 * operator for validators
 */
export function every<RestParsers extends Parser<unknown, unknown>[]>(
  ...parsers: RestParsers
): EveryParser<RestParsers> {
  const filteredParsers = parsers.filter((x) => x !== any)
  if (filteredParsers.length <= 0) {
    return any as any
  }
  const first = filteredParsers.splice(0, 1)[0]
  return filteredParsers.reduce((left, right) => {
    return left.concat(right)
  }, first) as any
}
