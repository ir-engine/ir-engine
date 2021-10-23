import { IsAParser } from '.'
import { saferStringify } from '../utils'
import { AnyParser } from './AnyParser'
import { ArrayParser } from './ArrayParser'
import { BoolParser } from './BoolParser'
import { ConcatParsers } from './ConcatParser'
import { DefaultParser } from './DefaultParser'
import { FunctionParser } from './FunctionParser'
import { GuardParser } from './GuardParser'
import { IParser, OnParse, ISimpleParsedError, Optional, NonNull } from './interfaces'
import { MappedAParser } from './MappedAParser'
import { MaybeParser } from './MaybeParser'
import { parserName } from './Named'
import { NilParser } from './NillParser'
import { NumberParser } from './NumberParser'
import { ObjectParser } from './ObjectParser'
import { OrParsers } from './OrParser'
import { ShapeParser } from './ShapeParser'
import { StringParser } from './StringParser'
import { booleanOnParse } from './utils'
function unwrapParser(a: IParser<unknown, unknown>): IParser<unknown, unknown> {
  if (a instanceof Parser) return unwrapParser(a.parser)
  return a
}

const enumParsed = {
  parsed<A>(value: A) {
    return { value }
  },
  invalid(error: ISimpleParsedError) {
    return { error }
  }
}

export class Parser<A, B> implements IParser<A, B> {
  public readonly _TYPE: B = null as any
  constructor(
    readonly parser: IParser<A, B>,
    readonly description = {
      name: 'Wrapper',
      children: [parser],
      extras: []
    } as const
  ) {}
  parse<C, D>(a: A, onParse: OnParse<A, B, C, D>): C | D {
    return this.parser.parse(a, onParse)
  }
  public static isA<A, B extends A>(checkIsA: (value: A) => value is B, name: string): Parser<A, B> {
    return new Parser(new IsAParser(checkIsA, name))
  }

  /**
   * This is the line of code that could be over written if
   * One would like to have a custom error as any shape
   */

  public static validatorErrorAsString = <A, B>(error: ISimpleParsedError): string => {
    const { parser, value, keys } = error

    const keysString = !keys.length
      ? ''
      : keys
          .map((x) => `[${x}]`)
          .reverse()
          .join('')

    return `${keysString}${Parser.parserAsString(parser)}(${saferStringify(value)})`
  }

  public static parserAsString(parserComingIn: IParser<unknown, unknown>): string {
    const parser = unwrapParser(parserComingIn)
    const {
      description: { name, extras, children }
    } = parser
    if (parser instanceof ShapeParser) {
      return `${name}<{${parser.description.children
        .map((subParser, i) => `${String(parser.description.extras[i]) || '?'}:${Parser.parserAsString(subParser)}`)
        .join(',')}}>`
    }
    if (parser instanceof OrParsers) {
      const parent = unwrapParser(parser.parent)
      const parentString = Parser.parserAsString(parent)
      if (parent instanceof OrParsers) return parentString

      return `${name}<${parentString},...>`
    }
    if (parser instanceof GuardParser) {
      return String(extras[0] || name)
    }
    if (
      parser instanceof StringParser ||
      parser instanceof ObjectParser ||
      parser instanceof NumberParser ||
      parser instanceof BoolParser ||
      parser instanceof AnyParser
    ) {
      return name.toLowerCase()
    }
    if (parser instanceof FunctionParser) {
      return name
    }
    if (parser instanceof NilParser) {
      return 'null'
    }
    if (parser instanceof ArrayParser) {
      return 'Array<unknown>'
    }
    const specifiers = [...extras.map(saferStringify), ...children.map(Parser.parserAsString)]
    const specifiersString = `<${specifiers.join(',')}>`
    const childrenString = !children.length ? '' : `<>`

    return `${name}${specifiersString}`
  }
  unsafeCast(value: A): B {
    const state = this.enumParsed(value)
    if ('value' in state) return state.value
    const { error } = state
    throw new TypeError(`Failed type: ${Parser.validatorErrorAsString(error)} given input ${saferStringify(value)}`)
  }
  castPromise(value: A): Promise<B> {
    const state = this.enumParsed(value)
    if ('value' in state) return Promise.resolve(state.value)
    const { error } = state
    return Promise.reject(
      new TypeError(`Failed type: ${Parser.validatorErrorAsString(error)} given input ${saferStringify(value)}`)
    )
  }

  map<C>(fn: (apply: B) => C, mappingName?: string): Parser<A, C> {
    return new Parser(new MappedAParser(this, fn, mappingName))
  }

  concat<C>(otherParser: IParser<B, C>): Parser<A, C> {
    return new Parser(ConcatParsers.of(this, new Parser(otherParser)) as any)
  }

  orParser<C>(otherParser: IParser<A, C>): Parser<A, B | C> {
    return new Parser(new OrParsers(this, new Parser(otherParser)))
  }

  test = (value: A): value is A & B => {
    return this.parse(value, booleanOnParse)
  }

  /**
   * When we want to make sure that we handle the null later on in a monoid fashion,
   * and this ensures we deal with the value
   */
  optional(name?: string): Parser<Optional<A>, Optional<B>> {
    return new Parser(new MaybeParser(this))
  }
  /**
   * There are times that we would like to bring in a value that we know as null or undefined
   * and want it to go to a default value
   */
  defaultTo<C>(defaultValue: C): Parser<Optional<A>, C | NonNull<B, C>> {
    return new Parser(new DefaultParser(new Parser(new MaybeParser(this)), defaultValue))
  }
  /**
   * We want to test value with a test eg isEven
   */
  validate(isValid: (value: B) => boolean, otherName: string): Parser<A, B> {
    return new Parser(
      ConcatParsers.of(this, new Parser(new IsAParser(isValid as (value: B) => value is B, otherName))) as any
    )
  }
  /**
   * We want to refine to a new type given an original type, like isEven, or casting to a more
   * specific type
   */
  refine<C = B>(
    refinementTest: (value: B) => value is B & C,
    otherName: string = refinementTest.name
  ): Parser<A, B & C> {
    return new Parser(ConcatParsers.of(this, new Parser(new IsAParser(refinementTest, otherName))) as any)
  }

  name(nameString: string) {
    return parserName(nameString, this)
  }

  enumParsed(value: A): { value: B } | { error: ISimpleParsedError } {
    return this.parse(value, enumParsed) as any
  }

  unwrappedParser() {
    let answer: Parser<any, any> = this
    while (true) {
      const next = answer.parser
      if (next instanceof Parser) {
        answer = next
      } else {
        return next
      }
    }
  }
}
