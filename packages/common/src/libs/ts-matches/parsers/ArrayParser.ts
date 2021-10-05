import { IParser, OnParse } from './interfaces'
import { isObject } from './utils'

export class ArrayParser implements IParser<unknown, Array<unknown>> {
  constructor(
    readonly description = {
      name: 'Array',
      children: [],
      extras: []
    } as const
  ) {}
  parse<C, D>(a: unknown, onParse: OnParse<unknown, Array<unknown>, C, D>): C | D {
    if (Array.isArray(a)) return onParse.parsed(a)

    return onParse.invalid({
      value: a,
      keys: [],
      parser: this
    })
  }
}
