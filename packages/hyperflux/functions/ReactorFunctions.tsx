import React, { useEffect } from 'react'
import Reconciler from 'react-reconciler'
import {
  ConcurrentRoot,
  ContinuousEventPriority,
  DefaultEventPriority,
  DiscreteEventPriority
} from 'react-reconciler/constants'

import { isDev } from '@etherealengine/common/src/config'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'

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
  run: () => Promise<void>
  stop: () => Promise<void>
}

export interface ReactorProps {
  root: ReactorRoot
}

export function startReactor(Reactor: React.FC<ReactorProps>): ReactorRoot {
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
    run() {
      if (reactorRoot.isRunning) return Promise.resolve()
      reactorRoot.isRunning = true
      return new Promise<void>((resolve) => {
        Engine.instance.activeReactors.add(reactorRoot)
        ReactorReconciler.updateContainer(<Reactor root={reactorRoot} />, fiberRoot, null, () => resolve())
      })
    },
    stop() {
      if (!reactorRoot.isRunning) return Promise.resolve()
      return new Promise<void>((resolve) => {
        ReactorReconciler.updateContainer(null, fiberRoot, null, () => {
          reactorRoot.isRunning = false
          Engine.instance.activeReactors.delete(reactorRoot)
          resolve()
        })
      })
    }
  }

  reactorRoot.run()

  return reactorRoot
}
