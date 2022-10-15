import { createState, SetInitialStateAction, State, useHookstate } from '@hookstate/core'
import React from 'react'

import multiLogger from '@xrengine/common/src/logger'

import { HyperFlux, HyperStore } from './StoreFunctions'

export * from '@hookstate/core'

const isReactRendering = () =>
  !!(React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current

/**
 * Automatically wraps the given hookstate in a useHookstate hook, if react is rendering.
 * @param state
 * @returns
 */
export const autoUse = <S, E = {}>(state: State<S, E>): State<S, E> => {
  if (isReactRendering()) return useHookstate(state)
  return state
}

const logger = multiLogger.child({ component: 'hyperflux:State' })

type StateDefinition<S> = {
  name: string
  initial: SetInitialStateAction<S>
  onCreate?: (store: HyperStore, state: State<S>) => void
}

export function defineState<S>(definition: StateDefinition<S>) {
  return definition
}

export function registerState<S>(StateDefinition: StateDefinition<S>, store = HyperFlux.store) {
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

export function getState<S>(StateDefinition: StateDefinition<S>, store = HyperFlux.store) {
  if (!store.state[StateDefinition.name]) registerState(StateDefinition, store)
  return store.state[StateDefinition.name] as State<S>
}

export default {
  defineState,
  registerState,
  getState
}
