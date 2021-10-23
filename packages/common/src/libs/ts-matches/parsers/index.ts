import { _, ValidatorError } from './interfaces'
import { isNumber } from './utils'
import { GuardParser } from './GuardParser'
import { Parser } from './Parser'
import {
  guard,
  any,
  string,
  isFunction,
  boolean,
  object,
  isArray,
  instanceOf,
  number,
  regex,
  isNill,
  natural
} from './SimpleParsers'
import { some } from './SomeParser'
import { every } from './EveryParser'
import { dictionary } from './DictionaryParser'
import { partial, shape } from './ShapeParser'
import { tuple } from './TupleParser'
import { arrayOf } from './ArrayOfParser'
import { literal, literals } from './LiteralParser'

export type { ValidatorError }

export {
  GuardParser as IsAParser,
  Parser,
  literal,
  guard,
  any,
  literals,
  instanceOf,
  isArray,
  isNumber,
  string,
  isFunction,
  boolean,
  number,
  object,
  regex,
  arrayOf,
  natural,
  isNill,
  every,
  some,
  dictionary,
  partial,
  tuple,
  shape
}
