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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { hookstate, none, State } from '@hookstate/core'
import React, { Profiler, Suspense, useTransition } from 'react'
import Reconciler, { Fiber, FiberRoot } from 'react-reconciler'
import { ConcurrentRoot, DefaultEventPriority } from 'react-reconciler/constants'
import { isFiberSuspenseAndTimedOut } from 'react-reconciler/reflection'
import { v4 as uuidv4 } from 'uuid'

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

export type ReflectionData = {
  hasSuspendedOrTimeoutInTree: boolean
}

export type ReactorRoot = {
  fiber: FiberRoot
  Reactor: React.FC
  ReactorContainer: React.FC
  isRunning: State<boolean>
  suspended: State<boolean>
  errors: State<Error[]>
  cleanupFunctions: Set<() => void>
  uuid: string
  run: () => void
  stop: () => void
  reflection: () => ReflectionData
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
      } else {
        console.error(error, info)
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

export const hasSuspendedOrTimeoutInTree = (fiber: Fiber, check = false) => {
  check = check || isFiberSuspenseAndTimedOut(fiber)
  if (check || fiber?.child == undefined) {
    return check
  }
  return hasSuspendedOrTimeoutInTree(fiber.child, check)
}

export const ErrorBoundary = createErrorBoundary<{ children: React.ReactNode; fallback?: React.ReactNode }>(
  function error(props, error?: Error) {
    if (error) {
      console.error(error)
      if (props.fallback) return <>{props.fallback}</>
      return null
    } else {
      return <React.Fragment>{props.children}</React.Fragment>
    }
  }
)

const ReactorRootContext = React.createContext<ReactorRoot>(undefined as any)

export function useReactorRootContext(): ReactorRoot {
  return React.useContext(ReactorRootContext)
}

/** @todo cyclical import means this can't be a hyperflux state */
export const ReactorRenderCounterState = hookstate(
  {} as Record<
    string,
    {
      count: number
      name: string
      time: number
      stack: string[]
      lastRender: number
      fiberCount: number
      peakFiberCount: number
    }
  >
)

const countFiberNodesRecursively = (fiber: any): number => {
  if (!fiber) return 0

  let count = 1

  if (fiber.child) {
    count += countFiberNodesRecursively(fiber.child)
  }

  if (fiber.sibling) {
    count += countFiberNodesRecursively(fiber.sibling)
  }

  return count
}

const calculateFiberNodes = (uuid: string) => {
  const reactorRoot = HyperFlux.store.activeReactors.get(uuid)
  if (!reactorRoot) return 0
  const fiberRoot = reactorRoot.fiber.current
  return countFiberNodesRecursively(fiberRoot)
}

const trackStats = false //isDev

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

  if (!Reactor['__name'] && Reactor.name) Reactor['__name'] = Reactor.name
  if (!Reactor['__name']) Reactor['__name'] = 'HyperFluxReactor'

  const ReactorContainer = () => {
    const [isPending] = useTransition()
    reactorRoot.suspended.set(isPending)
    const onRender = (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
      ReactorRenderCounterState[uuid].count.set((v) => v + 1)
      ReactorRenderCounterState[uuid].time.set(actualDuration)
      ReactorRenderCounterState[uuid].lastRender.set(commitTime)
      const fiberCount = calculateFiberNodes(uuid)
      ReactorRenderCounterState[uuid].fiberCount.set(fiberCount)
      ReactorRenderCounterState[uuid].peakFiberCount.set((curr) => Math.max(curr, fiberCount))
    }
    return (
      <ReactorRootContext.Provider value={reactorRoot}>
        <Suspense fallback={<></>}>
          <ReactorErrorBoundary key="reactor-error-boundary" reactorRoot={reactorRoot}>
            {trackStats ? (
              <Profiler id={Reactor.name} onRender={onRender}>
                <Reactor />
              </Profiler>
            ) : (
              <Reactor />
            )}
          </ReactorErrorBoundary>
        </Suspense>
      </ReactorRootContext.Provider>
    )
  }

  const run = () => {
    reactorRoot.isRunning.set(true)
    HyperFlux.store.activeReactors.set(reactorRoot.uuid, reactorRoot)
    ReactorReconciler.updateContainer(<ReactorContainer />, fiberRoot)
  }

  const stop = () => {
    if (!reactorRoot.isRunning.value) return Promise.resolve()
    ReactorReconciler.updateContainer(null, fiberRoot)
    reactorRoot.isRunning.set(false)
    HyperFlux.store.activeReactors.delete(reactorRoot.uuid)
    reactorRoot.cleanupFunctions.forEach((fn) => fn())
    reactorRoot.cleanupFunctions.clear()
    ReactorRenderCounterState[reactorRoot.uuid].set(none)
  }

  const reflection = () => {
    return {
      hasSuspendedOrTimeoutInTree: hasSuspendedOrTimeoutInTree(fiberRoot.current)
    }
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
    uuid: uuidv4(),
    run,
    stop,
    reflection
  } as ReactorRoot

  const uuid = reactorRoot.uuid
  if (trackStats && !ReactorRenderCounterState.value[uuid]) {
    const trace = { stack: '' }
    Error.captureStackTrace?.(trace, startReactor) // In firefox captureStackTrace is undefined
    const stack = trace.stack.split('\n')
    stack.shift()
    ReactorRenderCounterState[uuid].set({
      count: 0,
      lastRender: 0,
      time: 0,
      fiberCount: 0,
      peakFiberCount: 0,
      stack,
      name: Reactor['__name']
    })
  }

  reactorRoot.run()

  return reactorRoot
}

export const stopAllReactors = (store = HyperFlux.store) => {
  for (const reactor of store.activeReactors.values()) {
    ReactorReconciler.flushSync(() => reactor.stop())
  }
}
