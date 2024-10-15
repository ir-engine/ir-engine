/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { hookstate, State } from '@hookstate/core'
import React, { Suspense, useTransition } from 'react'
import Reconciler from 'react-reconciler'
import { ConcurrentRoot, DefaultEventPriority } from 'react-reconciler/constants'

import { isDev } from './EnvironmentConstants'
import { HyperFlux } from './StoreFunctions'

export const ReactorReconciler = Reconciler({
  warnsIfNotActing: true,
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
  rendererPackageName: '@ir-engine/hyperflux-reactor',
  version: '18.2.0'
})

export type ReactorRoot = {
  fiber: any
  Reactor: React.FC
  ReactorContainer: React.FC
  isRunning: State<boolean>
  suspended: State<boolean>
  errors: State<Error[]>
  cleanupFunctions: Set<() => void>
  run: () => void
  stop: () => void
}

type ErrorHandler = (error: Error, info: React.ErrorInfo) => void
type ErrorHandlingComponent<Props> = (props: Props, error?: Error) => React.ReactNode

type ErrorState = { error?: Error }

export function createErrorBoundary<P extends { children: React.ReactNode }>(
  component: ErrorHandlingComponent<P>,
  errorHandler?: ErrorHandler
): React.ComponentType<P> {
  return class extends React.Component<P, ErrorState> {
    state: ErrorState = {
      error: undefined
    }

    static getDerivedStateFromError(error: Error) {
      return { error }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
      if (errorHandler) {
        errorHandler(error, info)
      }
    }

    render() {
      return component(this.props, this.state.error)
    }
  }
}

export const ReactorErrorBoundary = createErrorBoundary<{ children: React.ReactNode; reactorRoot: ReactorRoot }>(
  function error(props, error?: Error) {
    if (error) {
      console.error(error)
      props.reactorRoot.errors.merge([error])
      return null
    } else {
      return <React.Fragment>{props.children}</React.Fragment>
    }
  }
)

export const ErrorBoundary = createErrorBoundary(function error(props, error?: Error) {
  if (error) {
    return null
  } else {
    return <React.Fragment>{props.children}</React.Fragment>
  }
})

const ReactorRootContext = React.createContext<ReactorRoot>(undefined as any)

export function useReactorRootContext(): ReactorRoot {
  return React.useContext(ReactorRootContext)
}

export function startReactor(Reactor: React.FC): ReactorRoot {
  const isStrictMode = false
  const concurrentUpdatesByDefaultOverride = true
  const identifierPrefix = ''
  const onRecoverableError = (err) => {
    console.error(err, reactorRoot)
    reactorRoot.errors.merge([err])
  }

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

  const ReactorContainer = () => {
    const [isPending] = useTransition()
    reactorRoot.suspended.set(isPending)
    return (
      <ReactorRootContext.Provider value={reactorRoot}>
        <Suspense fallback={<></>}>
          <ReactorErrorBoundary key="reactor-error-boundary" reactorRoot={reactorRoot}>
            <Reactor />
          </ReactorErrorBoundary>
        </Suspense>
      </ReactorRootContext.Provider>
    )
  }

  const run = () => {
    reactorRoot.isRunning.set(true)
    HyperFlux.store.activeReactors.add(reactorRoot)
    ReactorReconciler.flushSync(() => ReactorReconciler.updateContainer(<ReactorContainer />, fiberRoot))
  }

  const stop = () => {
    if (!reactorRoot.isRunning.value) return Promise.resolve()
    ReactorReconciler.flushSync(() => ReactorReconciler.updateContainer(null, fiberRoot))
    reactorRoot.isRunning.set(false)
    HyperFlux.store.activeReactors.delete(reactorRoot)
    reactorRoot.cleanupFunctions.forEach((fn) => fn())
    reactorRoot.cleanupFunctions.clear()
  }

  const reactorRoot = {
    fiber: fiberRoot,
    Reactor,
    isRunning: hookstate(false),
    errors: hookstate([] as Error[]),
    suspended: hookstate(false),
    cleanupFunctions: new Set(),
    ReactorContainer: ReactorContainer as React.FC,
    promise: undefined!,
    run,
    stop
  } as ReactorRoot

  reactorRoot.run()

  return reactorRoot
}
