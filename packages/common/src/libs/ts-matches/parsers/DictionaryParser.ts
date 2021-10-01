import { object, Parser } from '.'
import { IParser, OnParse, ISimpleParsedError, _ } from './interfaces'

export type DictionaryTuple<A> = A extends [Parser<unknown, infer Keys>, Parser<unknown, infer Values>]
  ? Keys extends string | number
    ? { [key in Keys]: Values }
    : never
  : never
// prettier-ignore
export type DictionaryShaped<T> =
    T extends [] | readonly [] ? IParser<unknown, any>
    : T extends [infer A] | readonly [infer A] ? DictionaryTuple<A>
    : T extends [infer A, ...infer B] | readonly [infer A, ...infer B] ? DictionaryTuple<A> & DictionaryShaped<B>
    : never
export class DictionaryParser<
  A extends object | {},
  Parsers extends Array<[Parser<unknown, unknown>, Parser<unknown, unknown>]>
> implements IParser<A, DictionaryShaped<Parsers>>
{
  constructor(
    readonly parsers: Parsers,
    readonly description = {
      name: 'Dictionary' as const,
      children: parsers.reduce((acc: Array<IParser<unknown, unknown>>, [k, v]) => {
        acc.push(k, v)
        return acc
      }, []),
      extras: []
    } as const
  ) {}
  parse<C, D>(a: A, onParse: OnParse<A, DictionaryShaped<Parsers>, C, D>): C | D {
    const { parsers } = this
    const parser = this
    const answer: any = { ...a }
    outer: for (const key in a) {
      let parseError: Array<ISimpleParsedError> = []
      for (const [keyParser, valueParser] of parsers) {
        const enumState = keyParser.enumParsed(key)
        if ('error' in enumState) {
          const { error } = enumState
          error.parser = parser
          error.keys.push('' + key)
          parseError.push(error)
          continue
        }
        const newKey = enumState.value as string | number
        const valueState = valueParser.enumParsed((a as any)[key])
        if ('error' in valueState) {
          const { error } = valueState
          error.keys.push('' + newKey)
          parseError.unshift(error)
          continue
        }
        delete answer[key]
        answer[newKey] = valueState.value
        break outer
      }
      const error = parseError[0]
      if (!!error) {
        return onParse.invalid(error)
      }
    }

    return onParse.parsed(answer)
  }
}
export const dictionary = <ParserSets extends [Parser<unknown, unknown>, Parser<unknown, unknown>][]>(
  ...parsers: ParserSets
): Parser<unknown, _<DictionaryShaped<[...ParserSets]>>> => {
  return object.concat(new DictionaryParser([...parsers])) as any
}
