import { any, Parser } from '.'
import { IParser, OnParse } from './interfaces'

export class ConcatParsers<A, B, B2> implements IParser<A, B2> {
  private constructor(
    readonly parent: Parser<A, B>,
    readonly otherParser: Parser<B, B2>,
    readonly description = {
      name: 'Concat',
      children: [parent, otherParser],
      extras: []
    } as const
  ) {}
  static of<A, B, B2>(parent: Parser<A, B>, otherParser: Parser<B, B2>) {
    if (parent.unwrappedParser().description.name === 'Any') {
      return otherParser
    }
    if (otherParser.unwrappedParser().description.name === 'Any') {
      return parent
    }
    return new ConcatParsers(parent, otherParser)
  }
  parse<C, D>(a: A, onParse: OnParse<A, B2, C, D>): C | D {
    const parent = this.parent.enumParsed(a)
    if ('error' in parent) {
      return onParse.invalid(parent.error)
    }
    const other = this.otherParser.enumParsed(parent.value)
    if ('error' in other) {
      return onParse.invalid(other.error)
    }
    return onParse.parsed(other.value)
  }
}
