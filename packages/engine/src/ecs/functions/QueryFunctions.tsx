import { useForceUpdate } from '@etherealengine/common/src/utils/useForceUpdate'
import { startReactor, useHookstate } from '@etherealengine/hyperflux'
import * as bitECS from 'bitecs'
import React, { ErrorInfo, FC, Suspense, memo, useEffect, useLayoutEffect, useMemo } from 'react'
import { Engine } from '../classes/Engine'
import { Entity } from '../classes/Entity'
import { Component, ComponentType, getComponent, useOptionalComponent } from './ComponentFunctions'
import { EntityContext } from './EntityFunctions'

export function defineQuery(components: (bitECS.Component | bitECS.QueryModifier)[]) {
  const query = bitECS.defineQuery(components) as bitECS.Query
  const enterQuery = bitECS.enterQuery(query)
  const exitQuery = bitECS.exitQuery(query)

  const _remove = () => bitECS.removeQuery(Engine.instance, wrappedQuery._query)
  const _removeEnter = () => bitECS.removeQuery(Engine.instance, wrappedQuery._enterQuery)
  const _removeExit = () => bitECS.removeQuery(Engine.instance, wrappedQuery._exitQuery)

  const wrappedQuery = () => {
    Engine.instance.activeSystemReactors.get(Engine.instance.currentSystemUUID)?.cleanupFunctions.add(_remove)
    return query(Engine.instance) as Entity[]
  }
  wrappedQuery.enter = () => {
    Engine.instance.activeSystemReactors.get(Engine.instance.currentSystemUUID)?.cleanupFunctions.add(_removeEnter)
    return enterQuery(Engine.instance) as Entity[]
  }
  wrappedQuery.exit = () => {
    Engine.instance.activeSystemReactors.get(Engine.instance.currentSystemUUID)?.cleanupFunctions.add(_removeExit)
    return exitQuery(Engine.instance) as Entity[]
  }

  wrappedQuery._query = query
  wrappedQuery._enterQuery = enterQuery
  wrappedQuery._exitQuery = exitQuery
  return wrappedQuery
}

export function removeQuery(query: ReturnType<typeof defineQuery>) {
  bitECS.removeQuery(Engine.instance, query._query)
  bitECS.removeQuery(Engine.instance, query._enterQuery)
  bitECS.removeQuery(Engine.instance, query._exitQuery)
}

export type QueryComponents = (Component<any> | bitECS.QueryModifier | bitECS.Component)[]

/**
 * Use a query in a reactive context (a React component)
 */
export function useQuery(components: QueryComponents) {
  const result = useHookstate([] as Entity[])
  const forceUpdate = useForceUpdate()

  // Use an immediate (layout) effect to ensure that `queryResult`
  // is deleted from the `reactiveQueryStates` map immediately when the current
  // component is unmounted, before any other code attempts to set it
  // (component state can't be modified after a component is unmounted)
  useLayoutEffect(() => {
    const query = defineQuery(components)
    result.set(query())
    const queryState = { query, result, components }
    Engine.instance.reactiveQueryStates.add(queryState)
    return () => {
      removeQuery(query)
      Engine.instance.reactiveQueryStates.delete(queryState)
    }
  }, [])

  // create an effect that forces an update when any components in the query change
  useEffect(() => {
    const entities = [...result.value]
    const root = startReactor(function useQueryReactor() {
      for (const entity of entities) {
        components.forEach((C) => ('isComponent' in C ? useOptionalComponent(entity, C as any)?.value : undefined))
      }
      forceUpdate()
      return null
    })
    return () => {
      root.stop()
    }
  }, [result])

  return result.value
}

export type Query = ReturnType<typeof defineQuery>

const QuerySubReactor = memo((props: { entity: Entity; ChildEntityReactor: FC }) => {
  return (
    <>
      <QueryReactorErrorBoundary>
        <Suspense fallback={null}>
          <EntityContext.Provider value={props.entity}>
            <props.ChildEntityReactor />
          </EntityContext.Provider>
        </Suspense>
      </QueryReactorErrorBoundary>
    </>
  )
})

export const QueryReactor = memo((props: { Components: QueryComponents; ChildEntityReactor: FC }) => {
  const entities = useQuery(props.Components)
  const MemoChildEntityReactor = useMemo(() => memo(props.ChildEntityReactor), [props.ChildEntityReactor])
  return (
    <>
      {entities.map((entity) => (
        <QuerySubReactor key={entity} entity={entity} ChildEntityReactor={MemoChildEntityReactor} />
      ))}
    </>
  )
})

/**
 * @deprecated use QueryReactor directly
 */
export const createQueryReactor = (Components: QueryComponents, ChildEntityReactor: FC) => {
  return () => <QueryReactor Components={Components} ChildEntityReactor={ChildEntityReactor} />
}

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

export const getComponentCountOfType = <C extends Component>(component: C): number => {
  const query = defineQuery([component])
  const length = query().length
  bitECS.removeQuery(Engine.instance, query._query)
  return length
}

export const getAllComponentsOfType = <C extends Component<any>>(component: C): ComponentType<C>[] => {
  const query = defineQuery([component])
  const entities = query()
  bitECS.removeQuery(Engine.instance, query._query)
  return entities.map((e) => {
    return getComponent(e, component)!
  })
}
