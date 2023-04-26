import React from 'react'
import Reconciler from 'react-reconciler'
import { ConcurrentRoot, DefaultEventPriority } from 'react-reconciler/constants'

import { isDev } from '@etherealengine/common/src/config'

import { HyperFlux } from './StoreFunctions'

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
  prepareScopeUpdate: () => {},
  clearContainer: () => {}
})

ReactorReconciler.injectIntoDevTools({
  bundleType: isDev ? 1 : 0,
  rendererPackageName: '@etherealengine/hyperflux-reactor',
  version: '18.2.0'
})

export interface ReactorRoot {
  fiber: any
  isRunning: boolean
  promise: Promise<void>
  cleanupFunctions: Set<() => void>
  run: () => Promise<void>
  stop: () => Promise<void>
}

export interface ReactorProps {
  root: ReactorRoot
}

export function startReactor(Reactor: React.FC<ReactorProps>, store = HyperFlux.store): ReactorRoot {
  const isStrictMode = false
  const concurrentUpdatesByDefaultOverride = true
  const identifierPrefix = ''
  const onRecoverableError = (err) => console.error(err)

  const fiberRoot = ReactorReconciler.createContainer(
    {},
    ConcurrentRoot,
    null,
    isStrictMode,
    concurrentUpdatesByDefaultOverride,
    identifierPrefix,
    onRecoverableError,
    null
  )

  if (!Reactor.name) Object.defineProperty(Reactor, 'name', { value: 'HyperFluxReactor' })

  const reactorRoot = {
    fiber: fiberRoot,
    isRunning: false,
    Reactor,
    promise: null! as Promise<void>,
    run() {
      if (reactorRoot.isRunning) return Promise.resolve()
      reactorRoot.isRunning = true
      return new Promise<void>((resolve) => {
        store.activeReactors.add(reactorRoot)
        ReactorReconciler.updateContainer(<Reactor root={reactorRoot} />, fiberRoot, null, () => resolve())
      })
    },
    stop() {
      if (!reactorRoot.isRunning) return Promise.resolve()
      return new Promise<void>((resolve) => {
        ReactorReconciler.updateContainer(null, fiberRoot, null, () => {
          reactorRoot.isRunning = false
          store.activeReactors.delete(reactorRoot)
          reactorRoot.cleanupFunctions.forEach((fn) => fn())
          reactorRoot.cleanupFunctions.clear()
          resolve()
        })
      })
    },
    cleanupFunctions: new Set()
  } as ReactorRoot

  reactorRoot.promise = reactorRoot.run()

  return reactorRoot
}
