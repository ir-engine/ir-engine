import { Vector3, Quaternion } from 'three'
import matches, { Validator } from 'ts-matches'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { NetworkId, UserId } from '../classes/Network'

export type Action = {
  type: string
} & ActionOptions

export type ActionRecipients = UserId | UserId[] | 'all'

export type ActionOptions = {
  /** The user who sent this action */
  $from?: UserId
  /**
   * The intended recipients of this action.
   */
  $to?: ActionRecipients
  /**
   * The intended simultion (fixed) tick for this action.
   * If missing, the next simulation tick is assumed.
   * If this action is received late (after the desired tick has passed),
   * it is dispatched on the next tick.
   */
  $tick?: number
}

type ActionShape<A> = {
  [key in keyof A]: Validator<unknown, unknown> | string | number | MatchesCallback<unknown>
}

type MatchesCallback<A> = { matches: Validator<unknown, A>; callback: () => A }

export type ResolvedActionShape<A extends ActionShape<any>> = {
  [key in keyof A]: A[key] extends Validator<unknown, infer B>
    ? Validator<unknown, B>
    : A[key] extends MatchesCallback<infer C>
    ? Validator<unknown, C>
    : A[key] extends string | number
    ? Validator<unknown, A[key]>
    : never
}

type IsNullable<T> = null extends T ? true : undefined extends T ? true : false

type JustOptionalKeys<A extends ActionShape<any>> = {
  [key in keyof A]: A[key] extends Validator<unknown, infer B> ? (true extends IsNullable<B> ? key : never) : never
}[keyof A]

type JustRequiredKeys<A extends ActionShape<any>> = {
  [key in keyof A]: A[key] extends Validator<unknown, infer B> ? (true extends IsNullable<B> ? never : key) : never
}[keyof A]

type ActionFromShape<S extends ActionShape<any>> = {
  [key in keyof S]: S[key] extends Validator<unknown, unknown>
    ? S[key]['_TYPE']
    : S[key] extends MatchesCallback<S[key]>
    ? S[key]['matches']
    : S[key]
}

type JustOptionals<S extends ActionShape<any>> = Omit<
  Partial<Pick<ActionFromShape<S>, JustOptionalKeys<S>>>,
  JustRequiredKeys<S>
>
type JustRequired<S extends ActionShape<any>> = Omit<Pick<ActionFromShape<S>, JustRequiredKeys<S>>, JustOptionalKeys<S>>

type PartialAction<S extends ActionShape<any>> = Omit<JustRequired<S> & JustOptionals<S> & Action, 'type'>

type FromAnyUserValidators = 'matchesFromAny' | 'matchesFromUser'

type ActionCreatorOptions<S extends ActionShape<any>, Extensions, AllowDispatchFromAny extends boolean | void> = {
  allowDispatchFromAny?: AllowDispatchFromAny
  extensions?: (matches: Validator<unknown, unknown>) => Extensions
  initAction?: (action: Required<ActionFromShape<S> & Action>) => void
}

type ResolvedActionType<S extends ActionShape<any>, AllowDispatchFromAny extends boolean | void> = Required<
  ActionFromShape<S> & Action
> &
  (true extends IsNullable<AllowDispatchFromAny>
    ? {}
    : true extends AllowDispatchFromAny
    ? { __ALLOW_DISPATCH_FROM_ANY: true }
    : {})

export function defineActionCreator<
  Shape extends ActionShape<Action>,
  Extensions,
  AllowDispatchFromAny extends boolean | void = void
>(actionShape: Shape, _opts?: ActionCreatorOptions<Shape, Extensions, AllowDispatchFromAny>) {
  type ResolvedAction = ResolvedActionType<ResolvedActionShape<Shape>, AllowDispatchFromAny>

  const shapeEntries = Object.entries(actionShape)

  // handle callback shape properties
  const valueEntries = shapeEntries.filter((k, v) => typeof v === 'object' && 'callback' in v) as Array<
    [string, MatchesCallback<any>]
  >
  const valueMatches = Object.fromEntries(valueEntries.map(([k, v]) => [k, v.matches]))
  const values = Object.fromEntries(valueEntries.map(([k, v]) => [k, v.callback()]) as [string, any])

  // handle literal shape properties
  const literalEntries = shapeEntries.filter(([k, v]) => typeof v !== 'object') as Array<[string, string | number]>
  const literalValidators = Object.fromEntries(literalEntries.map(([k, v]) => [k, matches.literal(v)]))

  const actionCreator = (partialAction: PartialAction<Shape>) => {
    let action = { ...partialAction, ...Object.fromEntries(literalEntries), ...values } as ResolvedAction
    return action
  }

  const validActionShape = Object.assign(actionShape, literalValidators, valueMatches) as any // as ResolvedActionShape<Shape>
  const matchesShape = matches.shape(validActionShape) as Validator<unknown, ResolvedAction>

  actionCreator.actionShape = actionShape as Shape
  actionCreator.type = actionShape.type
  actionCreator.matches = matches.every(matchesShape, matchesActionFromHost)
  actionCreator.matchesFromAny = matchesShape
  actionCreator.matchesFromUser = (userId: UserId) => matches.every(matchesShape, matchesActionFromUser(userId))
  const matchExtensions = _opts?.extensions?.(matchesShape)
  Object.assign(actionCreator, matchExtensions)

  type ValidatorKeys = true extends AllowDispatchFromAny ? FromAnyUserValidators : never
  type FunctionProps = Pick<typeof actionCreator, 'type' | 'actionShape' | 'matches' | ValidatorKeys> & Extensions
  return actionCreator as unknown as ((partialAction: PartialAction<Shape>) => ResolvedAction) & FunctionProps
}

// const x = {allowDispatchFromAny: undefined}
// type ValidatorKeys = true extends AllowDispatchFromAny ? FromAnyUserValidators : never

const matchesVec3Shape = matches.shape({
  x: matches.number,
  y: matches.number,
  z: matches.number
})

const matchesQuatShape = matches.shape({
  x: matches.number,
  y: matches.number,
  z: matches.number,
  w: matches.number
})

export const matchesVector3 = matches.guard((v): v is Vector3 => matchesVec3Shape.test(v))
export const matchesQuaternion = matches.guard((v): v is Quaternion => matchesQuatShape.test(v))

export const matchesUserId = matches.string as Validator<unknown, UserId>
export const matchesNetworkId = matches.number as Validator<unknown, NetworkId>

export const matchesActionFromUser = (userId: UserId) => {
  return matches.shape({ $from: matches.literal(userId) })
}

export const matchesActionFromHost = matches.guard((v): v is { $from: UserId } => {
  if (typeof v !== 'object') return false
  if (v && '$from' in v) {
    return v['$from'] === useWorld().hostId
  }
  return false
})

export const matchesWithInitializer = <V extends Validator<unknown, A>, A>(matches: V, callback: () => A) => {
  return { matches, callback }
}
