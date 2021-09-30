import { Parser } from '.'

export type NonNull<A, B> = A extends null | undefined ? B : A
export type EnsureParser<P> = P extends IParser<any, any> ? P : never
export type ParserInto<P> = P extends IParser<any, infer A> ? A : never
export type ParserFrom<P> = P extends IParser<infer A, any> ? A : never
export type Nil = null | undefined

export type Optional<A> = A | null | undefined
export type _<T> = T
export type SomeParser = IParser<unknown, unknown>

export type ISimpleParsedError = {
  parser: SomeParser
  value: any
  keys: string[]
}
export type ValidatorError = ISimpleParsedError
export type IParser<A, B> = {
  readonly description: Readonly<Description & {}>
  parse<C, D>(this: IParser<A, B>, a: A, onParse: OnParse<A, B, C, D>): C | D
}
export type Description = {
  readonly name: ParserNames
  readonly extras: ReadonlyArray<unknown>
  readonly children: ReadonlyArray<SomeParser>
} & (
  | {
      readonly name: 'ArrayOf'
      readonly children: readonly [SomeParser]
      readonly extras: readonly []
    }
  | {
      readonly name: 'Named'
      readonly children: readonly [SomeParser]
      readonly extras: readonly [string]
    }
  | {
      readonly name: 'Concat'
      readonly children: readonly [SomeParser, SomeParser]
      readonly extras: readonly []
    }
  | {
      readonly name: 'Default'
      readonly children: readonly [SomeParser]
      readonly extras: readonly [unknown]
    }
  | {
      readonly name: 'Tuple'
      readonly children: ReadonlyArray<SomeParser>
      readonly extras: readonly []
    }
  | {
      readonly name: 'Dictionary'
      readonly children: ReadonlyArray<SomeParser>
      readonly extras: readonly []
    }
  | {
      readonly name: 'Guard'
      readonly children: readonly []
      readonly extras: readonly [unknown]
    }
  | {
      readonly name: 'Literal'
      readonly children: readonly []
      readonly extras: ReadonlyArray<unknown>
    }
  | {
      readonly name: 'Mapped'
      readonly children: readonly [SomeParser]
      readonly extras: readonly [string]
    }
  | {
      readonly name: 'Maybe'
      readonly children: readonly [SomeParser]
      readonly extras: readonly []
    }
  | {
      readonly name: 'Or'
      readonly children: readonly [SomeParser, SomeParser]
      readonly extras: readonly []
    }
  | {
      readonly name: 'Wrapper'
      readonly children: readonly [SomeParser]
      readonly extras: readonly []
    }
  | {
      readonly name: 'Shape' | 'Partial'
      readonly children: ReadonlyArray<SomeParser>
      readonly extras: ReadonlyArray<string | number>
    }
  | {
      readonly name: 'Any' | 'Unknown' | 'Null' | 'Number' | 'Boolean' | 'Function' | 'String' | 'Object' | 'Array'
      readonly children: readonly []
      readonly extras: readonly []
    }
)

export type ParserNames =
  | 'Any'
  | 'Array'
  | 'ArrayOf'
  | 'Boolean'
  | 'Concat'
  | 'Default'
  | 'Named'
  | 'Dictionary'
  | 'Function'
  | 'Guard'
  | 'Literal'
  | 'Mapped'
  | 'Maybe'
  | 'Named'
  | 'Null'
  | 'Number'
  | 'Partial'
  | 'Object'
  | 'Or'
  | 'Shape'
  | 'String'
  | 'Tuple'
  | 'Unknown'
  | 'Wrapper'

export type OnParse<A, B, C, D> = {
  parsed(b: B): C
  invalid(error: ISimpleParsedError): D
}

export type AndParser<P1, P2> = [P1, P2] extends [Parser<infer A1, infer B1>, Parser<infer A2, infer B2>]
  ? Parser<A1 & A2, B1 & B2>
  : never

export type OrParser<P1, P2> = [P1, P2] extends [Parser<infer A1, infer B1>, Parser<infer A2, infer B2>]
  ? Parser<A1 | A2, B1 | B2>
  : never
