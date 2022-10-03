
import React, {ReactNode} from 'react'
import Reconciler from 'react-reconciler'
import {
  DiscreteEventPriority,
  ContinuousEventPriority,
  DefaultEventPriority,
  ConcurrentRoot
} from 'react-reconciler/constants';
import { } from 'scheduler'
import { HyperFlux } from './StoreFunctions'

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
  isPrimaryRenderer: false,
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  preparePortalMount: () => {},
  getCurrentEventPriority: () => DefaultEventPriority,
  beforeActiveInstanceBlur: () => {},
  afterActiveInstanceBlur: () => {},
  detachDeletedInstance: () => {},
  getInstanceFromNode: () => null,
  getInstanceFromScope: () => null,
  prepareScopeUpdate: () => {},
})
  
function createReactor(reactor: () => void, store = HyperFlux.store) {
  const isStrictMode = false
  const concurrentUpdatesByDefaultOverride = true
  const identifierPrefix = ''
  const onRecoverableError = (err) => console.error(err)
  const root = ReactorReconciler.createContainer(reactor, ConcurrentRoot, null, isStrictMode, concurrentUpdatesByDefaultOverride, identifierPrefix, onRecoverableError, null)
    ReactorReconciler.updateContainer(
      () => {
        reactor()
        return <></>
      } as ReactNode,
      root,
      null
    )
    store.reactors.set(reactor, root)
  }
}

function destroyReactor(reactorComponent: () => void, store = HyperFlux.store) {
  const root = store.reactors.get(reactorComponent)
  if (root) {
    ReactorReconciler.updateContainer(null, root, null)
  }
}

export {
  createReactor,
  destroyReactor
}