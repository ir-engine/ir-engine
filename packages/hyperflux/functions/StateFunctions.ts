import { createState, SetInitialStateAction, State } from '@hookstate/core'

import multiLogger from '@xrengine/common/src/logger'

import { HyperFlux, HyperStore } from './StoreFunctions'

export * from '@hookstate/core'

const logger = multiLogger.child({ component: 'hyperflux:State' })

type StateDefinition<S> = {
  name: string
  initial: SetInitialStateAction<S>
  onCreate?: (store: HyperStore, state: State<S>) => void
}

function defineState<S>(definition: StateDefinition<S>) {
  return definition
}

function registerState<S>(StateDefinition: StateDefinition<S>, store = HyperFlux.store) {
  logger.info(`registerState ${StateDefinition.name}`)
  if (StateDefinition.name in store.state) {
    const err = new Error(`State ${StateDefinition.name} has already been registered in Store`)
    logger.error(err)
    throw err
  }
  const initial =
    typeof StateDefinition.initial === 'function'
      ? (StateDefinition.initial as Function)()
      : JSON.parse(JSON.stringify(StateDefinition.initial))
  store.state[StateDefinition.name] = createState(initial)
  if (StateDefinition.onCreate) StateDefinition.onCreate(store, getState(StateDefinition, store))
}

function getState<S>(StateDefinition: StateDefinition<S>, store = HyperFlux.store) {
  if (!store.state[StateDefinition.name]) registerState(StateDefinition, store)
  return store.state[StateDefinition.name] as State<S>
}

export default {
  defineState,
  registerState,
  getState
}
