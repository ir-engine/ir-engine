import React from 'react'
import Reconciler from 'react-reconciler'
import {
  ConcurrentRoot,
  ContinuousEventPriority,
  DefaultEventPriority,
  DiscreteEventPriority
} from 'react-reconciler/constants'

const ReactorReconciler = Reconciler({
  getPublicInstance: (instance) => instance,
  getRootHostContext: () => null,
  getChildHostContext: (parentHostContext) => parentHostContext,
  prepareForCommit: () => null,
  resetAfterCommit: () => {},
  createInstance: () => {
    throw new Error('Only logical components are supported in a HyperFlux Reactor')
  },
  appendInitialChild: () => {},
  finalizeInitialChildren: () => {
    return false
  },
  prepareUpdate: () => null,
  shouldSetTextContent: () => false,
  createTextInstance: () => {
    throw new Error('Only logical components are supported in a HyperFlux Reactor')
  },
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,
  isPrimaryRenderer: false,
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  preparePortalMount: () => {},
  // @ts-ignore
  getCurrentEventPriority: () => DefaultEventPriority,
  beforeActiveInstanceBlur: () => {},
  afterActiveInstanceBlur: () => {},
  detachDeletedInstance: () => {},
  getInstanceFromNode: () => null,
  getInstanceFromScope: () => null,
  prepareScopeUpdate: () => {}
})

export interface ReactorRoot {
  isRunning: boolean
  run: () => Promise<void>
  stop: () => Promise<void>
}

export interface ReactorProps {
  root: ReactorRoot
}

export function createReactor(Reactor: React.FC<ReactorProps>): ReactorRoot {
  const isStrictMode = false
  const concurrentUpdatesByDefaultOverride = true
  const identifierPrefix = ''
  const onRecoverableError = (err) => console.error(err)

  const root = ReactorReconciler.createContainer(
    null,
    ConcurrentRoot,
    null,
    isStrictMode,
    concurrentUpdatesByDefaultOverride,
    identifierPrefix,
    onRecoverableError,
    null
  )

  const reactorRoot = {
    isRunning: false,
    run() {
      reactorRoot.isRunning = true
      return new Promise<void>((resolve) => {
        ReactorReconciler.updateContainer(<Reactor root={root} />, root, null, () => resolve())
      })
    },
    stop() {
      return new Promise<void>((resolve) => {
        ReactorReconciler.updateContainer(null, root, null, () => resolve())
      }).then(() => {
        reactorRoot.isRunning = false
      })
    }
  }

  return reactorRoot
}
