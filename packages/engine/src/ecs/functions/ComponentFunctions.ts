/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Subscribable, subscribable } from '@hookstate/subscribable'
import * as bitECS from 'bitecs'
// tslint:disable:ordered-imports
import type from 'react/experimental'
import React, { startTransition, use, useEffect, useLayoutEffect } from 'react'

import config from '@etherealengine/common/src/config'
import { DeepReadonly } from '@etherealengine/common/src/DeepReadonly'
import multiLogger from '@etherealengine/common/src/logger'
import { HookableFunction } from '@etherealengine/common/src/utils/createHookableFunction'
import { getNestedObject } from '@etherealengine/common/src/utils/getNestedProperty'
import { useForceUpdate } from '@etherealengine/common/src/utils/useForceUpdate'
import { ReactorRoot, startReactor } from '@etherealengine/hyperflux'
import { hookstate, NO_PROXY, State, useHookstate } from '@etherealengine/hyperflux/functions/StateFunctions'

import { Engine } from '../classes/Engine'
import { Entity } from '../classes/Entity'
import { EntityContext } from './EntityFunctions'

const logger = multiLogger.child({ component: 'engine:ecs:ComponentFunctions' })

export const INITIAL_COMPONENT_SIZE = config.client.appEnv === 'test' ? 100000 : 5000 // TODO set to 0 after next bitECS update
bitECS.setDefaultSize(INITIAL_COMPONENT_SIZE)

export const ComponentMap = new Map<string, Component<any, any, any>>()
export const ComponentJSONIDMap = new Map<string, Component<any, any, any>>() // <jsonID, Component>
globalThis.ComponentMap = ComponentMap
globalThis.ComponentJSONIDMap = ComponentJSONIDMap

type PartialIfObject<T> = T extends object ? Partial<T> : T

type OnInitValidateNotState<T> = T extends State<any, {}> ? 'onAdd must not return a State object' : T

type SomeStringLiteral = 'a' | 'b' | 'c' // just a dummy string literal union
type StringLiteral<T> = string extends T ? SomeStringLiteral : string

export interface ComponentPartial<
  ComponentType = any,
  Schema extends bitECS.ISchema = {},
  JSON = ComponentType,
  SetJSON = PartialIfObject<DeepReadonly<JSON>>,
  ErrorTypes = never
> {
  name: string
  jsonID?: string
  schema?: Schema
  onInit?: (this: SoAComponentType<Schema>, entity: Entity) => ComponentType & OnInitValidateNotState<ComponentType>
  toJSON?: (entity: Entity, component: State<ComponentType>) => JSON
  onSet?: (entity: Entity, component: State<ComponentType>, json?: SetJSON) => void
  onRemove?: (entity: Entity, component: State<ComponentType>) => void | Promise<void>
  reactor?: React.FC
  errors?: ErrorTypes[]
}
export interface Component<
  ComponentType = any,
  Schema extends bitECS.ISchema = {},
  JSON = ComponentType,
  SetJSON = PartialIfObject<DeepReadonly<JSON>>,
  ErrorTypes = string
> {
  isComponent: true
  name: string
  jsonID?: string
  schema?: Schema
  onInit: (this: SoAComponentType<Schema>, entity: Entity) => ComponentType & OnInitValidateNotState<ComponentType>
  toJSON: (entity: Entity, component: State<ComponentType>) => JSON
  onSet: (entity: Entity, component: State<ComponentType>, json?: SetJSON) => void
  onRemove: (entity: Entity, component: State<ComponentType>) => void
  reactor?: HookableFunction<React.FC>
  reactorMap: Map<Entity, ReactorRoot>
  existenceMap: Readonly<Record<Entity, boolean>>
  existenceMapState: State<Record<Entity, boolean>, Subscribable>
  existenceMapPromiseResolver: Record<Entity, { promise: Promise<void>; resolve: () => void }>
  stateMap: Record<Entity, State<ComponentType, Subscribable> | undefined>
  valueMap: Record<Entity, ComponentType>
  errors: ErrorTypes[]
}

export type SoAComponentType<S extends bitECS.ISchema> = bitECS.ComponentType<S>
export type ComponentType<C extends Component> = NonNullable<C['valueMap'][keyof C['valueMap']]>
export type SerializedComponentType<C extends Component> = ReturnType<C['toJSON']>
export type SetComponentType<C extends Component> = Parameters<C['onSet']>[2]
export type ComponentErrorsType<C extends Component> = C['errors'][number]

export const defineComponent = <
  ComponentType = true,
  Schema extends bitECS.ISchema = {},
  JSON = ComponentType,
  ComponentExtras = unknown,
  SetJSON = PartialIfObject<DeepReadonly<JSON>>,
  Error extends StringLiteral<Error> = ''
>(
  def: ComponentPartial<ComponentType, Schema, JSON, SetJSON, Error> & ComponentExtras
) => {
  const Component = bitECS.defineComponent(def.schema, INITIAL_COMPONENT_SIZE) as ComponentExtras &
    SoAComponentType<Schema> &
    Component<ComponentType, Schema, JSON, SetJSON, Error>
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
  Component.existenceMap = {}
  Component.existenceMapState = hookstate(Component.existenceMap, subscribable())
  Component.existenceMapPromiseResolver = {}
  Component.stateMap = {}
  Component.valueMap = {}
  if (Component.jsonID) ComponentJSONIDMap.set(Component.jsonID, Component)
  ComponentMap.set(Component.name, Component)

  return Component as typeof Component & { _TYPE: ComponentType }
}

/**
 * @deprecated use `defineComponent`
 */
export const createMappedComponent = <ComponentType = {}, Schema extends bitECS.ISchema = {}>(
  name: string,
  schema?: Schema
) => {
  const Component = defineComponent<ComponentType, Schema, ComponentType, unknown>({
    name,
    schema,
    onSet: (entity, component, json: any) => {
      Component.stateMap[entity]!.set(json ?? true)
    },
    toJSON: (entity, component) => component.value as any
  })
  return Component
}

export const getOptionalMutableComponent = <ComponentType>(
  entity: Entity,
  component: Component<ComponentType, {}, unknown>
): State<ComponentType, Subscribable> | undefined => {
  // if (entity === UndefinedEntity) return undefined
  if (component.existenceMap[entity]) return component.stateMap[entity]
  return undefined
}

/**
 * @deprecated use `getOptionalMutableComponent`
 */
export const getOptionalComponentState = getOptionalMutableComponent

export const getMutableComponent = <ComponentType>(
  entity: Entity,
  component: Component<ComponentType, {}, unknown>
): State<ComponentType, Subscribable> => {
  const componentState = getOptionalMutableComponent(entity, component)!
  // TODO: uncomment the following after enabling es-lint no-unnecessary-condition rule
  // if (!componentState?.value) throw new Error(`[getComponent]: entity does not have ${component.name}`)
  return componentState
}

/**
 * @deprecated use `getMutableComponent`
 */
export const getComponentState = getMutableComponent

export const getOptionalComponent = <ComponentType>(
  entity: Entity,
  component: Component<ComponentType, {}, unknown>
): ComponentType | undefined => {
  return component.valueMap[entity] as ComponentType | undefined
}

export const getComponent = <ComponentType>(
  entity: Entity,
  component: Component<ComponentType, {}, unknown>
): ComponentType => {
  return component.valueMap[entity] as ComponentType
}

/**
 * Set a component on an entity. If the component already exists, it will be overwritten.
 * Unlike calling ``removeComponent`` followed by addComponent, entry queue will not be rerun.
 *
 * @param entity
 * @param Component
 * @param args
 *
 * @returns the component
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
  let value = args
  if (!hasComponent(entity, Component)) {
    value = Component.onInit(entity) ?? args
    Component.existenceMapState[entity].set(true)
    Component.existenceMapPromiseResolver[entity]?.resolve?.()

    if (!Component.stateMap[entity]) {
      Component.stateMap[entity] = hookstate(value, subscribable())
    } else Component.stateMap[entity]!.set(value)

    bitECS.addComponent(Engine.instance, Component, entity, false) // don't clear data on-add

    const state = Component.stateMap[entity]!

    if (Component.reactor && !Component.reactorMap.has(entity)) {
      const root = startReactor(() => {
        useEffect(() => {
          if (typeof state.value === 'object') return
          return state.subscribe(() => {
            Component.valueMap[entity] = Component.stateMap[entity]?.get(NO_PROXY)
          })
        }, [])

        return React.createElement(
          EntityContext.Provider,
          { value: entity },
          React.createElement(Component.reactor || (() => null), {})
        )
      }) as ReactorRoot
      root['entity'] = entity
      Component.reactorMap.set(entity, root)
    }
  }
  startTransition(() => {
    Component.onSet(entity, Component.stateMap[entity]!, args as Readonly<SerializedComponentType<C>>)
    Component.valueMap[entity] = Component.stateMap[entity]!.get(NO_PROXY)
    const root = Component.reactorMap.get(entity)
    if (!root?.isRunning) root?.run()
  })
}

/**
 * Experimental API
 */
export const updateComponent = <C extends Component>(
  entity: Entity,
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
 * @deprecated - use setComponent instead
 */
export const addComponent = <C extends Component>(
  entity: Entity,
  Component: C,
  args: SetComponentType<C> | undefined = undefined
) => {
  if (hasComponent(entity, Component)) throw new Error(`${Component.name} already exists on entity ${entity}`)
  setComponent(entity, Component, args)
}

export const hasComponent = <C extends Component>(entity: Entity, component: C) => {
  return component.existenceMap[entity] ?? false
}

export const getOrAddComponent = <C extends Component>(entity: Entity, component: C, args?: SetComponentType<C>) => {
  return hasComponent(entity, component) ? getComponent(entity, component) : addComponent(entity, component, args)
}

export const removeComponent = async <C extends Component>(entity: Entity, component: C) => {
  if (!hasComponent(entity, component)) return
  component.existenceMapState[entity].set(false)
  component.existenceMapPromiseResolver[entity]?.resolve?.()
  component.existenceMapPromiseResolver[entity] = _createPromiseResolver()
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
  if (!hasComponent(entity, component)) component.stateMap[entity]?.set(undefined)
}

export const getAllComponents = (entity: Entity): Component[] => {
  if (!bitECS.entityExists(Engine.instance, entity)) return []
  return bitECS.getEntityComponents(Engine.instance, entity) as Component[]
}

export const getAllComponentData = (entity: Entity): { [name: string]: ComponentType<any> } => {
  return Object.fromEntries(getAllComponents(entity).map((C) => [C.name, getComponent(entity, C)]))
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

export const removeAllComponents = (entity: Entity) => {
  const promises = [] as Promise<void>[]
  try {
    for (const component of bitECS.getEntityComponents(Engine.instance, entity)) {
      promises.push(removeComponent(entity, component as Component))
    }
  } catch (_) {
    logger.warn('Components of entity already removed')
  }
  return promises
}

export const serializeComponent = <C extends Component<any, any, any>>(entity: Entity, Component: C) => {
  const component = getMutableComponent(entity, Component)
  return Component.toJSON(entity, component) as ReturnType<C['toJSON']>
}

export function defineQuery(components: (bitECS.Component | bitECS.QueryModifier)[]) {
  const query = bitECS.defineQuery([...components, bitECS.Not(EntityRemovedComponent)]) as bitECS.Query
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

function _createPromiseResolver() {
  let resolve!: () => void
  const promise = new Promise<void>((r) => (resolve = r))
  return { promise, resolve }
}

/**
 * Use a component in a reactive context (a React component)
 */
export function useComponent<C extends Component<any>>(entity: Entity, Component: C) {
  let promiseResolver = Component.existenceMapPromiseResolver[entity]
  if (!promiseResolver) {
    promiseResolver = Component.existenceMapPromiseResolver[entity] = _createPromiseResolver()
    if (hasComponent(entity, Component)) promiseResolver.resolve()
  }

  // use() will suspend the component (by throwing a promise) and resume when the promise is resolved
  ;(use ?? _use)(promiseResolver.promise)

  return useHookstate(Component.stateMap[entity]) as any as State<ComponentType<C>> // todo fix any cast
}

/**
 * Use a component in a reactive context (a React component)
 */
export function useOptionalComponent<C extends Component<any>>(entity: Entity, Component: C) {
  const hasComponent = useHookstate(Component.existenceMapState[entity]).value
  if (!Component.stateMap[entity]) Component.stateMap[entity] = hookstate(undefined)
  const component = useHookstate(Component.stateMap[entity]) as any as State<ComponentType<C>> // todo fix any cast
  return hasComponent ? component : undefined
}

export type Query = ReturnType<typeof defineQuery>

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
