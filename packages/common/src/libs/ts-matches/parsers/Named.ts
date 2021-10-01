import { Parser } from '.'
import { IParser, OnParse } from './interfaces'

export class NamedParser<A, B> implements IParser<A, B> {
  constructor(
    readonly parent: Parser<A, B>,
    readonly name: string,
    readonly description = {
      name: 'Named',
      children: [parent],
      extras: [name]
    } as const
  ) {}
  parse<C, D>(a: A, onParse: OnParse<A, B, C, D>): C | D {
    const parser = this
    const parent = this.parent.enumParsed(a)
    if ('error' in parent) {
      const { error } = parent
      error.parser = parser
      return onParse.invalid(error)
    }
    return onParse.parsed(parent.value)
  }
}

export function parserName<A, B>(name: string, parent: Parser<A, B>): Parser<A, B> {
  return new Parser(new NamedParser(parent, name))
}
