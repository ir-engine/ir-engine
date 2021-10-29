import { IParser, OnParse } from './interfaces'

export class GuardParser<A, B> implements IParser<A, B> {
  constructor(
    readonly checkIsA: (value: A) => value is A & B,
    readonly typeName: string,
    readonly description = {
      name: 'Guard',
      children: [],
      extras: [typeName]
    } as const
  ) {}
  parse<C, D>(a: A, onParse: OnParse<A, B, C, D>): C | D {
    if (this.checkIsA(a)) {
      return onParse.parsed(a)
    }
    return onParse.invalid({
      value: a,
      keys: [],
      parser: this
    })
  }
}
