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
import multiLogger from '@etherealengine/engine/src/common/functions/logger'
import { HookableFunction } from '@etherealengine/common/src/utils/createHookableFunction'
import { getNestedObject } from '@etherealengine/common/src/utils/getNestedProperty'
import { HyperFlux, ReactorRoot, defineActionQueue, startReactor } from '@etherealengine/hyperflux'
import {
  hookstate,
  NO_PROXY,
  none,
  ReceptorMap,
  State,
  useHookstate
} from '@etherealengine/hyperflux/functions/StateFunctions'

import { Entity, UndefinedEntity } from '../classes/Entity'
import { EntityContext, useEntityContext } from './EntityFunctions'
import { defineSystem } from './SystemFunctions'
import { InputSystemGroup } from './EngineFunctions'

const logger = multiLogger.child({ component: 'engine:ecs:ComponentFunctions' })

export const INITIAL_COMPONENT_SIZE = config.client.appEnv === 'test' ? 100000 : 5000 // TODO set to 0 after next bitECS update
bitECS.setDefaultSize(INITIAL_COMPONENT_SIZE)

export const ComponentMap = new Map<string, Component<any, any, any>>()
export const ComponentJSONIDMap = new Map<string, Component<any, any, any>>() // <jsonID, Component>
globalThis.ComponentMap = ComponentMap
globalThis.ComponentJSONIDMap = ComponentJSONIDMap

type PartialIfObject<T> = T extends object ? Partial<T> : T

type OnInitValidateNotState<T> = T extends State<any, object | unknown> ? 'onInit must not return a State object' : T

type SomeStringLiteral = 'a' | 'b' | 'c' // just a dummy string literal union
type StringLiteral<T> = string extends T ? SomeStringLiteral : string

export interface ComponentPartial<
  ComponentType = any,
  Schema extends bitECS.ISchema = Record<string, any>,
  JSON = ComponentType,
  SetJSON = PartialIfObject<DeepReadonly<JSON>>,
  ErrorTypes = never,
  Receptors = ReceptorMap
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
  receptors?: Receptors
}
export interface Component<
  ComponentType = any,
  Schema extends bitECS.ISchema = Record<string, any>,
  JSON = ComponentType,
  SetJSON = PartialIfObject<DeepReadonly<JSON>>,
  ErrorTypes = string,
  Receptors = ReceptorMap
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
  receptors?: Receptors
  existenceMap: Readonly<Record<Entity, boolean>>
  existenceMapState: State<Record<Entity, boolean>>
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
  Component.receptors = {}
  Object.assign(Component, def)
  if (Component.reactor) Object.defineProperty(Component.reactor, 'name', { value: `Internal${Component.name}Reactor` })
  Component.reactorMap = new Map()
  // We have to create an stateful existence map in order to reactively track which entities have a given component.
  // Unfortunately, we can't simply use a single shared state because hookstate will (incorrectly) invalidate other nested states when a single component
  // instance is added/removed, so each component instance has to be isolated from the others.
  Component.existenceMap = {}
  Component.existenceMapState = hookstate(Component.existenceMap)
  Component.existenceMapPromiseResolver = {}
  Component.stateMap = {}
  Component.valueMap = {}
  if (Component.jsonID) {
    ComponentJSONIDMap.set(Component.jsonID, Component)
    console.log(`Registered component ${Component.name} with jsonID ${Component.jsonID}`)
  }
  ComponentMap.set(Component.name, Component)

  const ExternalComponentReactor = (props: SetJSON) => {
    const entity = useEntityContext()

    useLayoutEffect(() => {
      setComponent(entity, Component, props)
      return () => {
        removeComponent(entity, Component)
      }
    }, [props])

    return null
  }
  Object.setPrototypeOf(ExternalComponentReactor, Component)
  Object.defineProperty(ExternalComponentReactor, 'name', { value: `${Component.name}Reactor` })

  return ExternalComponentReactor as typeof Component & { _TYPE: ComponentType } & typeof ExternalComponentReactor
}

/**
 * @deprecated use `defineComponent`
 */
export const createMappedComponent = <
  ComponentType = object | unknown,
  Schema extends bitECS.ISchema = Record<string, any>
>(
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
  component: Component<ComponentType, Record<string, any>, unknown>
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
  component: Component<ComponentType, Record<string, any>, unknown>
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
  if (!bitECS.entityExists(HyperFlux.store, entity)) {
    throw new Error('[setComponent]: entity does not exist')
  }
  if (args && Component.receptors) {
    throw new Error('[setComponent]: args are not supported when a component state is driven by action receptors')
  }
  if (!hasComponent(entity, Component)) {
    const value = Component.onInit(entity)
    Component.existenceMapState[entity].set(true)
    Component.existenceMapPromiseResolver[entity]?.resolve?.()

    if (!Component.stateMap[entity]) {
      Component.stateMap[entity] = hookstate(value, subscribable())
    } else Component.stateMap[entity]!.set(value)

    bitECS.addComponent(HyperFlux.store, Component, entity, false) // don't clear data on-add

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

    if (Component.receptors) {
      const queue = defineActionQueue(Object.values(Component.receptors).map((r) => r.matchesAction))

      defineSystem({
        uuid: `${entity}.${Component.name}.actionReceptor`,
        insert: { before: InputSystemGroup },
        execute: () => {
          HyperFlux.store.receptorEntityContext = entity
          // queue may need to be reset when actions are recieved out of order
          // or when state needs to be rolled back
          if (queue.needsReset) {
            // reset the state to the initial value when the queue is reset
            setComponent(entity, Component, componentJsonDefaults(Component))
            queue.reset()
          }
          // apply each action to each matching receptor, in order
          for (const action of queue()) {
            for (const receptor of Object.values(Component.receptors!)) {
              receptor.matchesAction.test(action) && receptor(action)
            }
          }
          HyperFlux.store.receptorEntityContext = UndefinedEntity
        }
      })
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
  bitECS.removeComponent(HyperFlux.store, component, entity, false)
  delete component.valueMap[entity]
  const root = component.reactorMap.get(entity)
  component.reactorMap.delete(entity)
  // we need to wait for the reactor to stop before removing the state, otherwise
  // we can trigger errors in useEffect cleanup functions
  if (root?.isRunning) await root?.stop()
  // NOTE: we may need to perform cleanup after a timeout here in case there
  // are other reactors also referencing this state in their cleanup functions
  if (!hasComponent(entity, component)) {
    component.stateMap[entity]?.set(none)
    // Can not get the full destroy to function without widespread errors in our core systems
    //component.stateMap[entity]?.destroy
    //delete component.stateMap[entity]
  }
}

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

export const getAllComponents = (entity: Entity): Component[] => {
  if (!bitECS.entityExists(HyperFlux.store, entity)) return []
  return bitECS.getEntityComponents(HyperFlux.store, entity) as Component[]
}

export const getAllComponentData = (entity: Entity): { [name: string]: ComponentType<any> } => {
  return Object.fromEntries(getAllComponents(entity).map((C) => [C.name, getComponent(entity, C)]))
}

export const removeAllComponents = (entity: Entity) => {
  const promises = [] as Promise<void>[]
  try {
    for (const component of bitECS.getEntityComponents(HyperFlux.store, entity)) {
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
  if (!Component.stateMap[entity]) Component.stateMap[entity] = hookstate(undefined, subscribable()) //in the case that this is called before a component is set we need a hookstate present for react
  const component = useHookstate(Component.stateMap[entity]) as any as State<ComponentType<C>> // todo fix any cast
  return hasComponent ? component : undefined
}

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
