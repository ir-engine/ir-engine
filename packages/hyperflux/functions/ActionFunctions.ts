import { MathUtils } from 'three'
import { matches, Validator } from 'ts-matches'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { deepEqual } from '@xrengine/engine/src/common/functions/deepEqual'

import { HyperStore } from './StoreFunctions'

export type Action<StoreName extends string> = {
  /**
   * The name of the store on which the action is dispatched
   */
  store: StoreName
  /**
   * The type of action
   */
  type: string
} & ActionOptions

export type ActionReceptor<StoreName extends string> = (action: Action<StoreName>) => void

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
   * The uuid of this action, uniquely identifying it
   */
  $uuid?: string

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

  /**
   * This action is being replayed from the cache
   */
  $fromCache?: true

  /**
   * The call stack at the time the action was dispatched
   */
  $stack?: string[]

  /**
   * An error that occurred while applying this action
   */
  $ERROR?: { message: string; stack: string[] }
}

type ActionShape<ActionType extends Action<any>> = {
  [key in keyof ActionType]: key extends ActionType
    ? ActionType[key]
    : ActionType[key] extends Validator<unknown, unknown>
    ? ActionType[key]
    : ActionType[key] extends string | number | boolean | any
    ? ActionType[key] | Validator<unknown, ActionType[key]>
    : ActionType[key] extends MatchesWithDefault<unknown>
    ? ActionType[key]
    : never
}

// type t = ActionShape<{store:'test', type:'hello', $cache: {removePrevious: true}, count: MatchesWithDefault<number>}>

export type ResolvedActionShape<Shape extends ActionShape<any>> = {
  [key in keyof Shape]: Shape[key] extends Validator<unknown, infer B>
    ? Validator<unknown, B>
    : Shape[key] extends MatchesWithDefault<infer C>
    ? Validator<unknown, C>
    : Shape[key] extends string | number | boolean | any
    ? Validator<unknown, Shape[key]>
    : never
}

// type t = ResolvedActionShape<{store:'test', type:'hello', $cache: {removePrevious: true}, count: MatchesWithDefault<number>}>

export type ResolvedActionShapeWithOptionals<Shape extends ActionShape<any>> = {
  [key in keyof Shape]: Shape[key] extends Validator<unknown, infer B>
    ? Validator<unknown, B>
    : Shape[key] extends MatchesWithDefault<infer C>
    ? Validator<unknown, C | undefined> | C | undefined
    : Shape[key] extends string | number | boolean | any
    ? Validator<unknown, Shape[key] | undefined> | Shape[key] | undefined
    : never
}

// type t = PartialActionShape<{store:'test', type:'hello', param: number, count: MatchesWithDefault<number>}>

type ActionTypeFromShape<Shape extends ActionShape<any>> = {
  [key in keyof Shape]: Shape[key] extends Validator<unknown, infer A>
    ? Shape[key]['_TYPE'] | A
    : Shape[key] extends MatchesWithDefault<Shape[key]>
    ? Shape[key]['matches']
    : Shape[key]
}

// type t = ActionTypeFromShape<{store:'test', type:Validator<unknown,'hello'>, name:string, param: Validator<unknown,number>, count: MatchesWithDefault<number>}>

type IsOptional<T> = null extends T ? true : undefined extends T ? true : false

type JustOptionalKeys<Shape extends ActionShape<any>> = {
  [key in keyof Shape]: Shape[key] extends Validator<unknown, infer B>
    ? true extends IsOptional<B>
      ? key
      : never
    : true extends IsOptional<Shape[key]>
    ? key
    : never
}[keyof Shape]

type JustRequiredKeys<Shape extends ActionShape<any>> = {
  [key in keyof Shape]: Shape[key] extends Validator<unknown, infer B>
    ? true extends IsOptional<B>
      ? never
      : key
    : true extends IsOptional<Shape[key]>
    ? never
    : key
}[keyof Shape]

type JustOptionals<S extends ActionShape<any>> = Pick<S, JustOptionalKeys<S>>
type JustRequired<S extends ActionShape<any>> = Pick<S, JustRequiredKeys<S>>

export type ResolvedActionType<Shape extends ActionShape<any>> = Required<
  ActionTypeFromShape<ResolvedActionShape<Shape>> & ActionOptions
>
export type PartialActionType<Shape extends ActionShape<any>> = Omit<
  Partial<ActionTypeFromShape<JustOptionals<ResolvedActionShapeWithOptionals<Shape>>>> &
    ActionOptions &
    Required<ActionTypeFromShape<JustRequired<ResolvedActionShapeWithOptionals<Shape>>>>,
  'type' | 'store'
>

// type t = PartialActionType<{store:'TEST',type:'TEST',name:string, bla:Validator<unknown, any>}>

/**
 * Defines an action
 * @param actionShape
 * @returns a function that creates an instance of the defined action
 */
function defineAction<StoreName extends string, Shape extends ActionShape<Action<StoreName>>>(actionShape: Shape) {
  type ResolvedAction = ResolvedActionType<Shape>
  type PartialAction = PartialActionType<Shape>

  const shapeEntries = Object.entries(actionShape)

  // handle default callback properties
  const defaultEntries = shapeEntries.filter(
    ([k, v]: [string, any]) =>
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

  const actionCreator = (partialAction: PartialAction = {} as any) => {
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
    return matchesShape.unsafeCast(action) as ResolvedAction
  }

  actionCreator.actionShape = actionShape
  actionCreator.resolvedActionShape = resolvedActionShape as ResolvedActionShape<Shape>
  actionCreator.type = actionShape.type
  actionCreator.matches = matchesShape

  return actionCreator
}

/**
 * Dispatch actions to the store.
 * @param store
 * @param action
 */
const dispatchAction = <StoreName extends string, A extends Action<StoreName>>(
  store: HyperStore<StoreName>,
  action: A
) => {
  if (store.name !== action.store) throw new Error('Store mismatch')

  const storeId = store.getDispatchId()

  action.$from = action.$from ?? (storeId as UserId)
  action.$to = action.$to ?? 'all'
  action.$time = action.$time ?? store.getDispatchTime() + store.defaultDispatchDelay
  action.$cache = action.$cache ?? false
  action.$uuid = action.$uuid ?? MathUtils.generateUUID()

  if (process.env.APP_ENV === 'development' && !action.$stack) {
    const trace = { stack: '' }
    Error.captureStackTrace?.(trace, dispatchAction) // In firefox captureStackTrace is undefined
    const stack = trace.stack.split('\n')
    stack.shift()
    action.$stack = stack
  }

  const mode = store.getDispatchMode()
  if (mode === 'local' || mode === 'host') store.actions.incoming.push(action as Required<Action<StoreName>>)
  else store.actions.outgoing.push(action as Required<Action<StoreName>>)
}

/**
 * Adds an action receptor to the store
 * @param store
 * @param receptor
 */
function addActionReceptor<StoreName extends string>(
  store: HyperStore<StoreName>,
  receptor: ActionReceptor<StoreName>
) {
  ;(store.receptors as Array<ActionReceptor<StoreName>>).push(receptor)
}

/**
 * Removes an action receptor from the store
 * @param store
 * @param receptor
 */
function removeActionReceptor<StoreName extends string>(
  store: HyperStore<StoreName>,
  receptor: ActionReceptor<StoreName>
) {
  const idx = store.receptors.indexOf(receptor)
  if (idx >= 0) (store.receptors as Array<ActionReceptor<StoreName>>).splice(idx, 1)
}

const _updateCachedActions = (store: HyperStore<any>, incomingAction: Required<Action<any>>) => {
  if (incomingAction.$cache) {
    const cachedActions = store.actions.cached
    // see if we must remove any previous actions
    if (typeof incomingAction.$cache === 'boolean') {
      if (incomingAction.$cache) cachedActions.push(incomingAction)
    } else {
      const remove = incomingAction.$cache.removePrevious

      if (remove) {
        for (const a of [...cachedActions]) {
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

const _applyIncomingAction = (store: HyperStore<any>, action: Required<Action<any>>) => {
  // ensure actions are idempotent
  if (store.actions.incomingHistoryUUIDs.has(action.$uuid)) {
    const idx = store.actions.incoming.indexOf(action)
    store.actions.incoming.splice(idx, 1)
    return
  }

  try {
    console.log(`${store.name} ACTION ${action.type}`, action)
    for (const receptor of [...store.receptors]) receptor(action)
    store.actions.incomingHistory.push(action)
    if (store.getDispatchMode() === 'host') store.actions.outgoing.push(action)
  } catch (e) {
    const message = (e as Error).message
    const stack = (e as Error).stack!.split('\n')
    stack.shift()
    store.actions.incomingHistory.push({
      // @ts-ignore
      $ERROR: { message, stack },
      ...action
    })
    console.error(e)
  } finally {
    store.actions.incomingHistoryUUIDs.add(action.$uuid)
    const idx = store.actions.incoming.indexOf(action)
    store.actions.incoming.splice(idx, 1)
  }
}

/**
 * Process incoming actions
 *
 * @param store
 */
const applyIncomingActions = (store: HyperStore<any>) => {
  const states = Object.values(store.state)
  const { incoming } = store.actions
  const now = store.getDispatchTime()
  for (const action of [...incoming]) {
    if (action.$time > now) {
      continue
    }
    _updateCachedActions(store, action)
    const batchStateUpdatesAndApplyAction = states.reduce<() => void>(
      (prev, state) => {
        return () => {
          state.batch(() => prev(), action.$uuid + '')
        }
      },
      () => _applyIncomingAction(store, action)
    )
    batchStateUpdatesAndApplyAction()
  }
}

/**
 * Clear the outgoing action queue
 * @param store
 */
const clearOutgoingActions = (store: HyperStore<any>) => {
  const { outgoing, outgoingHistory, outgoingHistoryUUIDs } = store.actions
  for (const action of outgoing) {
    outgoingHistory.push(action)
    outgoingHistoryUUIDs.add(action.$uuid)
  }
  outgoing.length = 0
}

export default {
  defineAction,
  dispatchAction,
  addActionReceptor,
  removeActionReceptor,
  applyIncomingActions,
  clearOutgoingActions
}

export type MatchesWithDefault<A> = { matches: Validator<unknown, A>; defaultValue: () => A }
