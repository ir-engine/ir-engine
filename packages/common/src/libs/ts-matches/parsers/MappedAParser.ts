import { Parser } from '.'
import { IParser, OnParse } from './interfaces'

export class MappedAParser<A, B, B2> implements IParser<A, B2> {
  constructor(
    readonly parent: Parser<A, B>,
    readonly map: (value: B) => B2,
    readonly mappingName = map.name,
    readonly description = {
      name: 'Mapped',
      children: [parent],
      extras: [mappingName]
    } as const
  ) {}
  parse<C, D>(a: A, onParse: OnParse<A, B2, C, D>): C | D {
    const map = this.map
    const result = this.parent.enumParsed(a)
    if ('error' in result) {
      return onParse.invalid(result.error)
    }

    return onParse.parsed(map(result.value))
  }
}
