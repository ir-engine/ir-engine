import { IParser, OnParse } from './interfaces'
import { Parser } from './Parser'

export class OrParsers<A, A2, B, B2> implements IParser<A | A2, B | B2> {
  constructor(
    readonly parent: Parser<A, B>,
    readonly otherParser: Parser<A2, B2>,
    readonly description = {
      name: 'Or',
      children: [parent, otherParser],
      extras: []
    } as const
  ) {}
  parse<C, D>(a: A & A2, onParse: OnParse<A | A2, B | B2, C, D>): C | D {
    const parser = this
    const parent = this.parent.enumParsed(a)
    if ('value' in parent) {
      return onParse.parsed(parent.value)
    }
    const other = this.otherParser.enumParsed(a)
    if ('error' in other) {
      const { error } = other
      error.parser = parser
      return onParse.invalid(error)
    }
    return onParse.parsed(other.value)
  }
}
