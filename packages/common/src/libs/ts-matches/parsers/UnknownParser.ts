import { IParser, OnParse } from './interfaces'

export class UnknownParser implements IParser<unknown, unknown> {
  constructor(
    readonly description = {
      name: 'Unknown',
      children: [],
      extras: []
    } as const
  ) {}
  parse<C, D>(a: unknown, onParse: OnParse<unknown, unknown, C, D>): C | D {
    return onParse.parsed(a)
  }
}
