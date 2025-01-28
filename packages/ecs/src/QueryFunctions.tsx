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
import React, { ErrorInfo, FC, memo, Suspense, useLayoutEffect, useMemo } from 'react'
import * as bitECSLegacy from './bitecsLegacy'

import { HyperFlux, NO_PROXY, useHookstate } from '@ir-engine/hyperflux'

import { LayerComponents, LayerID, Layers } from './ComponentFunctions'
import { Entity } from './Entity'
import { EntityContext } from './EntityFunctions'

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

/**
 * Use a query in a reactive context (a React component)
 * - "components" argument must not change
 */
export function useQuery(components: bitECS.QueryTerm[], layer: LayerID = Layers.Simulation) {
  const state = useHookstate(() => {
    const componentsWithLayer = [...components, LayerComponents[layer]]
    return {
      entities: [...query(componentsWithLayer)] as Entity[],
      invalid: false
    }
  })

  useLayoutEffect(() => {
    const requery = () => state.invalid.set(true)

    const componentsWithLayer = [...components, LayerComponents[layer]]

    const unsubAdd = bitECS.observe(HyperFlux.store, bitECS.onAdd(...componentsWithLayer), requery)
    const unsubRemove = bitECS.observe(HyperFlux.store, bitECS.onRemove(...componentsWithLayer), requery)

    const unsubscribe = () => {
      unsubAdd()
      unsubRemove()
    }

    return () => {
      unsubscribe()
    }
  }, [])

  const stateNoProxy = state.get(NO_PROXY) as { invalid: boolean; entities: Entity[] }
  if (state.invalid.value) {
    // unsafely update the state properties, since they are never hooked as proxies
    stateNoProxy.invalid = false
    stateNoProxy.entities = [...query([...components, LayerComponents[layer]])] as Entity[]
  }

  // return the underlying entity object - it should be assumed to be readonly, though that makes types annoying
  return stateNoProxy.entities as Entity[]
}

export type Query = ReturnType<typeof defineQuery>

const QuerySubReactor = memo((props: { entity: Entity; ChildEntityReactor: FC; props?: any }) => {
  return (
    <>
      <QueryReactorErrorBoundary>
        <Suspense fallback={null}>
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
