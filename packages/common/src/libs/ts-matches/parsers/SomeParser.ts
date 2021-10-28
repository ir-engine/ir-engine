import { Parser } from '.'
import { EnsureParser, IParser, OrParser } from './interfaces'
import { any } from './SimpleParsers'

// prettier-ignore
export type SomeParsers<T> =
  T extends [] | readonly [] ? IParser<unknown, any>
  : T extends [infer A] | readonly [infer A] ? EnsureParser<A>
  : T extends [infer A, ...infer B] | readonly [infer A, ...infer B] ? OrParser<A, SomeParsers<B>>
  : T extends Array<infer A> | ReadonlyArray<infer A> ? A
  : never
/**
 * Union is a good tool to make sure that the validated value
 * is in the union of all the validators passed in. Basically an `or`
 * operator for validators.
 */
export function some<RestParsers extends Parser<unknown, unknown>[]>(
  ...parsers: RestParsers
): SomeParsers<RestParsers> {
  if (parsers.length <= 0) {
    return any as any
  }
  const first = parsers.splice(0, 1)[0]
  return parsers.reduce((left, right) => left.orParser(right), first) as any
}
