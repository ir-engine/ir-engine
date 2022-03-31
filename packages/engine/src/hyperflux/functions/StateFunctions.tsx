import { State } from '@speigg/hookstate'
import React from 'react'
import Reconciler from 'react-reconciler'

import StoreFunctions from './StoreFunctions'

type StateDefinition<S> = { name: string; initializer: () => State<S> }

function defineState<S>(name: string, initializer: () => State<S>): StateDefinition<S> {
  return { name, initializer }
}

function getMutableState<S extends StateDefinition<any>>(State: S) {
  const store = StoreFunctions.getStore()
  if (!store.state.has(State.name)) store.state.set(State.name, State.initializer())
  return store.state.get(State.name) as ReturnType<typeof State.initializer>
}

function getState<S extends StateDefinition<any>>(State: S) {
  const store = StoreFunctions.getStore()
  if (!store.state.has(State.name)) store.state.set(State.name, State.initializer())
  return store.state.get(State.name)!.value as Readonly<ReturnType<typeof State.initializer>['value']>
}

const ReactorReconciler = Reconciler({
  getPublicInstance: () => {
    return {}
  },
  getRootHostContext: () => {
    return null
  },
  getChildHostContext: (parentHostContext) => {
    return parentHostContext
  },
  prepareForCommit: () => null,
  resetAfterCommit: () => {},
  createInstance: () => {
    throw new Error('Only functional components are supported in ReactorReconciler')
  },
  appendInitialChild: () => {},
  finalizeInitialChildren: () => {
    return false
  },
  prepareUpdate: () => {},
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

function addStateReactor(reactor: () => void) {
  const roots = StoreFunctions.getStore()._reactorRoots
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

function removeStateReactor(reactorComponent: () => void) {
  const roots = StoreFunctions.getStore()._reactorRoots
  const root = roots.get(reactorComponent)
  if (root) {
    ReactorReconciler.updateContainer(null, root, null)
  }
}

export default {
  defineState,
  getMutableState,
  getState,
  addStateReactor,
  removeStateReactor
}
