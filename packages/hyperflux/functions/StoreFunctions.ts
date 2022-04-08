import { State } from '@speigg/hookstate'

import { Action, ActionReceptor } from './ActionFunctions'

export const allowStateMutations = Symbol('allowMutations')
export const reactorRoots = Symbol('reactorRoots')

export interface HyperStore {
  /**
   * The name of this store, used for logging
   */
  name: string
  /**
   *  If this store is networked, actions are dispatched on the outgoing queue.
   *  If this store is not networked, actions are dispatched on the incoming queue.
   */
  networked: boolean
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
   *
   */
  [allowStateMutations]: boolean
  /**
   * State dictionary
   */
  state: { [name: string]: State<any> }
  actions: {
    /** All incoming actions that have been proccessed */
    history: Array<Required<Action>>
    /** Cached actions */
    cached: Array<Required<Action>>
    /** Incoming actions */
    incoming: Array<Required<Action>>
    /** Outgoing actions */
    outgoing: Array<Required<Action>>
  }
  /** functions that receive actions */
  receptors: Array<ActionReceptor>
  /** functions that re-run on state changes, compatible w/ React hooks */
  reactors: Array<() => void>
  [reactorRoots]: WeakMap<() => void, any>
}

function createHyperStore(options: {
  name: string
  networked?: boolean
  getDispatchId: () => string
  getDispatchTime: () => number
  defaultDispatchDelay?: number
}) {
  return {
    name: options.name,
    networked: options.networked ?? false,
    getDispatchId: options.getDispatchId,
    getDispatchTime: options.getDispatchTime,
    defaultDispatchDelay: options.defaultDispatchDelay ?? 0,
    [allowStateMutations]: false,
    state: {},
    actions: {
      history: new Array<Action>(),
      cached: new Array<Action>(),
      incoming: new Array<Action>(),
      outgoing: new Array<Action>()
    },
    receptors: new Array<() => {}>(),
    reactors: new Array<() => {}>(),
    [reactorRoots]: new WeakMap()
  } as HyperStore
}

// function destroyStore(store = getStore()) {
//     for (const reactor of [...store.reactors]) {
//         StateFunctions.removeStateReactor(reactor)
//     }
// }

export default {
  createHyperStore
}
