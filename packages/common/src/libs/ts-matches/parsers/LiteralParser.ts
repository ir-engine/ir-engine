import { IParser, OnParse } from './interfaces'
import { Parser } from './Parser'
import { OneOf } from './utils'

export class LiteralsParser<B extends unknown[]> implements IParser<unknown, OneOf<B>> {
  constructor(
    readonly values: B,
    readonly description = {
      name: 'Literal',
      children: [],
      extras: values
    } as const
  ) {}
  parse<C, D>(a: unknown, onParse: OnParse<unknown, OneOf<B>, C, D>): C | D {
    if (this.values.indexOf(a) >= 0) {
      return onParse.parsed(a as OneOf<B>)
    }
    return onParse.invalid({
      value: a,
      keys: [],
      parser: this
    })
  }
}

export function literal<A extends string | number | boolean | null | undefined>(isEqualToValue: A) {
  return new Parser(new LiteralsParser<[A]>([isEqualToValue]))
}

export function literals<
  A extends string | number | boolean | null | undefined,
  Rest extends Array<string | number | boolean | null | undefined>
>(firstValue: A, ...restValues: Rest): Parser<unknown, A | OneOf<Rest>> {
  return new Parser(new LiteralsParser([firstValue, ...restValues]))
}
