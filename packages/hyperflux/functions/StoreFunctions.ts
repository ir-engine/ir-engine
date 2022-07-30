import { Downgraded, State } from '@hookstate/core'
import { merge } from 'lodash'
import { Validator } from 'ts-matches'

import ActionFunctions from './ActionFunctions'
import { ActionReceptor, ResolvedActionType, Topic } from './ActionFunctions'

export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never
export interface HyperStore {
  /**
   * The topic to dispatch to when none are supplied
   */
  defaultTopic: Topic
  /**
   *  If false, actions are dispatched on the incoming queue.
   *  If true, actions are dispatched on the incoming queue and then forwarded to the outgoing queue.
   */
  forwardIncomingActions: (action: Required<ResolvedActionType>) => boolean
  /**
   * A function which returns the dispatch id assigned to actions
   * */
  getDispatchId: () => string
  /**
   * A function which returns the current dispatch time (units are arbitrary)
   */
  getDispatchTime: () => number
  /**
   * The default dispatch delay (default is 0)
   */
  defaultDispatchDelay: number
  /**
   * State dictionary
   */
  state: { [type: string]: State<any> }
  actions: {
    /** */
    queues: Map<Validator<any, any>, Array<Array<ResolvedActionType>>>
    /** Cached actions */
    cached: Array<Required<ResolvedActionType>>
    /** Incoming actions */
    incoming: Array<Required<ResolvedActionType>>
    /** All actions that have been applied, in the order they were processed */
    history: Array<Required<ResolvedActionType>>
    /** All action UUIDs that have been processed and should not be processed again */
    knownUUIDs: Set<string>
    /** Outgoing actions */
    outgoing: Record<
      string,
      {
        /** All actions that are waiting to be sent */
        queue: Array<Required<ResolvedActionType>>
        /** All actions that have been sent */
        history: Array<Required<ResolvedActionType>>
        /** All incoming action UUIDs that have been processed */
        historyUUIDs: Set<string>
      }
    >
  }
  /** functions that receive actions */
  receptors: ReadonlyArray<ActionReceptor>
  /** functions that re-run on state changes, compatible w/ React hooks */
  reactors: WeakMap<() => void, any>
}

export class HyperFlux {
  static store: HyperStore
}

function createHyperStore(options: {
  forwardIncomingActions?: (action: Required<ResolvedActionType>) => boolean
  getDispatchId: () => string
  getDispatchTime: () => number
  defaultDispatchDelay?: number
}) {
  const store = {
    defaultTopic: 'default' as Topic,
    forwardIncomingActions: options.forwardIncomingActions ?? (() => false),
    getDispatchId: options.getDispatchId,
    getDispatchTime: options.getDispatchTime,
    defaultDispatchDelay: options.defaultDispatchDelay ?? 0,
    state: {},
    actions: {
      queues: new Map(),
      cached: [],
      incoming: [],
      history: new Array(),
      knownUUIDs: new Set(),
      outgoing: {}
    },
    receptors: [],
    reactors: new WeakMap(),
    toJSON: () => {
      const state = Object.entries(store.state).reduce((obj, [name, state]) => {
        return merge(obj, { [name]: state.attach(Downgraded).value })
      }, {})
      return {
        ...store,
        state
      }
    }
  } as HyperStore
  HyperFlux.store = store
  ActionFunctions.addOutgoingTopicIfNecessary(store.defaultTopic)
  return store
}

// function destroyStore(store = getStore()) {
//   for (const reactor of [...store.reactors]) {
//     StateFunctions.removeStateReactor(reactor)
//   }
// }

export default {
  createHyperStore
}
