import { subscribable } from '@hookstate/subscribable'
import * as bitECS from 'bitecs'
import React, { startTransition, use, useEffect, useLayoutEffect } from 'react'
import type from 'react/experimental'

import config from '@etherealengine/common/src/config'
import { DeepReadonly } from '@etherealengine/common/src/DeepReadonly'
import multiLogger from '@etherealengine/common/src/logger'
import { HookableFunction } from '@etherealengine/common/src/utils/createHookableFunction'
import { getNestedObject } from '@etherealengine/common/src/utils/getNestedProperty'
import { useForceUpdate } from '@etherealengine/common/src/utils/useForceUpdate'
import { startReactor } from '@etherealengine/hyperflux'
import { hookstate, NO_PROXY, none, State, useHookstate } from '@etherealengine/hyperflux/functions/StateFunctions'

import { TransformComponent } from '../../transform/components/TransformComponent'
import { Engine } from '../classes/Engine'
import { Entity } from '../classes/Entity'
import { EntityReactorProps, EntityReactorRoot } from './EntityFunctions'

const logger = multiLogger.child({ component: 'engine:ecs:ComponentFunctions' })

export const INITIAL_COMPONENT_SIZE = config.client.appEnv === 'test' ? 100000 : 5000 // TODO set to 0 after next bitECS update
bitECS.setDefaultSize(INITIAL_COMPONENT_SIZE)

export const ComponentMap = new Map<string, Component<any, any, any>>()
globalThis.ComponentMap = ComponentMap

type PartialIfObject<T> = T extends object ? Partial<T> : T
type SomeStringLiteral = 'a' | 'b' | 'c' // just a dummy string literal union
type StringLiteral<T> = string extends T ? SomeStringLiteral : string

const createExistenceMap = () => hookstate({} as Record<Entity, boolean>, subscribable())

export interface ComponentPartial<
  Name extends string = string,
  ComponentType = any,
  Schema extends bitECS.ISchema = bitECS.ISchema,
  JSON = unknown,
  SetJSON = unknown,
  ErrorTypes = never
> {
  name: Name
  schema?: Schema
  onInit?: (entity: Entity) => ComponentType
  toJSON?: (entity: Entity<[{ name: Name }]>, component: State<ComponentType>) => JSON
  onSet?: (entity: Entity<[{ name: Name }]>, component: State<ComponentType>, json?: SetJSON) => void
  onRemove?: (entity: Entity<[{ name: Name }]>, component: State<ComponentType>) => void | Promise<void>
  reactor?: React.FC<EntityReactorProps<[{ name: Name }]>>
  errors?: ErrorTypes[]
}
export interface Component<
  Name extends string = string,
  ComponentType = any,
  Schema extends bitECS.ISchema = bitECS.ISchema,
  JSON = unknown,
  SetJSON = unknown,
  ErrorTypes = string
> {
  isComponent: true
  name: Name
  schema?: Schema
  onInit: (entity: Entity) => ComponentType
  toJSON: (entity: Entity, component: State<ComponentType>) => JSON
  onSet: (entity: Entity, component: State<ComponentType>, json?: SetJSON) => void
  onRemove: (entity: Entity, component: State<ComponentType>) => void
  reactor?: HookableFunction<React.FC<EntityReactorProps<[{ name: Name }]>>>
  reactorMap: Map<Entity, EntityReactorRoot<[{ name: Name }]>>
  existenceMap: ReturnType<typeof createExistenceMap>
  stateMap: Record<Entity, State<ComponentType> | undefined>
  valueMap: Record<Entity, ComponentType>
  errors: ErrorTypes[]
  _TYPE: ComponentType
}

export type SoAComponentType<S extends bitECS.ISchema> = bitECS.ComponentType<S>
export type ComponentType<C extends Component> = C['_TYPE']
export type SerializedComponentType<C extends Component> = ReturnType<C['toJSON']>
export type SetComponentType<C extends Component> = Parameters<C['onSet']>[2]
export type ComponentErrorsType<C extends Component> = C['errors'][number]

export const defineComponent = <
  ComponentName extends string,
  ComponentType = true,
  Schema extends bitECS.ISchema = bitECS.ISchema,
  JSON = ComponentType,
  ComponentExtras = unknown,
  SetJSON = PartialIfObject<DeepReadonly<JSON>>,
  Error extends StringLiteral<Error> = ''
>(
  def: ComponentPartial<ComponentName, ComponentType, Schema, JSON, SetJSON, Error> & ComponentExtras
) => {
  const Component = bitECS.defineComponent(def.schema, INITIAL_COMPONENT_SIZE) as SoAComponentType<Schema> &
    Component<ComponentName, ComponentType, Schema, JSON, SetJSON, Error> &
    ComponentExtras
  Component.isComponent = true
  Component.onInit = (entity) => undefined as any
  Component.onSet = (entity, component, json) => {}
  Component.onRemove = () => {}
  Component.toJSON = (entity, component) => null!
  Component.errors = []
  Object.assign(Component, def)
  if (Component.reactor && (!Component.reactor.name || Component.reactor.name === 'reactor'))
    Object.defineProperty(Component.reactor, 'name', { value: `${Component.name}Reactor` })
  Component.reactorMap = new Map()
  // We have to create an stateful existence map in order to reactively track which entities have a given component.
  // Unfortunately, we can't simply use a single shared state because hookstate will (incorrectly) invalidate other nested states when a single component
  // instance is added/removed, so each component instance has to be isolated from the others.
  Component.existenceMap = createExistenceMap()
  Component.stateMap = {}
  Component.valueMap = {}
  ComponentMap.set(Component.name, Component)
  return Component
}

/**
 * @deprecated use `defineComponent`
 */
export const createMappedComponent = <
  ComponentName extends string,
  ComponentType,
  Schema extends bitECS.ISchema = bitECS.ISchema
>(
  name: ComponentName,
  schema?: Schema
) => {
  const Component = defineComponent<ComponentName, ComponentType, Schema, ComponentType, unknown>({
    name,
    schema,
    onSet: (entity, component, json: any) => {
      Component.stateMap[entity]!.set(json ?? true)
    },
    toJSON: (entity, component) => component.value as any
  })
  return Component
}

export const getOptionalComponentState = <C extends Component>(
  entity: Entity,
  component: C
): State<C['_TYPE']> | undefined => {
  // if (entity === UndefinedEntity) return undefined
  if (component.existenceMap[entity].value) return component.stateMap[entity] as State<C['_TYPE']>
  return undefined
}

export const getMutableComponent = <C extends Component>(entity: Entity<[C]>, component: C): State<C['_TYPE']> => {
  const componentState = getOptionalComponentState(entity, component)!
  // TODO: uncomment the following after enabling es-lint no-unnecessary-condition rule
  // if (!componentState?.value) throw new Error(`[getComponent]: entity does not have ${component.name}`)
  return componentState
}

/**
 * @deprecated use `getMutableComponent`
 */
export const getComponentState = getMutableComponent

export const getOptionalComponent = <C extends Component>(entity: Entity, component: C): C['_TYPE'] | undefined => {
  return component.valueMap[entity]
}

export const getComponent = <E extends Entity<[C]>, C extends Component>(entity: E, component: C) => {
  return component.valueMap[entity] as C['_TYPE']
}

/**
 * Set a component on an entity. If the component already exists, it will be overwritten.
 * Unlike calling removeComponent followed by addComponent, entry queue will not be rerun.
 *
 * @param entity
 * @param Component
 * @param args
 *
 * @returns the component state
 */
export const setComponent = <C extends Component>(
  entity: Entity,
  Component: C,
  args: SetComponentType<C> | undefined = undefined
) => {
  if (!entity) {
    throw new Error('[setComponent]: entity is undefined')
  }
  if (!bitECS.entityExists(Engine.instance, entity)) {
    throw new Error('[setComponent]: entity does not exist')
  }
  if (!hasComponent(entity, Component)) {
    // @ts-ignore
    const value = Component.onInit(entity)
    Component.existenceMap[entity].set(true)
    if (!Component.stateMap[entity]) {
      const state = hookstate(value, subscribable())
      Component.stateMap[entity] = state as any
      state.subscribe(() => {
        Component.valueMap[entity] = Component.stateMap[entity]?.get(NO_PROXY) as any
      })
    } else Component.stateMap[entity]!.set(value)
    bitECS.addComponent(Engine.instance, Component, entity, false) // don't clear data on-add
    if (Component.reactor && !Component.reactorMap.has(entity)) {
      const root = startReactor(Component.reactor) as EntityReactorRoot<[C]>
      root.entity = entity as Entity<[C]>
      Component.reactorMap.set(entity, root)
    }
  }
  startTransition(() => {
    Component.onSet(entity, Component.stateMap[entity]!, args as Readonly<SerializedComponentType<C>>)
    Component.valueMap[entity] = Component.stateMap[entity]!.get(NO_PROXY)
    const root = Component.reactorMap.get(entity)
    if (!root?.isRunning) root?.run()
  })
  return Component.stateMap[entity]!
}

/**
 * Experimental API
 */
export const updateComponent = <C extends Component>(
  entity: Entity<[C]>,
  Component: C,
  props: Partial<SerializedComponentType<C>>
) => {
  if (typeof props === 'undefined') return

  const comp = getMutableComponent(entity, Component)
  if (!comp) {
    throw new Error('[updateComponent]: component does not exist')
  }

  startTransition(() => {
    if (typeof props !== 'object') {
      // component has top level value (eg NameComponent)
      comp.set(props)
    } else {
      for (const propertyName of Object.keys(props as any)) {
        const value = props[propertyName]
        const { result, finalProp } = getNestedObject(comp, propertyName)
        if (
          typeof value !== 'undefined' &&
          typeof result[finalProp] === 'object' &&
          typeof result[finalProp].set === 'function'
        ) {
          result[finalProp].set(value)
        } else {
          result[finalProp] = value
        }
      }
    }
    const root = Component.reactorMap.get(entity)
    if (!root?.isRunning) root?.run()
  })
}

/**
 * Like `setComponent`, but throws an error if the component already exists.
 * @param entity
 * @param Component
 * @param args
 * @returns
 */
export const addComponent = <C extends Component>(
  entity: Entity,
  Component: C,
  args: SetComponentType<C> | undefined = undefined
) => {
  if (hasComponent(entity, Component)) throw new Error(`${Component.name} already exists on entity ${entity}`)
  return setComponent(entity, Component, args) as State<C['_TYPE']>
}

export const hasComponent = <KnownComponents extends any[], TestingComponent extends Component>(
  entity: Entity<KnownComponents>,
  component: TestingComponent
): entity is Entity<[...KnownComponents, TestingComponent]> => {
  return component.existenceMap[entity]?.value ?? false
}

export const getOrAddComponent = <C extends Component>(entity: Entity, component: C, args?: SetComponentType<C>) => {
  return hasComponent(entity, component) ? getComponent(entity, component) : addComponent(entity, component, args)
}

export const removeComponent = async <C extends Component>(entity: Entity, component: C) => {
  if (!hasComponent(entity, component)) return
  component.existenceMap[entity].set(false)
  component.onRemove(entity, component.stateMap[entity]!)
  bitECS.removeComponent(Engine.instance, component, entity, false)
  delete component.valueMap[entity]
  const root = component.reactorMap.get(entity)
  component.reactorMap.delete(entity)
  // we need to wait for the reactor to stop before removing the state, otherwise
  // we can trigger errors in useEffect cleanup functions
  if (root?.isRunning) await root?.stop()
  // NOTE: we may need to perform cleanup after a timeout here in case there
  // are other reactors also referencing this state in their cleanup functions
  if (!hasComponent(entity, component)) component.stateMap[entity]?.set(none)
}

export const getAllComponents = (entity: Entity): Component[] => {
  if (!bitECS.entityExists(Engine.instance, entity)) return []
  return bitECS.getEntityComponents(Engine.instance, entity) as Component[]
}

export const getAllComponentData = (entity: Entity): { [name: string]: any } => {
  return Object.fromEntries(getAllComponents(entity).map((C) => [C.name, getComponent(entity, C)]))
}

export const getComponentCountOfType = <C extends Component>(component: C): number => {
  const query = defineQuery([component])
  const length = query().length
  bitECS.removeQuery(Engine.instance, query._query)
  return length
}

export const getAllComponentsOfType = <C extends Component<any>>(component: C): C['_TYPE'][] => {
  const query = defineQuery([component])
  const entities = query()
  bitECS.removeQuery(Engine.instance, query._query)
  return entities.map((e) => {
    return getComponent(e, component)!
  })
}

export const removeAllComponents = (entity: Entity) => {
  try {
    for (const component of bitECS.getEntityComponents(Engine.instance, entity)) {
      removeComponent(entity, component as Component)
    }
  } catch (_) {
    logger.warn('Components of entity already removed')
  }
}

export const serializeComponent = <C extends Component>(entity: Entity<[C]>, Component: C) => {
  const component = getMutableComponent(entity, Component)
  return Component.toJSON(entity, component) as ReturnType<C['toJSON']>
}

export interface Query<C extends readonly any[]> {
  (): Entity<C>[]
  enter(): Entity<C>[]
  exit(): Entity<C>[]
  _query: bitECS.Query
  _enterQuery: bitECS.Query
  _exitQuery: bitECS.Query
}

export function defineQuery<C extends bitECS.Component | bitECS.QueryModifier | Component, A extends readonly C[]>(
  components: A
): Query<A> {
  const query = bitECS.defineQuery([...components, bitECS.Not(EntityRemovedComponent)]) as bitECS.Query
  const enterQuery = bitECS.enterQuery(query)
  const exitQuery = bitECS.exitQuery(query)
  const wrappedQuery = () => query(Engine.instance) as Entity<A>[]
  wrappedQuery.enter = () => enterQuery(Engine.instance) as Entity<A>[]
  wrappedQuery.exit = () => exitQuery(Engine.instance) as Entity<A>[]
  wrappedQuery._query = query
  wrappedQuery._enterQuery = enterQuery
  wrappedQuery._exitQuery = exitQuery
  return wrappedQuery
}

export function removeQuery(query: Query<any>) {
  bitECS.removeQuery(Engine.instance, query._query)
  bitECS.removeQuery(Engine.instance, query._enterQuery)
  bitECS.removeQuery(Engine.instance, query._exitQuery)
}

export type QueryComponents = (Component | bitECS.QueryModifier | bitECS.Component)[]

/**
 * Use a query in a reactive context (a React component)
 */
export function useQuery<C extends (bitECS.Component | bitECS.QueryModifier)[]>(components: C): Entity<C>[] {
  const result = useHookstate([] as Entity<C>[])
  const forceUpdate = useForceUpdate()

  // Use an immediate (layout) effect to ensure that `queryResult`
  // is deleted from the `reactiveQueryStates` map immediately when the current
  // component is unmounted, before any other code attempts to set it
  // (component state can't be modified after a component is unmounted)
  useLayoutEffect(() => {
    const query = defineQuery(components)
    result.set(query())
    const queryState = { query, result, components }
    Engine.instance.reactiveQueryStates.add(queryState as any)
    return () => {
      removeQuery(query)
      Engine.instance.reactiveQueryStates.delete(queryState as any)
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

// use seems to be unavailable in the server environment
function _use(promise) {
  if (promise.status === 'fulfilled') {
    return promise.value
  } else if (promise.status === 'rejected') {
    throw promise.reason
  } else if (promise.status === 'pending') {
    throw promise
  } else {
    promise.status = 'pending'
    promise.then(
      (result) => {
        promise.status = 'fulfilled'
        promise.value = result
      },
      (reason) => {
        promise.status = 'rejected'
        promise.reason = reason
      }
    )
    throw promise
  }
}

/**
 * Use a component in a reactive context (a React component)
 */
export function useComponent<E extends Entity<[C]>, C extends Component>(entity: E, Component: C) {
  const hasComponent = useHookstate(Component.existenceMap[entity]).value
  // use() will suspend the component (by throwing a promise) and resume when the promise is resolved
  if (!hasComponent)
    (use ?? _use)(
      new Promise<void>((resolve) => {
        const unsubscribe = Component.existenceMap[entity].subscribe((value) => {
          if (value) {
            resolve()
            unsubscribe()
          }
        })
      })
    )
  return useHookstate(Component.stateMap[entity]) as State<C['_TYPE']>
}

/**
 * Use a component in a reactive context (a React component)
 */
export function useOptionalComponent<C extends Component>(entity: Entity, Component: C) {
  const hasComponent = useHookstate(Component.existenceMap[entity]).value
  if (!Component.stateMap[entity]) Component.stateMap[entity] = hookstate(undefined) as any
  const component = useHookstate(Component.stateMap[entity]) as State<C['_TYPE']>
  return hasComponent ? component : undefined
}

export const EntityRemovedComponent = defineComponent({ name: 'EntityRemovedComponent' })

globalThis.EE_getComponent = getComponent
globalThis.EE_getAllComponents = getAllComponents
globalThis.EE_getAllComponentData = getAllComponentData
globalThis.EE_addComponent = addComponent
globalThis.EE_setComponent = setComponent
globalThis.EE_removeComponent = removeComponent

/** Template **

export const MyComponent = defineComponent({
  name: 'MyComponent',

  schema: {
    id: Types.ui32
  },

  onInit: (entity) => {
    return {
      myProp: 'My Value'
    }
  },

  toJSON: (entity, component) => {
    return {
      myProp: component.myProp.value
    }
  },

  onSet: (entity, component, json) => {
    if (typeof json?.myProp === 'string') component.myProp.set(json.myProp)
  },

  onRemove: (entity, component) => {},

  reactor: undefined,

  errors: []
})

** */
