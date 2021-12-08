import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Vector3, Quaternion } from 'three'
import matches, { Validator } from 'ts-matches'
import { Engine } from '../../ecs/classes/Engine'
import { useWorld } from '../../ecs/functions/SystemHooks'

export type Action = {
  type: string
} & ActionOptions

export type ActionRecipients = UserId | UserId[] | 'all' | 'local'

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
  [key in keyof A]: A[key] extends Validator<unknown, unknown>
    ? A[key]
    : A[key] extends string
    ? string
    : A[key] extends number
    ? number
    : A[key] extends MatchesCallback<unknown>
    ? A[key]
    : never
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

/**
 *
 * @param actionShape
 * @param options
 *
 * @author Gheric Speiginer <github.com/speigg>
 */
export function defineActionCreator<
  A extends Action,
  Shape extends ActionShape<A>,
  Extensions,
  AllowDispatchFromAny extends boolean | void = void
>(actionShape: ActionShape<A>, options?: ActionCreatorOptions<Shape, Extensions, AllowDispatchFromAny>) {
  type ResolvedAction = ResolvedActionType<ResolvedActionShape<Shape>, AllowDispatchFromAny>

  const shapeEntries = Object.entries(actionShape)

  // handle callback shape properties
  const initializerEntries = shapeEntries.filter(([k, v]) => typeof v === 'object' && 'callback' in v) as Array<
    [string, MatchesCallback<any>]
  >
  const initializerMatches = Object.fromEntries(initializerEntries.map(([k, v]) => [k, v.matches]))

  // handle literal shape properties
  const literalEntries = shapeEntries.filter(([k, v]) => typeof v !== 'object') as Array<[string, string | number]>
  const literalValidators = Object.fromEntries(literalEntries.map(([k, v]) => [k, matches.literal(v)]))
  const resolvedActionShape = Object.assign({}, actionShape, literalValidators, initializerMatches) as any // as ResolvedActionShape<Shape>
  const allValuesNull = Object.fromEntries(Object.entries(resolvedActionShape).map(([k]) => [k, null]))

  const actionCreator = (partialAction: PartialAction<Shape>) => {
    const initializerValues = Object.fromEntries(
      initializerEntries.map(([k, v]) => [k, partialAction[k] ?? v.callback()]) as [string, any]
    )
    return {
      ...allValuesNull,
      ...partialAction,
      ...Object.fromEntries(literalEntries),
      ...initializerValues
    } as ResolvedAction
  }

  const matchesShape = matches.shape(resolvedActionShape) as Validator<unknown, ResolvedAction>

  actionCreator.actionShape = actionShape as Shape
  actionCreator.resolvedActionShape = resolvedActionShape
  actionCreator.type = actionShape.type
  actionCreator.matches = matches.every(matchesShape, matchesActionFromTrusted)
  actionCreator.matchesFromAny = matchesShape
  actionCreator.matchesFromUser = (userId: UserId) => matches.every(matchesShape, matchesActionFromUser(userId))
  const matchExtensions = options?.extensions?.(matchesShape)
  Object.assign(actionCreator, matchExtensions)

  type ValidatorKeys = true extends AllowDispatchFromAny ? FromAnyUserValidators : 'matches'
  type FunctionProps = Pick<typeof actionCreator, 'type' | 'actionShape' | ValidatorKeys> & Extensions
  return actionCreator as unknown as ((partialAction: PartialAction<Shape>) => ResolvedAction) & FunctionProps
}

// const x = {allowDispatchFromAny: undefined}
// type ValidatorKeys = true extends AllowDispatchFromAny ? FromAnyUserValidators : never

const matchesVec3Shape = matches.shape({
  x: matches.number,
  y: matches.number,
  z: matches.number
})

const matchesQuatShape = matches.some(
  matches.shape({
    _x: matches.number,
    _y: matches.number,
    _z: matches.number,
    _w: matches.number
  }),
  matches.shape({
    x: matches.number,
    y: matches.number,
    z: matches.number,
    w: matches.number
  })
)

export const matchesVector3 = matches.guard((v): v is Vector3 => matchesVec3Shape.test(v))
export const matchesQuaternion = matches.guard((v): v is Quaternion => matchesQuatShape.test(v))
export const matchesUserId = matches.string as Validator<unknown, UserId>
export const matchesNetworkId = matches.number as Validator<unknown, NetworkId>

export const matchesActionFromUser = (userId: UserId) => {
  return matches.shape({ $from: matches.literal(userId) })
}

/**
 * match when we are the server and we are supposed to receive it, or when it is dispatched locally
 */

export const matchesActionFromTrusted = matches.guard((v): v is { $from: UserId } => {
  if (typeof v !== 'object') return false
  if (v && '$from' in v) {
    return (
      (v['$from'] === useWorld().hostId && (v['$to'] === 'all' || v['$to'] === Engine.userId)) || v['$to'] === 'local'
    )
  }
  return false
})

export const matchesWithInitializer = <V extends Validator<unknown, A>, A>(matches: V, callback: () => A) => {
  return { matches, callback }
}

export { matches }
