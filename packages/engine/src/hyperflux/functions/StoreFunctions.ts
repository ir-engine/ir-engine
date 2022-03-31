import { State } from '@speigg/hookstate'
import { Engine } from 'src/ecs/classes/Engine'

import { Action } from './ActionFunctions'

export interface HyperStore {
  state: Map<string, State<any>>
  actions: {
    history: Array<Action>
    cached: Array<Action>
    incoming: Array<Action>
    outgoing: Array<Action>
  }
  receptors: Array<() => void>
  reactors: Array<() => void>
  _reactorRoots: WeakMap<() => void, any>
}

function createStore() {
  return {
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

function getStore(world = Engine.currentWorld) {
  return world.store
}

// function destroyStore(store = getStore()) {
//     for (const reactor of [...store.reactors]) {
//         StateFunctions.removeStateReactor(reactor)
//     }
// }

export default {
  createStore,
  getStore
}
