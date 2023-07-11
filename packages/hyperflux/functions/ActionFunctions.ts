/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { MathUtils } from 'three'
import { matches, Parser, Validator } from 'ts-matches'

import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import multiLogger from '@etherealengine/common/src/logger'
import { deepEqual } from '@etherealengine/engine/src/common/functions/deepEqual'

import { HyperFlux } from './StoreFunctions'

const logger = multiLogger.child({ component: 'hyperflux:Action' })

export type Topic = OpaqueType<'topicId'> & string

export type Action = {
  /**
   * The type of action
   */
  type: string
} & ActionOptions

export type ActionReceptor = (action: ResolvedActionType) => void

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
   * The id of the sender's socket
   * Will be undefined if dispatched locally or not in a network
   */
  $peer?: PeerID

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

  $topic?: Topic

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

export type ActionShape<ActionType extends Action> = {
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
    ? Validator<unknown, Exclude<B, Validator<any, any>>>
    : Shape[key] extends MatchesWithDefault<infer C>
    ? Validator<unknown, Exclude<C, Validator<any, any>>>
    : Shape[key] extends string | number | boolean | any
    ? Validator<unknown, Exclude<Shape[key], Validator<any, any>>>
    : never
}

// type t = ResolvedActionShape<{store:'test', type:'hello', $cache: {removePrevious: true}, count: MatchesWithDefault<number>}>

export type ResolvedActionShapeWithOptionals<Shape extends ActionShape<any>> = {
  [key in keyof Shape]: Shape[key] extends Validator<unknown, infer B>
    ? Validator<unknown, Exclude<B, Validator<any, any>>>
    : Shape[key] extends MatchesWithDefault<infer C>
    ? Validator<unknown, Exclude<C, Validator<any, any>> | undefined>
    : Shape[key] extends string | number | boolean | any
    ? Validator<unknown, Exclude<Shape[key], Validator<any, any>> | undefined>
    : never
}

// type t = PartialActionShape<{store:'test', type:'hello', param: number, count: MatchesWithDefault<number>}>

type ActionTypeFromShape<Shape extends ActionShape<any>> = {
  [key in keyof Shape]: Shape[key] extends Validator<unknown, infer A>
    ? Shape[key]['_TYPE'] | A
    : Shape[key] extends MatchesWithDefault<Shape[key]>
    ? Shape[key]['matches']
    : Exclude<Shape[key], Validator<any, any>>
}

// type x = ResolvedActionShape<ActionShape<any>>
// // type t = ResolvedActionType<ActionShape<any>>
// type z = ResolvedActionType
// type t = ResolvedActionType<{store:'test', type:Validator<unknown,'hello'>|'hello', name:string, param: Validator<unknown,number>, count: MatchesWithDefault<number>}>

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

export type ResolvedActionType<Shape extends ActionShape<Action> = ActionShape<{ type: string }>> = Required<
  ActionTypeFromShape<ResolvedActionShape<Shape>> & ActionOptions
>
export type PartialActionType<Shape extends ActionShape<any>> = Omit<
  Partial<ActionTypeFromShape<JustOptionals<ResolvedActionShapeWithOptionals<Shape>>>> &
    ActionOptions &
    Required<ActionTypeFromShape<JustRequired<ResolvedActionShapeWithOptionals<Shape>>>>,
  'type' | 'store'
>

// type t = PartialActionType<{store:'TEST',type:'TEST',name:string, bla:Validator<unknown, any>}>
// type t2 = ResolvedActionShape<{type:'test', count:MatchesWithDefault<number>}>
// type t3 = ResolvedActionShapeWithOptionals<{type:'test', count:MatchesWithDefault<number>}>
// type t = PartialActionType<{type:'test', count:MatchesWithDefault<number>}>

/**
 * Defines an action
 * @param actionShape
 * @returns a function that creates an instance of the defined action
 */
function defineAction<Shape extends ActionShape<Action>>(actionShape: Shape) {
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
  delete resolvedActionShape.$cache
  delete resolvedActionShape.$topic

  const allValuesNull = Object.fromEntries(Object.entries(resolvedActionShape).map(([k]) => [k, null]))

  const matchesShape = matches.shape(resolvedActionShape) as Validator<unknown, ResolvedAction>

  const actionCreator = (partialAction: PartialAction) => {
    const defaultValues = Object.fromEntries(
      defaultEntries.map(([k, v]) => [
        k,
        partialAction[k] ?? ('defaultValue' in v ? v.defaultValue() : v.parser['defaultValue'])
      ]) as [string, any]
    )
    const action = {
      $from: HyperFlux.store?.getDispatchId(),
      ...allValuesNull,
      ...Object.fromEntries([...optionEntries, ...literalEntries]),
      ...defaultValues,
      ...partialAction
    }
    return matchesShape.unsafeCast(action) as ResolvedAction
  }

  actionCreator.actionShape = actionShape
  actionCreator.resolvedActionShape = resolvedActionShape as ResolvedActionShape<Shape>
  actionCreator.type = actionShape.type as Shape['type']
  actionCreator.matches = matchesShape

  return actionCreator
}

/**
 * Dispatch actions to the store.
 * @param action
 * @param topics @todo potentially in the future, support dispatching to multiple topics
 * @param store
 */
const dispatchAction = <A extends Action>(action: A) => {
  const storeId = HyperFlux.store.getDispatchId()
  const agentId = HyperFlux.store.getPeerId()

  action.$from = action.$from ?? (storeId as UserId)
  action.$peer = action.$peer ?? (agentId as PeerID)
  action.$to = action.$to ?? 'all'
  action.$time = action.$time ?? HyperFlux.store.getDispatchTime() + HyperFlux.store.defaultDispatchDelay()
  action.$cache = action.$cache ?? false
  action.$uuid = action.$uuid ?? MathUtils.generateUUID()
  const topic = (action.$topic = action.$topic ?? HyperFlux.store.defaultTopic)

  if (process.env.APP_ENV === 'development' && !action.$stack) {
    const trace = { stack: '' }
    Error.captureStackTrace?.(trace, dispatchAction) // In firefox captureStackTrace is undefined
    const stack = trace.stack.split('\n')
    stack.shift()
    action.$stack = stack
  }

  HyperFlux.store.actions.incoming.push(action as Required<ResolvedActionType>)
  if (!HyperFlux.store.forwardIncomingActions(action as Required<ResolvedActionType>)) {
    addOutgoingTopicIfNecessary(topic)
    HyperFlux.store.actions.outgoing[topic].queue.push(action as Required<ResolvedActionType>)
  }
}

function addOutgoingTopicIfNecessary(topic: string) {
  if (!HyperFlux.store.actions.outgoing[topic]) {
    logger.info(`Added topic ${topic}`)
    HyperFlux.store.actions.outgoing[topic] = {
      queue: [],
      history: [],
      historyUUIDs: new Set()
    }
  }
}

function removeActionsForTopic(topic: string) {
  logger.info(`Removing actions with topic ${topic}`)
  for (const action of HyperFlux.store.actions.history) {
    if (action.$topic.includes(topic)) {
      HyperFlux.store.actions.knownUUIDs.delete(action.$uuid)
    }
  }
  delete HyperFlux.store.actions.outgoing[topic]
}

/**
 * Adds an action receptor to the store
 * @param receptor
 * @deprecated use defineActionQueue instead
 */
function addActionReceptor(receptor: ActionReceptor) {
  logger.info(`Added Receptor ${receptor.name}`)
  ;(HyperFlux.store.receptors as Array<ActionReceptor>).push(receptor)
}

/**
 * Removes an action receptor from the store
 * @param store
 * @param receptor
 * @deprecated use defineActionQueue instead
 */
function removeActionReceptor(receptor: ActionReceptor) {
  const idx = HyperFlux.store.receptors.indexOf(receptor)
  if (idx >= 0) {
    logger.info(`Removed Receptor ${receptor.name}`)
    ;(HyperFlux.store.receptors as Array<ActionReceptor>).splice(idx, 1)
  }
}

const _updateCachedActions = (incomingAction: Required<ResolvedActionType>) => {
  if (incomingAction.$cache) {
    const cachedActions = HyperFlux.store.actions.cached
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

const applyIncomingActionsToAllQueues = (action: Required<ResolvedActionType>) => {
  for (const [shapeHash, queueDefintions] of HyperFlux.store.actions.queueDefinitions) {
    if (queueDefintions[0]?.test(action)) {
      for (const queues of queueDefintions) {
        if (!HyperFlux.store.actions.queues.has(queues)) continue
        HyperFlux.store.actions.queues.get(queues)!.push(action)
      }
    }
  }
}

const _applyIncomingAction = (action: Required<ResolvedActionType>) => {
  // ensure actions are idempotent
  if (HyperFlux.store.actions.knownUUIDs.has(action.$uuid)) {
    //Certain actions were causing logger.info to throw errors since it JSON.stringifies inputs, and those
    //actions had circular references. Just try/catching the logger.info call was not catching them properly,
    //So the solution was to attempt to JSON.stringify them manually first to see if that would error.
    try {
      const jsonStringified = JSON.stringify(action)
      logger.info('Repeat action %o', action)
    } catch (err) {
      console.log('error in logging action', action)
    }
    const idx = HyperFlux.store.actions.incoming.indexOf(action)
    HyperFlux.store.actions.incoming.splice(idx, 1)
    return
  }

  _updateCachedActions(action)

  applyIncomingActionsToAllQueues(action)

  try {
    //Certain actions were causing logger.info to throw errors since it JSON.stringifies inputs, and those
    //actions had circular references. Just try/catching the logger.info call was not catching them properly,
    //So the solution was to attempt to JSON.stringify them manually first to see if that would error.
    try {
      const jsonStringified = JSON.stringify(action)
      logger.info(`[Action]: ${action.type} %o`, action)
    } catch (err) {
      console.log('error in logging action', action)
    }
    for (const receptor of [...HyperFlux.store.receptors]) receptor(action)
    if (HyperFlux.store.forwardIncomingActions(action)) {
      addOutgoingTopicIfNecessary(action.$topic)
      HyperFlux.store.actions.outgoing[action.$topic].queue.push(action)
    }
  } catch (e) {
    const message = (e as Error).message
    const stack = (e as Error).stack!.split('\n')
    stack.shift()
    action.$ERROR = { message, stack }
    logger.error(e)
  } finally {
    HyperFlux.store.actions.history.push(action)
    HyperFlux.store.actions.knownUUIDs.add(action.$uuid)
    const idx = HyperFlux.store.actions.incoming.indexOf(action)
    HyperFlux.store.actions.incoming.splice(idx, 1)
  }
}

/**
 * Process incoming actions
 */
const applyIncomingActions = () => {
  const { incoming } = HyperFlux.store.actions
  const now = HyperFlux.store.getDispatchTime()
  for (const action of [...incoming]) {
    if (action.$time > now) {
      continue
    }
    _applyIncomingAction(action)
  }
}

/**
 * Clear the outgoing action queue
 * @param store
 */
const clearOutgoingActions = (topic: string) => {
  if (!HyperFlux.store.actions.outgoing[topic]) return
  const { queue, history, historyUUIDs } = HyperFlux.store.actions.outgoing[topic]
  for (const action of queue) {
    history.push(action)
    historyUUIDs.add(action.$uuid)
  }
  queue.length = 0
}

function defineActionQueue<V extends Validator<unknown, ResolvedActionType>>(shape: V[] | V) {
  const shapes = Array.isArray(shape) ? shape : [shape]
  const shapeHash = shapes.map(Parser.parserAsString).join('|')

  const actionQueueDefinition = (): V['_TYPE'][] => {
    if (!HyperFlux.store.actions.queueDefinitions.has(shapeHash))
      HyperFlux.store.actions.queueDefinitions.set(shapeHash, [])

    if (!HyperFlux.store.actions.queueDefinitions.get(shapeHash)!.includes(actionQueueDefinition))
      HyperFlux.store.actions.queueDefinitions.get(shapeHash)!.push(actionQueueDefinition)

    if (!HyperFlux.store.actions.queues.has(actionQueueDefinition)) {
      HyperFlux.store.actions.queues.set(
        actionQueueDefinition,
        HyperFlux.store.actions.history.filter(actionQueueDefinition.test)
      )
      HyperFlux.store.getCurrentReactorRoot()?.cleanupFunctions.add(() => {
        removeActionQueue(actionQueueDefinition)
      })
    }

    const queue = HyperFlux.store.actions.queues.get(actionQueueDefinition)!
    const result = [...queue]
    queue.length = 0
    return result
  }

  actionQueueDefinition.test = (a: Action) => {
    return shapes.some((s) => s.test(a))
  }

  actionQueueDefinition.shapeHash = shapeHash

  return actionQueueDefinition
}

/**
 * @deprecated use defineActionQueue instead
 */
const createActionQueue = defineActionQueue

export type ActionQueueDefinition = ReturnType<typeof defineActionQueue>

const removeActionQueue = (queueFunction: ActionQueueDefinition) => {
  const queueDefinitions = HyperFlux.store.actions.queueDefinitions.get(queueFunction.shapeHash)
  if (queueDefinitions) queueDefinitions.splice(queueDefinitions.indexOf(queueFunction), 1)
  if (!queueDefinitions?.length) HyperFlux.store.actions.queueDefinitions.delete(queueFunction.shapeHash)
  HyperFlux.store.actions.queues.delete(queueFunction)
}

export {
  defineAction,
  dispatchAction,
  addActionReceptor,
  removeActionReceptor,
  createActionQueue,
  defineActionQueue,
  removeActionQueue,
  addOutgoingTopicIfNecessary,
  removeActionsForTopic,
  applyIncomingActions,
  clearOutgoingActions
}

export type MatchesWithDefault<A> = { matches: Validator<unknown, A>; defaultValue: () => A }

export type ActionCreator<A extends ActionShape<Action>> = {
  (partialAction?: PartialActionType<A>): Required<ActionTypeFromShape<ResolvedActionShape<A>> & ActionOptions>
  actionShape: A
  resolvedActionShape: ResolvedActionShape<A>
  type: A['type']
  matches: Validator<unknown, ResolvedActionType<A>>
}
