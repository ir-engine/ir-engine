import { State } from '@speigg/hookstate'

import { Action, ActionReceptor } from './ActionFunctions'

export interface HyperStore {
  networked: boolean
  id: string
  state: Map<string, State<any>>
  actions: {
    /** All actions that have been dispatched */
    history: Array<Required<Action>>
    /** Cached actions */
    cached: Array<Required<Action>>
    /** Incoming actions */
    incoming: Array<Required<Action>>
    /** Outgoing actions */
    outgoing: Array<Required<Action>>
  }
  receptors: Array<ActionReceptor>
  reactors: Array<() => void>
  _reactorRoots: WeakMap<() => void, any>
}

function createStore(options: { id: string; networked?: boolean }) {
  return {
    id: options.id,
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
    _reactorRoots: new WeakMap()
  } as HyperStore
}

// function destroyStore(store = getStore()) {
//     for (const reactor of [...store.reactors]) {
//         StateFunctions.removeStateReactor(reactor)
//     }
// }

export default {
  createStore
}
