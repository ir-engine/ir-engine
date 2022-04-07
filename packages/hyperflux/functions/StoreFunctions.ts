import { State } from '@speigg/hookstate'

import { Action, ActionReceptor } from './ActionFunctions'

export const allowStateMutations = Symbol('allowMutations')
export const reactorRoots = Symbol('reactorRoots')

export interface HyperStore {
  /** A function which returns the dispatch id assigned to actions */
  getDispatchId: () => string
  /**
   *
   */
  [allowStateMutations]: boolean
  /**
   *  If this store is networked, actions are dispatched on the outgoing queue.
   *  If this store is not networked, actions are dispatched on the incoming queue.
   */
  networked: boolean
  state: Map<string, State<any>>
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

function createHyperStore(options: { getDispatchId: () => string; networked?: boolean }) {
  return {
    getDispatchId: options.getDispatchId,
    [allowStateMutations]: false,
    networked: options.networked ?? false,
    state: new Map<string, State<any>>(),
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
