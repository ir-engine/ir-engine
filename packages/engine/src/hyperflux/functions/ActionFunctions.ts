import { Engine } from 'src/ecs/classes/Engine'

import { UserId } from '@xrengine/common/src/interfaces/UserId'

import matches, { Validator } from '../MatchesUtils'
import StoreFunctions from './StoreFunctions'

export type Action = {
  type: string
} & ActionOptions

export type ActionRecipients = UserId | UserId[] | 'all' | 'local' | 'others'

export type ActionCacheOptions =
  | boolean
  | {
      /**
       * If non-falsy, remove previous actions in the cache that match `$from` and `type` fields,
       * and any specified fields
       */
      removePrevious?: boolean | string[]
      /**
       * If true, do not cache this action
       */
      disable?: boolean
    }

export type ActionOptions = {
  /** The user who sent this action */
  $from?: UserId

  /**
   * The intended recipients of this action.
   */
  $to?: ActionRecipients

  /**
   * The intended simulation (fixed) tick for this action.
   * - If this option is missing, the next simulation tick is assumed.
   * - If this action is received late (after the desired tick has passed),
   * it is dispatched on the next tick.
   */
  $tick?: number

  /**
   * Specifies how this action should be cached for newly joining clients.
   */
  $cache?: ActionCacheOptions
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

type ResolvedActionType<S extends ActionShape<any>> = Required<ActionFromShape<S> & Action>

/**
 *
 * @param actionShape
 * @param options
 *
 * @author Gheric Speiginer <github.com/speigg>
 */
function defineAction<A extends Action, Shape extends ActionShape<A>>(
  actionShape: ActionShape<A>,
  initAction?: (action: ResolvedActionType<ResolvedActionShape<Shape>> & Action) => void
) {
  type ResolvedAction = ResolvedActionType<ResolvedActionShape<Shape>>

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
    const action = {
      ...allValuesNull,
      ...partialAction,
      ...Object.fromEntries(literalEntries),
      ...initializerValues
    } as ResolvedAction
    initAction?.(action)
    return action
  }

  const matchesShape = matches.shape(resolvedActionShape) as Validator<unknown, ResolvedAction>

  actionCreator.actionShape = actionShape as Shape
  actionCreator.resolvedActionShape = resolvedActionShape
  actionCreator.type = actionShape.type
  actionCreator.matches = matchesShape // matches.every(matchesShape, matchesActionFromTrusted)
  /**
   * @deprecated
   */
  actionCreator.matchesFromAny = matchesShape
  actionCreator.matchesFromUser = (userId: UserId) => matches.every(matchesShape, matches.actionFromUser(userId))

  type ValidatorKeys = 'matches' | 'matchesFromUser' | 'matchesFromAny'
  type FunctionProps = Pick<typeof actionCreator, 'type' | 'actionShape' | ValidatorKeys>
  return actionCreator as unknown as ((partialAction: PartialAction<Shape>) => ResolvedAction) & FunctionProps
}

function _createModifier<A extends Action>(action: A) {
  const modifier = {
    /**
     * Dispatch to select recipients
     */
    to(to: ActionRecipients) {
      if (action) {
        action.$to = to
        if (to === 'local') {
          const store = StoreFunctions.getStore()
          store.actions.incoming.push(action as any)
          const idx = store.actions.outgoing.indexOf(action as any)
          if (idx >= 0) store.actions.outgoing.splice(idx, 1)
        }
      }
      return modifier
    },
    /**
     * Dispatch on a future tick
     * @param tickOffset The number of ticks in the future specifying when this action should be dispatched.
     * Default is 2 ticks in the future
     */
    delay(tickOffset: number) {
      if (action) action.$tick = Engine.currentWorld.fixedTick + tickOffset
      return modifier
    },
    /**
     * Cache this action to replay for clients that join late
     *
     * @param cache The cache options
     * - Default: true
     */
    cache(cache = true as ActionCacheOptions) {
      if (action) action.$cache = cache
      return modifier
    }
  }
  return modifier
}

const dispatchAction = <A extends Action>(action: A) => {
  const world = Engine.currentWorld
  action.$from = action.$from ?? Engine.userId
  action.$to = action.$to ?? 'all'
  action.$tick = action.$tick ?? world.fixedTick + 1
  world.store.actions.outgoing.push(action)
  return _createModifier(action)
}

export const dispatchLocalAction = <A extends Action>(action: A) => {
  return dispatchAction(action).to('local')
}

function addActionReceptor(receptor: () => {}) {
  const store = StoreFunctions.getStore()
  store.receptors.push(receptor)
}

function removeActionReceptor(receptor: () => {}) {
  const store = StoreFunctions.getStore()
  const idx = store.receptors.indexOf(receptor)
  if (idx >= 0) store.reactors.splice(idx, 1)
}

export default {
  defineAction,
  dispatchAction,
  dispatchLocalAction,
  addActionReceptor,
  removeActionReceptor
}
