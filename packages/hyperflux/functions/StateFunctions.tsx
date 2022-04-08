import { createState, SetInitialStateAction } from '@speigg/hookstate'
import React from 'react'
import Reconciler from 'react-reconciler'

import { allowStateMutations, HyperStore, reactorRoots } from './StoreFunctions'

export * from '@speigg/hookstate'

type StateDefinition<S> = { name: string; initial: SetInitialStateAction<S> }

function defineState<S>(name: string, initial: SetInitialStateAction<S>): StateDefinition<S> {
  return { name, initial }
}

function registerState<S extends StateDefinition<any>>(store: HyperStore, State: S) {
  if (State.name in store.state) throw new Error(`State ${State.name} has already been registered in Store`)
  store.state[State.name] = createState(State.initial)
}

function getMutableState<S extends StateDefinition<any>>(store: HyperStore, State: S) {
  if (!store[allowStateMutations]) throw new Error('Mutable state can only be accessed inside a receptor function')
  if (!store.state[State.name]) throw new Error(`State ${State.name} is not registered in Store`)
  return store.state[State.name] as ReturnType<typeof State.initial>
}

function getState<S extends StateDefinition<any>>(store: HyperStore, State: S) {
  if (!store.state[State.name]) throw new Error(`State ${State.name} is not registered in Store`)
  return store.state[State.name]!.value as Readonly<ReturnType<typeof State.initial>['value']>
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
  const roots = store[reactorRoots]
  let root = roots.get(reactor)
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
  }
}

function removeStateReactor(store: HyperStore, reactorComponent: () => void) {
  const roots = store[reactorRoots]
  const root = roots.get(reactorComponent)
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
