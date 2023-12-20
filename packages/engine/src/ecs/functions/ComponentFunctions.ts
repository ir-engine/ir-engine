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

/**
 * @fileoverview
 * @todo Write the `fileoverview` for `ComponentFunctions.ts`
 */

import { Subscribable, subscribable } from '@hookstate/subscribable'
import * as bitECS from 'bitecs'
// tslint:disable:ordered-imports
import type from 'react/experimental'
import React, { startTransition, use, useEffect, useLayoutEffect } from 'react'

import config from '@etherealengine/common/src/config'
import { DeepReadonly } from '@etherealengine/common/src/DeepReadonly'
import multiLogger from '@etherealengine/engine/src/common/functions/logger'
import { HookableFunction } from '@etherealengine/common/src/utils/createHookableFunction'
import { getNestedObject } from '@etherealengine/common/src/utils/getNestedProperty'
import { useForceUpdate } from '@etherealengine/common/src/utils/useForceUpdate'
import { ReactorRoot, startReactor } from '@etherealengine/hyperflux'
import {
  hookstate,
  NO_PROXY,
  NO_PROXY_STEALTH,
  none,
  State,
  StateMethodsDestroy,
  useHookstate
} from '@etherealengine/hyperflux/functions/StateFunctions'

import { Engine } from '../classes/Engine'
import { Entity, UndefinedEntity } from '../classes/Entity'
import { EntityContext } from './EntityFunctions'
import { ComponentTypeToTypedArray } from '@gltf-transform/core'

/**
 * @description `@internal`
 * Shorthand for the logger that will be used throughout this file.
 * Contains a multiLogger.child, that uses a component ID referencing the purpose of this file.
 */
const logger = multiLogger.child({ component: 'engine:ecs:ComponentFunctions' })

/**
 * @description
 * Initial Max amount of entries that buffers for a Component type will contain.
 * - `100_000` for 'test' client environment
 * - `5_000` otherwise
 */
export const INITIAL_COMPONENT_SIZE =
  config.client.appEnv === 'test' ? 100000 : 5000 /** @todo set to 0 after next bitECS update */
bitECS.setDefaultSize(INITIAL_COMPONENT_SIZE) // Send the INITIAL_COMPONENT_SIZE value to bitECS as its DefaultSize

export const ComponentMap = new Map<string, Component<any, any, any>>()
export const ComponentJSONIDMap = new Map<string, Component<any, any, any>>() // <jsonID, Component>
globalThis.ComponentMap = ComponentMap
globalThis.ComponentJSONIDMap = ComponentJSONIDMap

//::::: Helper and Validation generic types ::::://
/** @private Type that will become a [Typescript.Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype) if T is extending an object, but will be just T otherwise. */
type PartialIfObject<T> = T extends object ? Partial<T> : T
/** @private Type used to validate that the type returned by {@link Component.onInit} is not a {@link State} object. */
type OnInitValidateNotState<T> = T extends State<any, object | unknown> ? 'onInit must not return a State object' : T
/** @private Just a dummy string literal union */
type SomeStringLiteral = 'a' | 'b' | 'c'
/** @private Type that will be a `string` when T is an extension of `string`, but will be a dummy string union otherwise. */
type StringLiteral<T> = string extends T ? SomeStringLiteral : string

/**
 * @description
 * Data used to create a Component with {@link defineComponent}.
 * @why
 * This type exists so that some of the properties of {@link Component}s are optional when defining them, but required during normal use.
 * See [Typescript.Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype) for a reference of what Partials are.
 */
export interface ComponentPartial<
  ComponentType = any,
  Schema extends bitECS.ISchema = Record<string, any>,
  JSON = ComponentType,
  SetJSON = PartialIfObject<DeepReadonly<JSON>>,
  ErrorTypes = never
> {
  /** @description Human readable label for the component. Displayed in the editor and debugging tools. */
  name: string
  /** @description Internal ID used to reference this component in JSON data. */
  jsonID?: string
  /** @description A Component's Schema is the shape of its runtime data. */
  schema?: Schema
  /**
   * @description Called once when the component is added to an entity (ie: initialized).
   * @param this `@internal` The component partial itself.
   * @param entity The {@link Entity} to which this Component is being assigned.
   * @returns The schema (aka shape) of the component's runtime data.
   */
  onInit?: (this: SoAComponentType<Schema>, entity: Entity) => ComponentType & OnInitValidateNotState<ComponentType>
  /**
   * @description
   * Serializer function called when the component is saved to a snapshot or scene file.
   * Its logic must convert the component's runtime data into a JSON object.
   * @param entity The {@link Entity} to which this Component is assigned.
   * @param component The Component's global data (aka {@link State}).
   */
  toJSON?: (entity: Entity, component: State<ComponentType>) => JSON
  /**
   * @description
   * Called when the component's data is updated via the {@link setComponent} function.
   * This is where deserialization logic should happen.
   * @param entity The {@link Entity} to which this Component is assigned.
   * @param component The Component's global data (aka {@link State}).
   * @param json The JSON object that contains this component's serialized data.
   */
  onSet?: (entity: Entity, component: State<ComponentType>, json?: SetJSON) => void
  /** @todo Explain ComponentPartial.onRemove(...) */
  onRemove?: (entity: Entity, component: State<ComponentType>) => void | Promise<void>
  /**
   * @summary Defines the {@link React.FC} async logic of the {@link Component} type.
   * @notes Any side-effects that depend on the component's data should be defined here.
   * @description
   * {@link React}'s `Function Component` of the resulting ECS {@link Component} type.
   * `@todo` Explain what reactive is in this context
   * `@todo` Explain this function
   */
  reactor?: React.FC
  /**
   * @todo Explain ComponentPartial.errors[]
   */
  errors?: ErrorTypes[]
}

/**
 * @description
 * Defines the shape that all Engine's ECS Components will have.
 *
 * See {@link ComponentType} for the `type` version of this interface.
 * See {@link ComponentPartial} to find the data required to define a new Component with {@link defineComponent}.
 */
export interface Component<
  ComponentType = any,
  Schema extends bitECS.ISchema = Record<string, any>,
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
  existenceMapState: Record<Entity, State<boolean> | undefined>
  existenceMapPromiseResolver: Record<Entity, { promise: Promise<void>; resolve: () => void }>
  stateMap: Record<Entity, State<ComponentType, Subscribable> | undefined>
  valueMap: Record<Entity, ComponentType>
  errors: ErrorTypes[]
}

/** @todo Describe this type */
export type SoAComponentType<S extends bitECS.ISchema> = bitECS.ComponentType<S>
/** @description Generic `type` for all Engine's ECS {@link Component}s. All of its fields are required to not be `null`. */
export type ComponentType<C extends Component> = NonNullable<C['valueMap'][keyof C['valueMap']]>
/** @description Generic `type` for {@link Component}s, that takes the shape of the type returned by the its serialization function {@link Component.toJSON}. */
export type SerializedComponentType<C extends Component> = ReturnType<C['toJSON']>
/** @description Generic `type` for {@link Component}s, that takes the shape of the type returned by its {@link Component.onSet} function. */
export type SetComponentType<C extends Component> = Parameters<C['onSet']>[2]
/** @description Generic `type` for {@link Component}s, that takes the shape of the type used by its {@link Component.errors} field. */
export type ComponentErrorsType<C extends Component> =
  C['errors'][number] /** @todo What is C[...][number] doing here? */

/**
 * @description
 * Defines a new Component type.
 * Takes a {@link ComponentPartial}, fills in all of the missing information, and returns a complete {@link Component} type containing all of the required fields.
 * @param def Parameters required to initialize a Component, as seen at {@link ComponentPartial}
 * @returns A new fully setup Component type, with all data and callbacks required for it to be used by the engine.
 * @example
 * ```ts
 * export const MyComponent = defineComponent({
 *   name: 'MyComponent',
 *   schema: {
 *     id: Types.ui32
 *   },
 *   onInit: (entity) => {
 *     return {
 *       myProp: 'My Value'
 *     }
 *   },
 *   toJSON: (entity, component) => {
 *     return {
 *       myProp: component.myProp.value
 *     }
 *   },
 *   onSet: (entity, component, json) => {
 *     if (typeof json?.myProp === 'string') component.myProp.set(json.myProp)
 *   },
 *   onRemove: (entity, component) => {},
 *   reactor: undefined,
 *   errors: []
 * })
 * ```
 */
export const defineComponent = <
  ComponentType = true,
  Schema extends bitECS.ISchema = Record<string, any>,
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
  Component.onInit = (entity) => true as any
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
  Component.existenceMapState = {}
  Component.existenceMapPromiseResolver = {}
  Component.stateMap = {}
  Component.valueMap = {}
  if (Component.jsonID) {
    ComponentJSONIDMap.set(Component.jsonID, Component)
    console.log(`Registered component ${Component.name} with jsonID ${Component.jsonID}`)
  }
  ComponentMap.set(Component.name, Component)

  return Component as typeof Component & { _TYPE: ComponentType }
}

export const getOptionalMutableComponent = <ComponentType>(
  entity: Entity,
  component: Component<ComponentType, Record<string, any>, unknown>
): State<ComponentType, Subscribable> | undefined => {
  // if (entity === UndefinedEntity) return undefined
  if (component.existenceMapState[entity]?.get(NO_PROXY_STEALTH)) return component.stateMap[entity]
  return undefined
}

export const getMutableComponent = <ComponentType>(
  entity: Entity,
  component: Component<ComponentType, Record<string, any>, unknown>
): State<ComponentType, Subscribable> => {
  const componentState = getOptionalMutableComponent(entity, component)!
  /** @todo: uncomment the following after enabling es-lint no-unnecessary-condition rule */
  // if (!componentState?.value) throw new Error(`[getComponent]: entity does not have ${component.name}`)
  return componentState
}

export const getOptionalComponent = <ComponentType>(
  entity: Entity,
  component: Component<ComponentType, Record<string, any>, unknown>
): ComponentType | undefined => {
  return component.valueMap[entity] as ComponentType | undefined
}

export const getComponent = <ComponentType>(
  entity: Entity,
  component: Component<ComponentType, Record<string, any>, unknown>
): ComponentType => {
  return component.valueMap[entity] as ComponentType
}

/**
 * @description
 * Assigns the given component to the given entity, and returns the component.
 * @notes
 * - If the component already exists, it will be overwritten.
 * - Unlike calling {@link removeComponent} followed by {@link addComponent}, the entry queue will not be rerun.
 *
 * @param entity The entity to which the Component will be attached.
 * @param Component The Component that will be attached.
 * @param args `@todo` Explain what `setComponent(   args)` is
 * @returns The component that was attached.
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
    const value = Component.onInit(entity)
    Component.existenceMapPromiseResolver[entity]?.resolve?.()

    if (!Component.stateMap[entity]) {
      Component.existenceMapState[entity] = hookstate(true)
      Component.stateMap[entity] = hookstate(value, subscribable())
    } else {
      Component.existenceMapState[entity]!.set(true)
      Component.stateMap[entity]!.set(value)
    }

    Component.valueMap[entity] = value

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
          React.createElement(Component.reactor!, {})
        )
      }) as ReactorRoot
      root['entity'] = entity
      root['component'] = Component.name
      Component.reactorMap.set(entity, root)
    }
  }
  // startTransition(() => {
  Component.onSet(entity, Component.stateMap[entity]!, args as Readonly<SerializedComponentType<C>>)
  Component.valueMap[entity] = Component.stateMap[entity]?.get(NO_PROXY_STEALTH)
  const root = Component.reactorMap.get(entity)
  if (!root?.isRunning) root?.run()
  // })
}

/**
 * @experimental
 * @description `@todo` Explain how `updateComponent` works.
 */
export const updateComponent = <C extends Component>(
  entity: Entity,
  Component: C,
  props: Partial<SerializedComponentType<C>>
) => {
  if (typeof props === 'undefined') return

  const comp = getMutableComponent(entity, Component)
  if (!comp) {
    throw new Error('[updateComponent]: component does not exist ' + Component.name)
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

export const hasComponent = <C extends Component>(entity: Entity, component: C) => {
  return component.existenceMapState[entity]?.get(NO_PROXY_STEALTH) ?? false
}

export const removeComponent = async <C extends Component>(entity: Entity, component: C) => {
  if (!hasComponent(entity, component)) return
  component.existenceMapState[entity]?.set(false)
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
  if (!hasComponent(entity, component)) {
    // reset the stateMap (do not use `none` here, as we don't want the state to become a promise)
    component.stateMap[entity]?.set(undefined)
  }
}

/**
 * @description
 * Initializes a temporary Component of the same type that the given Component, using its {@link Component.onInit} function, and returns its serialized JSON data.
 * @notes The temporary Component won't be inserted into the ECS system, and its data will be GC'ed at the end of this function.
 * @param component The desired Component.
 * @returns JSON object containing the requested data.
 */
export const componentJsonDefaults = <C extends Component>(component: C) => {
  const initial = component.onInit(UndefinedEntity)
  const pseudoState: Record<string, { value: any; get: () => any }> = {}
  for (const key of Object.keys(initial)) {
    pseudoState[key] = {
      value: initial[key],
      get: () => initial[key]
    }
  }
  return component.toJSON(UndefinedEntity, pseudoState as any)
}

/**
 * @description Returns a array of all {@link Component}s associated with the given {@link Entity}.
 * @param entity The desired Entity.
 * @returns An array containing all of the Entity's associated components.
 */
export const getAllComponents = (entity: Entity): Component[] => {
  if (!bitECS.entityExists(Engine.instance, entity)) return []
  return bitECS.getEntityComponents(Engine.instance, entity) as Component[]
}

/**
 * @description Returns an {@link Object} containing the data of all {@link Component}s of the given {@link Entity}.
 * @param entity The desired Entity.
 * @returns An {@link Object} where each component of the given {@link Entity} has its own field.
 */
export const getAllComponentData = (entity: Entity): { [name: string]: ComponentType<any> } => {
  return Object.fromEntries(getAllComponents(entity).map((C) => [C.name, getComponent(entity, C)]))
}

/**
 * @description Creates a {@link Query} with the given {@link Component}, and returns the number of {@link Component}s currently stored in the engine's buffer for that {@link Component} type.
 * @param component The desired Component
 * @returns The amount of Component's that the engine stores for the given component type.
 */
export const getComponentCountOfType = <C extends Component>(component: C): number => {
  const query = defineQuery([component])
  const length = query().length
  bitECS.removeQuery(Engine.instance, query._query)
  return length
}

/**
 * `@todo` Explain this function
 * @param component The desired Component
 * @returns An array of {@link ComponentType} components
 */
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
  return JSON.parse(JSON.stringify(Component.toJSON(entity, component))) as ReturnType<C['toJSON']>
}

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
  if (!Component.stateMap[entity]) {
    //in the case that this is called before a component is set we need a hookstate present for react
    Component.existenceMapState[entity] = hookstate(false)
    Component.stateMap[entity] = hookstate(undefined, subscribable())
  }
  const hasComponent = useHookstate(Component.existenceMapState[entity]).value
  const component = useHookstate(Component.stateMap[entity]) as any as State<ComponentType<C>> // todo fix any cast
  return hasComponent ? component : undefined
}

export type Query = ReturnType<typeof defineQuery>

globalThis.EE_getComponent = getComponent
globalThis.EE_getAllComponents = getAllComponents
globalThis.EE_getAllComponentData = getAllComponentData
globalThis.EE_setComponent = setComponent
globalThis.EE_removeComponent = removeComponent
