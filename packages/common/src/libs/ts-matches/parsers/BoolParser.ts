import { isNumber } from '.'
import { IParser, OnParse } from './interfaces'

export class BoolParser implements IParser<unknown, boolean> {
  constructor(
    readonly description = {
      name: 'Boolean',
      children: [],
      extras: []
    } as const
  ) {}
  parse<C, D>(a: unknown, onParse: OnParse<unknown, boolean, C, D>): C | D {
    if (a === true || a === false) return onParse.parsed(a)

    return onParse.invalid({
      value: a,
      keys: [],
      parser: this
    })
  }
}
