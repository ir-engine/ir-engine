import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { deepEqual } from '@xrengine/engine/src/common/functions/deepEqual'

import { matches, matchesActionFromUser, MatchesWithDefault, Validator } from '../utils/MatchesUtils'
import { allowStateMutations, HyperStore } from './StoreFunctions'

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

type Shape<A extends any> = {
  [key in keyof A]: key extends keyof ActionOptions
    ? A[key]
    : A[key] extends Validator<unknown, unknown>
    ? A[key]
    : A[key] extends string | number | boolean | any
    ? A[key] | Validator<unknown, A[key]>
    : A[key] extends MatchesWithDefault<unknown>
    ? A[key]
    : never
}

type ActionShape = Shape<Action> // & Shape<{[key:string]:any}>

export type ResolvedActionShape<A extends ActionShape> = {
  [key in keyof A]: A[key] extends Validator<unknown, infer B>
    ? Validator<unknown, B>
    : A[key] extends MatchesWithDefault<infer C>
    ? Validator<unknown, C>
    : A[key] extends string | number | boolean | any
    ? Validator<unknown, A[key]>
    : never
}

export type PartialActionShape<A extends ActionShape> = {
  [key in keyof A]: A[key] extends Validator<unknown, infer B>
    ? Validator<unknown, B>
    : A[key] extends MatchesWithDefault<infer C>
    ? Validator<unknown, C | undefined>
    : A[key] extends string | number | boolean | any
    ? Validator<unknown, A[key] | undefined>
    : never
}

type ActionTypeFromShape<S> = {
  [key in keyof S]: S[key] extends Validator<unknown, unknown>
    ? S[key]['_TYPE']
    : S[key] extends MatchesWithDefault<S[key]>
    ? S[key]['matches']
    : S[key]
} & Action

type IsOptional<T> = null extends T ? true : undefined extends T ? true : false

type JustOptionalKeys<A> = {
  [key in keyof A]: A[key] extends Validator<unknown, infer B>
    ? true extends IsOptional<B>
      ? key
      : never
    : true extends IsOptional<A[key]>
    ? key
    : never
}[keyof A]

type JustRequiredKeys<A> = {
  [key in keyof A]: A[key] extends Validator<unknown, infer B>
    ? true extends IsOptional<B>
      ? never
      : key
    : true extends IsOptional<A[key]>
    ? never
    : key
}[keyof A]

type JustOptionals<S> = Pick<S, JustOptionalKeys<S>>
type JustRequired<S> = Pick<S, JustRequiredKeys<S>>

type PartialActionType<S extends ActionShape> = Partial<JustOptionals<S>> & Required<JustRequired<S>>

export type ResolvedActionFromShape<S extends ActionShape> = ActionTypeFromShape<ResolvedActionShape<S>> &
  Required<Action>
export type PartialActionFromShape<S extends ActionShape> = Omit<
  PartialActionType<ActionTypeFromShape<PartialActionShape<S>>>,
  'type'
>

/**
 * Defines an action
 * @param actionShape
 * @returns a function that creates the defined action
 */
function defineAction<Shape extends ActionShape>(actionShape: Shape) {
  type ResolvedAction = ResolvedActionFromShape<Shape>
  type PartialAction = PartialActionFromShape<Shape>

  const shapeEntries = Object.entries(actionShape)

  // handle default callback properties
  const defaultEntries = shapeEntries.filter(
    ([k, v]) =>
      typeof v === 'object' && ('defaultValue' in v || ('parser' in v && v.parser.description.name === 'Default'))
  ) as Array<[string, MatchesWithDefault<any> | Validator<unknown, unknown>]>
  const defaultValidators = Object.fromEntries(
    defaultEntries.map(([k, v]) => [k, v instanceof Validator ? v : v.matches])
  )

  // handle literal shape properties
  const literalEntries = shapeEntries.filter(([k, v]) => typeof v !== 'object') as Array<
    [string, string | number | boolean]
  >
  const literalValidators = Object.fromEntries(literalEntries.map(([k, v]) => [k, matches.literal(v)]))

  // handle option properties
  const optionEntries = shapeEntries.filter(([k, v]) => k.startsWith('$')) as Array<
    [string, ActionOptions[keyof ActionOptions]]
  >
  const optionValidators = Object.fromEntries(
    optionEntries.map(([k, v]) => [k, matches.guard<unknown, typeof v>((val): val is typeof v => deepEqual(val, v))])
  )

  // create resolved action shape
  const resolvedActionShape = Object.assign(
    {},
    actionShape,
    optionValidators,
    literalValidators,
    defaultValidators
  ) as any
  const allValuesNull = Object.fromEntries(Object.entries(resolvedActionShape).map(([k]) => [k, null]))

  const matchesShape = matches.shape(resolvedActionShape) as Validator<unknown, ResolvedAction>

  const actionCreator = (partialAction: PartialAction) => {
    const defaultValues = Object.fromEntries(
      defaultEntries.map(([k, v]) => [
        k,
        partialAction[k] ?? ('defaultValue' in v ? v.defaultValue() : v.parser['defaultValue'])
      ]) as [string, any]
    )
    let action = {
      ...allValuesNull,
      ...Object.fromEntries([...optionEntries, ...literalEntries]),
      ...defaultValues,
      ...partialAction
    }
    return matchesShape.unsafeCast(action) //as ResolvedAction
  }

  actionCreator.actionShape = actionShape
  actionCreator.resolvedActionShape = resolvedActionShape as ResolvedActionShape<Shape>
  actionCreator.type = actionShape.type
  actionCreator.matches = matchesShape
  actionCreator.matchesFromUser = (userId: UserId) => matches.every(matchesShape, matchesActionFromUser(userId))
  return actionCreator
}

/**
 * Dispatch actions to the store.
 * @param store
 * @param action
 */
const dispatchAction = <A extends Action>(store: HyperStore, action: A) => {
  action.$from = action.$from ?? (store.getDispatchId() as UserId)
  action.$to = action.$to ?? 'all'
  action.$time = action.$time ?? store.getDispatchTime() + store.defaultDispatchDelay
  action.$cache = action.$cache ?? false
  store.networked
    ? store.actions.outgoing.push(action as Required<Action>)
    : store.actions.incoming.push(action as Required<Action>)
}

/**
 * Adds an action receptor to the store
 * @param store
 * @param receptor
 */
function addActionReceptor(store: HyperStore, receptor: ActionReceptor) {
  store.receptors.push(receptor)
}

/**
 * Removes an action receptor from the store
 * @param store
 * @param receptor
 */
function removeActionReceptor(store: HyperStore, receptor: ActionReceptor) {
  const idx = store.receptors.indexOf(receptor)
  if (idx >= 0) store.receptors.splice(idx, 1)
}

const _updateCachedActions = (store: HyperStore, incomingAction: Required<Action>) => {
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

const _applyAndArchiveIncomingAction = (store: HyperStore, action: Required<Action>) => {
  try {
    store[allowStateMutations] = true
    for (const receptor of [...store.receptors]) receptor(action)
    store[allowStateMutations] = false
    _updateCachedActions(store, action)
    store.actions.history.push(action)
  } catch (e) {
    store.actions.history.push({ $ERROR: e, ...action } as any)
    console.error(e)
  } finally {
    const idx = store.actions.incoming.indexOf(action)
    store.actions.incoming.splice(idx, 1)
  }
}

/**
 * This function should be called when an action is received from the network
 *
 * @param store
 * @param action
 */
const applyIncomingActions = (store: HyperStore) => {
  const { incoming } = store.actions
  const now = store.getDispatchTime()
  for (const action of [...incoming]) {
    if (action.$time > now) {
      continue
    }
    console.log(`${store.name} ACTION ${action.type}`, action)
    _applyAndArchiveIncomingAction(store, action)
  }
}

/**
 * This function should be called when an authoritative node needs to send actions to the network
 * and also process the actions locally
 * @param store
 */
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
  applyIncomingActions,
  loopbackOutgoingActions
}
