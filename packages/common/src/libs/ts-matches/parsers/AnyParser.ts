import { IParser, OnParse } from './interfaces'

export class AnyParser implements IParser<unknown, any> {
  constructor(
    readonly description = {
      name: 'Any',
      children: [],
      extras: []
    } as const
  ) {}
  parse<C, D>(a: unknown, onParse: OnParse<unknown, any, C, D>): C | D {
    return onParse.parsed(a)
  }
}
