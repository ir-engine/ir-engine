import { createState, SetInitialStateAction, State } from '@speigg/hookstate'
import React from 'react'
import Reconciler from 'react-reconciler'

import { HyperStore, StringLiteral } from './StoreFunctions'

export * from '@speigg/hookstate'

type StateDefinition<StoreName extends string, S> = {
  store: StringLiteral<StoreName>
  name: string
  initial: SetInitialStateAction<S>
}

function defineState<StoreName extends string, S>(definition: StateDefinition<StoreName, S>) {
  return definition
}

function registerState<StoreName extends string, S>(
  store: HyperStore<StoreName>,
  StateDefinition: StateDefinition<StoreName, S>
) {
  if (StateDefinition.name in store.state)
    throw new Error(`State ${StateDefinition.name} has already been registered in Store`)
  const initial =
    typeof StateDefinition.initial === 'function'
      ? (StateDefinition.initial as Function)()
      : JSON.parse(JSON.stringify(StateDefinition.initial))
  store.state[StateDefinition.name] = createState(initial)
}

function getState<StoreName extends string, S>(
  store: HyperStore<StoreName>,
  StateDefinition: StateDefinition<StoreName, S>
) {
  if (!store.state[StateDefinition.name]) throw new Error(`State ${StateDefinition.name} is not registered in Store`)
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

function addStateReactor(store: HyperStore<any>, reactor: () => void) {
  let root = store.reactors.get(reactor)
  if (!root) {
    /**
     * @todo @speigg look into this
     */
    // @ts-ignore
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

function removeStateReactor(store: HyperStore<any>, reactorComponent: () => void) {
  const root = store.reactors.get(reactorComponent)
  if (root) {
    ReactorReconciler.updateContainer(null, root, null)
  }
}

export default {
  defineState,
  registerState,
  getState,
  addStateReactor,
  removeStateReactor
}
