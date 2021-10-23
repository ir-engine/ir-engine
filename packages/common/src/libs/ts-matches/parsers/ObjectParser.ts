import { IParser, OnParse } from './interfaces'
import { isObject } from './utils'

export class ObjectParser implements IParser<unknown, object> {
  constructor(
    readonly description = {
      name: 'Object',
      children: [],
      extras: []
    } as const
  ) {}
  parse<C, D>(a: unknown, onParse: OnParse<unknown, object, C, D>): C | D {
    if (isObject(a)) return onParse.parsed(a)

    return onParse.invalid({
      value: a,
      keys: [],
      parser: this
    })
  }
}
