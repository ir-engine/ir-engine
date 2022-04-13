import { createState, SetInitialStateAction, State } from '@speigg/hookstate'
import React from 'react'
import Reconciler from 'react-reconciler'

import { allowStateMutations, HyperStore } from './StoreFunctions'

export * from '@speigg/hookstate'

type StateDefinition<S> = { name: string; initial: SetInitialStateAction<S> }

function defineState<S>(name: string, initial: SetInitialStateAction<S>): StateDefinition<S> {
  return { name, initial }
}

function registerState(store: HyperStore, StateDefinition: StateDefinition<any>) {
  if (StateDefinition.name in store.state)
    throw new Error(`State ${StateDefinition.name} has already been registered in Store`)
  store.state[StateDefinition.name] = createState(StateDefinition.initial)
}

function getMutableState<S>(store: HyperStore, StateDefinition: StateDefinition<S>) {
  if (!store[allowStateMutations]) throw new Error('Mutable state can only be accessed inside a receptor function')
  if (!store.state[StateDefinition.name]) throw new Error(`State ${StateDefinition.name} is not registered in Store`)
  return store.state[StateDefinition.name] as State<S>
}

function getState<S>(store: HyperStore, StateDefinition: StateDefinition<S>) {
  if (!store.state[StateDefinition.name]) throw new Error(`State ${StateDefinition.name} is not registered in Store`)
  return store.state[StateDefinition.name]!.value as Readonly<S>
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

function addStateReactor(store: HyperStore, reactor: () => void) {
  let root = store.reactors.get(reactor)
  if (!root) {
    root = ReactorReconciler.createContainer(reactor, 0, false, null)
    ReactorReconciler.updateContainer(
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

function removeStateReactor(store: HyperStore, reactorComponent: () => void) {
  const root = store.reactors.get(reactorComponent)
  if (root) {
    ReactorReconciler.updateContainer(null, root, null)
  }
}

export default {
  defineState,
  registerState,
  getMutableState,
  getState,
  addStateReactor,
  removeStateReactor
}
