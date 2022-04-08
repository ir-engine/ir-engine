import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { deepEqual } from '@xrengine/engine/src/common/functions/deepEqual'

import matches, { Validator } from '../MatchesUtils'
import StoreFunctions, { allowStateMutations, HyperStore } from './StoreFunctions'

export type Action = {
  type: string
} & ActionOptions

export type ActionReceptor = (action: Action) => void

export type ActionRecipients = UserId | UserId[] | 'all' | 'others'

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
  /**
   * The id of the sender
   */
  $from?: UserId

  /**
   * The intended recipients
   */
  $to?: ActionRecipients

  /**
   * The intended time for this action to be applied
   * - If this option is missing, the action is applied the next time applyIncomingActions() is called.
   * - If this action is received late (after the desired tick has passed), it is dispatched on the next tick.
   */
  $time?: number | undefined

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

type PartialAction<T> = Omit<Partial<T>, 'type'>

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
  const resolvedActionShape = Object.assign({}, actionShape, literalValidators, initializerMatches) as any
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
    } as any
    initAction?.(action)
    return action
  }

  const matchesShape = matches.shape(resolvedActionShape) as Validator<unknown, ResolvedAction>

  actionCreator.actionShape = actionShape as Shape
  actionCreator.resolvedActionShape = resolvedActionShape
  actionCreator.type = actionShape.type
  actionCreator.matches = matchesShape
  /**
   * @deprecated
   */
  actionCreator.matchesFromAny = matchesShape
  actionCreator.matchesFromUser = (userId: UserId) => matches.every(matchesShape, matches.actionFromUser(userId))

  type ValidatorKeys = 'matches' | 'matchesFromUser' | 'matchesFromAny'
  type FunctionProps = Pick<typeof actionCreator, 'type' | 'actionShape' | ValidatorKeys>
  return actionCreator as unknown as ((partialAction: PartialAction<ResolvedAction>) => ResolvedAction) & FunctionProps
}

function _createActionModifier<A extends Action>(action: A, store: HyperStore) {
  const modifier = {
    /**
     * Dispatch to select recipients
     */
    to(to: ActionRecipients) {
      action.$to = to
      return modifier
    },
    /**
     * Dispatch in the future
     * @param timeDelay The time delay
     */
    delay(timeDelay: number) {
      action.$time = store.getDispatchTime() + timeDelay
      return modifier
    },
    /**
     * Cache this action for possible replay
     *
     * @param cache The cache options
     * - Default: true
     */
    cache(cache = true as ActionCacheOptions) {
      action.$cache = cache
      return modifier
    }
  }
  return modifier
}

const dispatchAction = <A extends Action>(store: HyperStore, action: A) => {
  action.$from = action.$from ?? (store.getDispatchId() as UserId)
  action.$to = action.$to ?? 'all'
  action.$time = action.$time ?? store.getDispatchTime() + store.defaultDispatchDelay
  action.$cache = action.$cache ?? false
  store.networked
    ? store.actions.outgoing.push(action as Required<Action>)
    : store.actions.incoming.push(action as Required<Action>)
  return _createActionModifier(action, store)
}

function addActionReceptor(store: HyperStore, receptor: ActionReceptor) {
  store.receptors.push(receptor)
}

function removeActionReceptor(store: HyperStore, receptor: ActionReceptor) {
  const idx = store.receptors.indexOf(receptor)
  if (idx >= 0) store.reactors.splice(idx, 1)
}

const updateCachedActions = (store: HyperStore, incomingAction: Required<Action>) => {
  if (incomingAction.$cache) {
    const cachedActions = store.actions.cached
    // see if we must remove any previous actions
    if (typeof incomingAction.$cache === 'boolean') {
      if (incomingAction.$cache) cachedActions.push(incomingAction)
    } else {
      const remove = incomingAction.$cache.removePrevious

      if (remove) {
        for (const a of cachedActions) {
          if (a.$from === incomingAction.$from && a.type === incomingAction.type) {
            if (remove === true) {
              const idx = cachedActions.indexOf(a)
              cachedActions.splice(idx, 1)
            } else {
              let matches = true
              for (const key of remove) {
                if (!deepEqual(a[key], incomingAction[key])) {
                  matches = false
                  break
                }
              }
              if (matches) {
                const idx = cachedActions.indexOf(a)
                cachedActions.splice(idx, 1)
              }
            }
          }
        }
      }

      if (!incomingAction.$cache.disable) cachedActions.push(incomingAction)
    }
  }
}

const applyAndArchiveIncomingAction = (store: HyperStore, action: Required<Action>) => {
  try {
    store[allowStateMutations] = true
    for (const receptor of [...store.receptors]) receptor(action)
    store[allowStateMutations] = false
    updateCachedActions(store, action)
    store.actions.history.push(action)
  } catch (e) {
    store.actions.history.push({ $ERROR: e, ...action } as any)
    console.error(e)
  } finally {
    const idx = store.actions.incoming.indexOf(action)
    store.actions.incoming.splice(idx, 1)
  }
}

const applyIncomingActions = (store: HyperStore) => {
  const { incoming } = store.actions
  const now = store.getDispatchTime()
  for (const action of [...incoming]) {
    if (action.$time > now) {
      continue
    }
    console.log(`${store.name} ACTION ${action.type}`, action)
    applyAndArchiveIncomingAction(store, action)
  }
}

const loopbackOutgoingActions = (store: HyperStore) => {
  const { outgoing } = store.actions
  const dispatchId = store.getDispatchId()
  for (const action of outgoing) {
    if (action.$to === 'all' || (action.$to === 'others' && action.$from != dispatchId) || action.$to === dispatchId)
      store.actions.incoming.push(action)
  }
  outgoing.length = 0
}

export default {
  defineAction,
  dispatchAction,
  addActionReceptor,
  removeActionReceptor,
  updateCachedActions,
  applyIncomingActions,
  loopbackOutgoingActions
}
