import { createState, SetInitialStateAction, State } from '@hookstate/core'
import React from 'react'
import Reconciler from 'react-reconciler'

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

const ReactorReconciler = Reconciler({
  getPublicInstance: (instance) => instance,
  getRootHostContext: () => null,
  getChildHostContext: (parentHostContext) => parentHostContext,
  prepareForCommit: () => null,
  resetAfterCommit: () => {},
  createInstance: () => {
    throw new Error('Only functional components are supported in ReactorReconciler')
  },
  appendInitialChild: () => {},
  finalizeInitialChildren: () => {
    return false
  },
  prepareUpdate: () => null,
  shouldSetTextContent: () => false,
  createTextInstance: () => {
    throw new Error('Only functional components are supported in ReactorReconciler')
  },
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,
  now: performance.now,
  isPrimaryRenderer: false,
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  preparePortalMount: () => {}
})

function addStateReactor(reactor: () => void, store = HyperFlux.store) {
  let root = store.reactors.get(reactor)
  if (!root) {
    /**
     * @todo @speigg look into this
     */
    // @ts-ignore
    root = ReactorReconciler.createContainer(reactor, 0, false, null)
    ReactorReconciler.updateContainer(
      // @ts-ignore
      () => {
        reactor()
        return <></>
      },
      root,
      null
    )
    store.reactors.set(reactor, root)
  }
}

function removeStateReactor(reactorComponent: () => void, store = HyperFlux.store) {
  const root = store.reactors.get(reactorComponent)
  if (root) {
    ReactorReconciler.updateContainer(null, root, null)
  }
}

const stateNamespaceKey = 'xre.hyperflux'

/**
 * Automatically synchronises specific root paths of a hyperflux state definition with the localStorage.
 * Values get automatically populated if they exist in localStorage and saved when they are changed.
 * @param {StateDefinition} stateDefinition
 * @param {string[]} keys the root paths to synchronise
 */
const syncStateWithLocalStorage = (stateDefinition: ReturnType<typeof defineState<any>>, keys: string[]) => {
  const state = getState(stateDefinition)

  for (const key of keys) {
    const storedValue = localStorage.getItem(`${stateNamespaceKey}.${stateDefinition.name}.${key}`)
    if (storedValue !== null) state[key].set(JSON.parse(storedValue))
  }

  state.attach(() => ({
    id: Symbol('syncStateWithLocalStorage'),
    init: () => ({
      onSet(arg) {
        for (const key of keys) {
          if (arg.merged?.[key]) {
            localStorage.setItem(
              `${stateNamespaceKey}.${stateDefinition.name}.${key}`,
              JSON.stringify(state[key].get({ noproxy: true }))
            )
          }
        }
      }
    })
  }))
}

export default {
  defineState,
  registerState,
  getState,
  addStateReactor,
  removeStateReactor,
  syncStateWithLocalStorage
}
