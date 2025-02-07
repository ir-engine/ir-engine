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

import * as bitECS from 'bitecs'
import React, { ErrorInfo, FC, memo, Suspense, useEffect, useLayoutEffect, useMemo } from 'react'
import * as bitECSLegacy from './bitecsLegacy'

import {
  defineState,
  getMutableState,
  HyperFlux,
  NO_PROXY,
  startReactor,
  State,
  useForceUpdate,
  useHookstate
} from '@ir-engine/hyperflux'

import { EntityContext, LayerComponents, LayerID, Layers } from './ComponentFunctions'
import { Entity } from './Entity'

export type { QueryTerm } from 'bitecs'

export const queries = [] as ReturnType<typeof defineQuery>[]

export function defineQuery(components: bitECS.QueryTerm[], layer: LayerID = Layers.Simulation) {
  const query = bitECSLegacy.defineQuery([...components, LayerComponents[layer]])
  const enterQuery = bitECSLegacy.enterQuery(query)
  const exitQuery = bitECSLegacy.exitQuery(query)

  const wrappedQuery = () => {
    return query(HyperFlux.store) as Entity[]
  }
  wrappedQuery.enter = () => {
    return enterQuery(HyperFlux.store) as Entity[]
  }
  wrappedQuery.exit = () => {
    return exitQuery(HyperFlux.store) as Entity[]
  }

  wrappedQuery._query = query
  wrappedQuery._enterQuery = enterQuery
  wrappedQuery._exitQuery = exitQuery

  queries.push(wrappedQuery)

  return wrappedQuery
}

export function removeQuery(queryOrTerms: ReturnType<typeof defineQuery> | bitECS.QueryTerm[]) {
  try {
    bitECS.removeQuery(HyperFlux.store, Array.isArray(queryOrTerms) ? queryOrTerms : queryOrTerms._query.components)
    if ('_enterQuery' in queryOrTerms) queryOrTerms._enterQuery.unsubscribe()
    if ('_exitQuery' in queryOrTerms) queryOrTerms._exitQuery.unsubscribe()
  } catch (e) {
    console.log('Caught error', e, 'likely due to cleaning up a query that doesnt exist')
  }
}

export const query = (queryTerms: bitECS.QueryTerm[]) => bitECS.query(HyperFlux.store, queryTerms)

const UseQuerySubreactorEntityCache = {} as Record<string, Set<State<Entity[]>>>
const UseQuerySubreactorCache = {} as Record<string, ReturnType<typeof startReactor>>

const sortAndJoinComponents = (components: bitECS.QueryTerm[]) =>
  components
    .map((c) => c.name)
    .sort()
    .join()

export function useQuery(components: bitECS.QueryTerm[], layer: LayerID = Layers.Simulation) {
  const entitiesState = useHookstate(() => {
    return [...query([...components, LayerComponents[layer]])] as Entity[]
  })

  useEffect(() => {
    const componentsWithLayer = [...components, LayerComponents[layer]]

    const key = sortAndJoinComponents(componentsWithLayer)

    const exists = !!UseQuerySubreactorEntityCache[key]
    if (!UseQuerySubreactorEntityCache[key]) UseQuerySubreactorEntityCache[key] = new Set()

    const cache = UseQuerySubreactorEntityCache[key]
    cache.add(entitiesState)
    if (!exists) {
      const subreactor = startReactor(() => {
        const update = useForceUpdate()

        const entities = query(componentsWithLayer) as Entity[]
        useEffect(() => {
          for (const state of cache) {
            state.set([...entities])
          }
        }, [JSON.stringify(entities)])

        useLayoutEffect(() => {
          const componentsWithLayer = [...components, LayerComponents[layer]]

          const unsubAdd = bitECS.observe(HyperFlux.store, bitECS.onAdd(...componentsWithLayer), update)
          const unsubRemove = bitECS.observe(HyperFlux.store, bitECS.onRemove(...componentsWithLayer), update)

          const unsubscribe = () => {
            unsubAdd()
            unsubRemove()
          }

          return () => {
            unsubscribe()
            removeQuery(componentsWithLayer)
          }
        }, [])

        return null
      })

      UseQuerySubreactorCache[key] = subreactor
    }

    return () => {
      cache.delete(entitiesState)
      if (cache.size === 0) {
        const subreactor = UseQuerySubreactorCache[key]
        subreactor.stop()
        delete UseQuerySubreactorEntityCache[key]
      }
    }
  }, [])

  const entities = entitiesState.get(NO_PROXY) as Entity[]

  return useMemo(() => [...entities], [JSON.stringify(entities)])
}

export type Query = ReturnType<typeof defineQuery>

export const SuspendedQueryChildState = defineState({
  name: 'ir.ecs.SuspendedQueryChildState',
  initial: [] as Array<{ entity: Entity; ChildEntityReactor: FC; props?: any }>
})

const Suspended = (props: { entity: Entity; ChildEntityReactor: FC; props?: any }) => {
  useEffect(() => {
    const state = getMutableState(SuspendedQueryChildState)
    state.merge([props])
    return () => {
      state.set((v) => v.filter((v) => v !== props))
    }
  }, [])
  return null
}

export const QuerySubReactor = memo((props: { entity: Entity; ChildEntityReactor: FC; props?: any }) => {
  return (
    <>
      <QueryReactorErrorBoundary>
        <Suspense fallback={<Suspended {...props} />}>
          <EntityContext.Provider value={props.entity}>
            <props.ChildEntityReactor {...props.props} />
          </EntityContext.Provider>
        </Suspense>
      </QueryReactorErrorBoundary>
    </>
  )
})

export const QueryReactor = memo((props: { Components: bitECS.QueryTerm[]; ChildEntityReactor: FC; props?: any }) => {
  const entities = useQuery(props.Components)
  const MemoChildEntityReactor = useMemo(() => memo(props.ChildEntityReactor), [props.ChildEntityReactor])
  return (
    <>
      {entities.map((entity) => (
        <QuerySubReactor key={entity} entity={entity} ChildEntityReactor={MemoChildEntityReactor} props={props.props} />
      ))}
    </>
  )
})

interface ErrorState {
  error: Error | null
}

class QueryReactorErrorBoundary extends React.Component<any, ErrorState> {
  public state: ErrorState = {
    error: null
  }

  public static getDerivedStateFromError(error: Error): ErrorState {
    // Update state so the next render will show the fallback UI.
    return { error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    return this.state.error ? null : this.props.children
  }
}
