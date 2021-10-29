import { Parser } from '.'
import { IParser, Optional, OnParse } from './interfaces'
export class MaybeParser<A, B> implements IParser<Optional<A>, Optional<B>> {
  constructor(
    readonly parent: Parser<A, B>,
    readonly description = {
      name: 'Maybe',
      children: [parent],
      extras: []
    } as const
  ) {}
  parse<C, D>(a: A, onParse: OnParse<Optional<A>, Optional<B>, C, D>): C | D {
    if (a == null) {
      return onParse.parsed(null)
    }
    const parser = this
    const parentState = this.parent.enumParsed(a)
    if ('error' in parentState) {
      const { error } = parentState

      error.parser = parser
      return onParse.invalid(error)
    }
    return onParse.parsed(parentState.value)
  }
}
