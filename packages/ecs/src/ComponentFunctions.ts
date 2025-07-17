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

All portions of the code written by the Infinite Reality Engine team are Copyright 2021-2025 
Infinite Reality Engine. All Rights Reserved.
*/

/**
 * @fileoverview
 * @todo Write the `fileoverview` for `ComponentFunctions.ts`
 */
import * as bitECS from 'bitecs'
import React from 'react'
// tslint:disable:ordered-imports
import type from 'react/experimental'

import {
  DeepReadonly,
  HyperFlux,
  Identifiable,
  NO_PROXY_STEALTH,
  Path,
  ReactorRoot,
  SetPartialStateAction,
  State,
  destroy,
  extend,
  getState,
  hookstate,
  identifiable,
  none,
  resolveObject,
  startReactor,
  useHookstate
} from '@ir-engine/hyperflux'
import { ECSState } from './ECSState'
import { Easing, EasingFunction } from './EasingFunctions'
import { Entity, UndefinedEntity } from './Entity'
import { QueryReactor, defineQuery, removeQuery } from './QueryFunctions'
import { defineSystem } from './SystemFunctions'
import { PresentationSystemGroup } from './SystemGroups'
import { Transitionable, TransitionableTypes, getTransitionableKeyForType } from './Transitionable'
import { createResizableTypeArray } from './bitecsLegacy'
import { Kind, Schema, Static, Schema as TSchema, TTypedSchema } from './schemas/JSONSchemaTypes'
import {
  CreateSchemaValue,
  DeserializeSchemaValue,
  HasRequiredSchema,
  HasRequiredSchemaValues,
  HasSchemaValidators,
  HasValidSchemaValues,
  IsSingleValueSchema,
  SerializeSchema
} from './schemas/JSONSchemaUtils'
import { S } from './schemas/JSONSchemas'

/**
 * === SECTION ===
 * Component Functions
 */

export const ComponentMap = new Map<string, Component<any, any, any, any, any, any>>()
export const ComponentJSONIDMap = new Map<string, Component<any, any, any, any, any, any>>() // <jsonID, Component>
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
type Optional<T> = T | undefined

type ComponentSchema = TSchema

/** @todo figure out how to make these actually optional */
type ComponentJSON<T> = PartialIfObject<T>
// & T extends object
//   ? { [K in keyof T]: T[K] extends TRequiredSchema<T[K]> ? T[K] : Optional<T[K]> }
//   : T extends TRequiredSchema<T>
//   ? T
//   : Optional<T>

type ComponentInitializationType<Schema extends ComponentSchema> = Schema extends TSchema ? Static<Schema> : never

/**
 * @description
 * Data used to create a Component with {@link defineComponent}.
 * @why
 * This type exists so that some of the properties of {@link Component}s are optional when defining them, but required during normal use.
 * See [Typescript.Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype) for a reference of what Partials are.
 */
export interface ComponentPartial<
  Schema extends ComponentSchema = any,
  InitializationType = ComponentInitializationType<Schema>,
  ComponentType = InitializationType,
  JSON = ComponentType,
  SetJSON = ComponentJSON<DeepReadonly<ComponentType>>,
  ErrorTypes = never,
  StorageType = object
> {
  /** @description Human readable label for the component. Displayed in the editor and debugging tools. */
  name: string
  /** @description Internal ID used to reference this component in JSON data. */
  jsonID?: string
  /** @description A Component's Schema is the shape of its serializable data. */
  schema?: Schema
  /**
   * @description Called once when the component is added to an entity (ie: initialized).
   * @param initial the initial value created from the component's schema.
   * @returns The shape of the component's runtime data.
   */
  onInit?: (entity: Entity, initial: InitializationType) => ComponentType & OnInitValidateNotState<ComponentType>
  /**
   * @description
   * Serializer function called when the component is saved to a snapshot or scene file.
   * Its logic must convert the component's runtime data into a JSON object.
   * @param entity The {@link Entity} to which this Component is assigned.
   * @param component The Component's global data (aka {@link State}).
   */
  toJSON?: (component: ComponentType) => JSON
  /**
   * @description
   * Called when the component's data is updated via the {@link setComponent} function.
   * This is where deserialization logic should happen.
   * @param entity The {@link Entity} to which this Component is assigned.
   * @param component The Component's global data (aka {@link State}).
   * @param json The JSON object that contains this component's serialized data.
   */
  onSet?: (entity: Entity, component: ComponentType, json?: SetJSON) => void
  /** @todo Explain ComponentPartial.onRemove(...) */
  onRemove?: (entity: Entity, component: ComponentType) => void | Promise<void>
  /**
   * @summary Defines the {@link React.FC} async logic of the {@link Component} type.
   * @notes Any side-effects that depend on the component's data should be defined here.
   * @description
   * {@link React}'s `Function Component` of the resulting ECS {@link Component} type.
   * `@todo` Explain what reactive is in this context
   * `@todo` Explain this function
   */
  reactor?: any // previously <React.FC> breaks types

  storage?: StorageType
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
  Schema extends ComponentSchema = any,
  InitializationType = ComponentInitializationType<Schema>,
  ComponentType = InitializationType,
  JSON = ComponentType,
  SetJSON = ComponentJSON<DeepReadonly<ComponentType>>,
  ErrorTypes = string,
  StorageType = any
> {
  isComponent: true
  name: string
  jsonID?: string
  schema?: Schema
  onInit?: (entity: Entity, initial: InitializationType) => ComponentType & OnInitValidateNotState<ComponentType>
  toJSON: (component: ComponentType) => JSON
  onSet: (entity: Entity, component: ComponentType, json?: SetJSON) => void
  onRemove: (entity: Entity, component: ComponentType) => void
  reactor?: any
  reactorRoot?: ReactorRoot
  storage?: StorageType
  counterMap: Record<Entity, State<number, Identifiable>>
  valueMap: Record<Entity, ComponentType>
  errors: ErrorTypes[]
  storageSize: number
  __ComponentType: ComponentType
}

/** @description Generic `type` for all Engine's ECS {@link Component}s. All of its fields are required to not be `null`. */
export type ComponentType<C extends Component> = C['__ComponentType']
/** @description Generic `type` for {@link Component}s, that takes the shape of the type returned by the its serialization function {@link Component.toJSON}. */
export type SerializedComponentType<C extends Component> = ReturnType<C['toJSON']>
/** @description Generic `type` for {@link Component}s, that takes the shape of the type returned by its {@link Component.onSet} function. */
export type SetComponentType<C extends Component> = Parameters<C['onSet']>[2]
/** @description Generic `type` for {@link Component}s, that takes the shape of the type used by its {@link Component.errors} field. */
export type ComponentErrorsType<C extends Component> =
  C['errors'][number] /** @todo What is C[...][number] doing here? */

type Primitive = string | number | bigint | boolean | undefined | symbol
export type ComponentPropertyPath<T, Prefix = ''> = {
  [K in keyof T]: T[K] extends Function
    ? never
    : T[K] extends Primitive | Array<any>
    ? `${string & Prefix}${string & K}`
    : `${string & Prefix}${string & K}` | ComponentPropertyPath<T[K], `${string & Prefix}${string & K}.`>
}[keyof T]

// Helper type for checking if a string is a direct property key
type IsDirectProperty<T, P extends string> = P extends keyof T ? true : false

// Helper type for extracting the first segment of a path
type FirstSegment<P extends string> = P extends `${infer First}.${any}` ? First : P

// Helper type for extracting the rest of the path after the first segment
type RestOfPath<P extends string> = P extends `${any}.${infer Rest}` ? Rest : never

// Helper type for getting a property type directly
type DirectPropertyType<T, P extends string> = P extends keyof T ? T[P] : never

// Helper type for handling nested property paths
type NestedPropertyType<T, P extends string> = FirstSegment<P> extends keyof T
  ? ComponentPropertyFromPath<T[FirstSegment<P>], RestOfPath<P>>
  : never

// Get the property type from a path
export type ComponentPropertyFromPath<T, Path extends string> = IsDirectProperty<T, Path> extends true
  ? DirectPropertyType<T, Path>
  : Path extends `${string}.${string}`
  ? NestedPropertyType<T, Path>
  : never

// function propertyStringPathFactory<T, R=string>(): (path: ComponentPropertyPath<T>) => R {
//   // @ts-ignore
//   return (path: ComponentPropertyPath<T>) => (path as unknown as R);
// }

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
 *   schema: S.Object({
 *     prop: S.String('default')
 *   }),
 *   onSet: (entity, component, json) => {
 *     // side effects
 *   },
 *   onRemove: (entity, component) => {
 *     // clean up side effects
 *   },
 *   errors: []
 * })
 * ```
 */
export const defineComponent = <
  Schema extends ComponentSchema = any,
  InitializationType = ComponentInitializationType<Schema>,
  ComponentType = InitializationType,
  JSON = ComponentType,
  SetJSON = ComponentJSON<DeepReadonly<ComponentType>>,
  ErrorTypes = never,
  ComponentExtras = Record<string, unknown>,
  StorageType = object
>(
  def: ComponentPartial<Schema, InitializationType, ComponentType, JSON, SetJSON, ErrorTypes, StorageType> &
    ComponentExtras
) => {
  const Component = {} as Component<
    Schema,
    InitializationType,
    ComponentType,
    JSON,
    SetJSON,
    ErrorTypes,
    StorageType
  > & {
    _TYPE: ComponentType
  } & ComponentExtras &
    StorageType & { setTransition: typeof setTransition }
  Component.isComponent = true

  // move all branching out of hot path and into definition
  if (def.schema) {
    if (IsSingleValueSchema(def.schema)) {
      if (HasRequiredSchema(def.schema)) {
        Component.onSet = (entity, component, json) => {
          const [valid, key] = HasRequiredSchemaValues(def.schema as TSchema, json)
          if (!valid) throw new Error(`${def.name}:OnSet Missing required value for key ${key}`)
          Component.valueMap[entity] = json! as any
        }
      } else {
        Component.onSet = (entity, component, json) => {
          if (!json) return
          Component.valueMap[entity] = json! as any
        }
      }
    } else {
      if (HasRequiredSchema(def.schema)) {
        Component.onSet = (entity, component, json) => {
          const [valid, key] = HasRequiredSchemaValues(def.schema as TSchema, json)
          if (!valid) throw new Error(`${def.name}:OnSet Missing required value for key ${key}`)

          if (Array.isArray(json) || typeof json !== 'object') {
            Component.valueMap[entity] = json as ComponentType
          } else {
            for (const key of Object.keys(json!)) {
              component[key] = json![key]
            }
          }
        }
      } else {
        Component.onSet = (entity, component, json) => {
          if (!json) return

          if (Array.isArray(json) || typeof json !== 'object') {
            Component.valueMap[entity] = json as ComponentType
          } else {
            for (const key of Object.keys(json!)) {
              component[key] = json![key]
            }
          }
        }
      }
    }
  } else {
    Component.onSet = () => {}
  }

  Component.onRemove = () => {}
  Component.toJSON = (component: ComponentType) => {
    return validateComponentSchema(def as any, component) as JSON
  }

  Component.errors = []
  Object.assign(Component, def)

  if (def.storage) {
    Object.assign(Component, def.storage)
  }

  if (Component.reactor) Object.defineProperty(Component.reactor, 'name', { value: `Internal${Component.name}Reactor` })
  // We have to create an stateful existence map in order to reactively track which entities have a given component.
  // Unfortunately, we can't simply use a single shared state because hookstate will (incorrectly) invalidate other nested states when a single component
  // instance is added/removed, so each component instance has to be isolated from the others.
  Component.valueMap = {}
  Component.counterMap = {}
  if (Component.jsonID) {
    ComponentJSONIDMap.set(Component.jsonID, Component)
    // console.log(`Registered component ${Component.name} with jsonID ${Component.jsonID}`)
  } else if (def.toJSON) {
    console.warn(
      `Component ${Component.name} has toJson defined, but no jsonID defined. This will cause serialization issues.`
    )
  }
  ComponentMap.set(Component.name, Component)

  function setTransition<P extends ComponentPropertyPath<ComponentType>>(
    /** @description The entity to transition the property of. */
    entity: Entity,
    /** @description The path to the property to transition. */
    propertyPath: P,
    /** @description The value to transition to. */
    value: ComponentPropertyFromPath<ComponentType, P> & TransitionableTypes,
    options: {
      /** @description The duration of the transition in milliseconds. */
      duration?: number
      /** @description The easing function to use for the transition. */
      easing?: EasingFunction
      /** @description The type of transition to use. */
      type?: keyof typeof Transitionable
    }
  ) {
    TransitionComponent.setTarget(entity, {
      componentJsonID: Component.jsonID!,
      propertyPath,
      value,
      duration: options.duration,
      easing: options.easing
    })
  }

  Component.setTransition = setTransition

  Component.storageSize = 0

  return Component
}

/** @deprecated */
export const getOptionalMutableComponent = <C extends Component>(
  entity: Entity,
  component: C
): DeepReadonly<ComponentType<C>> | undefined => {
  return bitECS.hasComponent(HyperFlux.store, entity, component) ? component.valueMap[entity] : undefined
}

/** @deprecated */
export const getMutableComponent = <C extends Component>(
  entity: Entity,
  component: C
): DeepReadonly<ComponentType<C>> => {
  const componentState = getOptionalMutableComponent(entity, component)
  if (componentState === undefined) {
    console.warn(
      `[getMutableComponent]: entity ${entity} does not have ${component.name}. This will be an error in the future. Use getOptionalMutableComponent if there is uncertainty over whether or not an entity has the specified component.`
    )
    return undefined as any
  }
  return componentState
}

export const getOptionalComponent = <C extends Component>(
  entity: Entity,
  component: C
): ComponentType<C> | undefined => {
  return component.valueMap[entity]
}

export const getComponent = <C extends Component>(entity: Entity, component: C): ComponentType<C> => {
  const value = component.valueMap[entity] as ComponentType<C>
  if (value === undefined) {
    console.warn(
      `[getComponent]: entity ${entity} does not have ${component.name}. This will be an error in the future. Use getOptionalComponent if there is uncertainty over whether or not an entity has the specified component.`
    )
  }
  return value
}

export const createInitialComponentValue = <
  Schema extends ComponentSchema,
  InitializationType,
  ComponentType,
  JSON,
  SetJSON
>(
  entity: Entity,
  component: Component<Schema, InitializationType, ComponentType, JSON, SetJSON, unknown>
): ComponentType => {
  if (!component.schema) {
    if (component.onInit) return component.onInit(entity, undefined!) as ComponentType
    return true as ComponentType // true as tag component
  }
  const schema = CreateSchemaValue(component.schema) as InitializationType
  if (component.onInit) return component.onInit(entity, schema) as ComponentType
  else return schema as unknown as ComponentType
}

function nearestPowerOf2(n: number) {
  return 1 << (31 - Math.clz32(n))
}

function nextPowerOf2(n: number) {
  return nearestPowerOf2((n - 1) * 2)
}

const TypedArray = Object.getPrototypeOf(Uint8Array)

const resizeSoA = (arrayOrObject: any, size: number) => {
  if (arrayOrObject instanceof TypedArray) {
    const byteLength = size * arrayOrObject.constructor.BYTES_PER_ELEMENT
    arrayOrObject.buffer.resize(byteLength)
  } else {
    for (const propertyName in arrayOrObject) {
      resizeSoA(arrayOrObject[propertyName], size)
    }
  }
}

const resizeComponent = (component: Component, size: number) => {
  const schema = component.storage
  for (const propertyName in schema) {
    resizeSoA(component[propertyName], size)
  }
  component.storageSize = size
}

let componentInstanceCount = 0

const _incrementCounter = (c: number) => c + 1

const _getComponentCounter = <C extends Component>(entity: Entity, component: C) => {
  if (!component.counterMap[entity]) {
    const id = `${component.name}_${entity}_${componentInstanceCount++}`
    component.counterMap[entity] = hookstate(
      none,
      extend(identifiable(id), () => ({}))
    ) as State<number, Identifiable>
  }
  return component.counterMap[entity]
}

/**
 * @description
 * Assigns the given component to the given entity, and returns the component.
 * @notes
 * - If the component already exists, it will be overwritten.
 * - Unlike calling {@link removeComponent} followed by {@link addComponent}, the entry queue will not be rerun.
 * - Does not run validators or deserialization.
 *
 * @param entity The entity to which the Component will be attached.
 * @param component The Component that will be attached.
 * @param args `@todo` Explain what `setComponent(   args)` is
 * @returns The component that was attached.
 */
export const setComponent = <C extends Component>(
  entity: Entity,
  component: C,
  args: SetComponentType<C> | undefined = undefined
) => {
  if (!entity) {
    throw new Error('[setComponent]: entity is undefined')
  }
  if (!entityExists(entity)) {
    throw new Error('[setComponent]: entity does not exist')
  }

  if (component.storage) {
    const nextSize = nextPowerOf2(entity + 1)
    if (component.storageSize < nextSize) resizeComponent(component, nextSize)
  }

  _getComponentCounter(entity, component)

  const exists = hasComponent(entity, component)

  if (!exists) {
    component.counterMap[entity].set(0)
    const data = createInitialComponentValue(entity, component)
    component.valueMap[entity] = data
    // we must call onSet before setting the component in the ECS, such that the propagation
    // callback does not propagate data that may be required but not set yet
    component.onSet(entity, data, args)
    bitECS.addComponent(HyperFlux.store, entity, component)
  } else {
    component.onSet(entity, component.valueMap[entity], args)
    component.counterMap[entity].set(_incrementCounter)
  }

  LayerFunctions.propagateLayer(entity, component)

  if (component.reactor && !component.reactorRoot) {
    const root = startReactor(() => {
      return React.createElement(QueryReactor, {
        Components: [component],
        ChildEntityReactor: component.reactor as any
      })
    }, `Component - ${component.name}`) as ReactorRoot
    root.cleanupFunctions.add(() => {
      component.reactorRoot = undefined
    })
    root['component'] = component.name
    component.reactorRoot = root
  }
}

export const hasComponent = <C extends Component>(entity: Entity, component: C): boolean => {
  if (!component) throw new Error('[hasComponent]: component is undefined')
  if (!entity) return false
  return bitECS.hasComponent(HyperFlux.store, entity, component)
}

/**
 * Returns true if the entity has all the specified components, false if it is missing any
 * @param entity
 * @param components
 */
export function hasComponents<C extends Component>(entity: Entity, components: C[]): boolean {
  if (!components) throw new Error('[hasComponent]: component is undefined')
  if (components.length < 1 || !entity) return false

  for (const component of components) {
    if (!hasComponent(entity, component)) return false
  }
  return true
}

export function useHasComponents<C extends Component>(entity: Entity, components: C[]): boolean {
  let hasAllComponents = true
  for (const component of components) {
    useOptionalComponent(entity, component)
    if (!hasComponent(entity, component)) hasAllComponents = false
  }

  return hasAllComponents
}

export const removeComponent = <C extends Component>(entity: Entity, component: C) => {
  if (!hasComponent(entity, component)) return

  const relations = LayerFunctions.getLayerRelationsEntities(entity)
  if (relations) {
    const entityLayer = LayerComponent.get(entity)
    for (const [layer, linkedEntity] of relations) {
      if (!LayerFunctions.shouldPropagate(entityLayer, layer)) continue
      removeComponent(linkedEntity, component)
    }
  }

  bitECS.removeComponent(HyperFlux.store, entity, component)
  component.onRemove(entity, component.valueMap[entity])
  component.counterMap[entity].set(none)
  destroy(component.counterMap[entity])
  delete component.counterMap[entity]
  delete component.valueMap[entity]
}

/**
 * @description
 * Initializes a temporary Component of the same type that the given Component, using its {@link Component.onInit} function, and returns its serialized JSON data.
 * @notes The temporary Component won't be inserted into the ECS system, and its data will be GC'ed at the end of this function.
 * @param component The desired Component.
 * @returns JSON object containing the requested data.
 */
export const componentJsonDefaults = <C extends Component>(component: C) => {
  const initial = createInitialComponentValue(UndefinedEntity, component)
  return component.toJSON(initial)
}

/**
 * @description Returns a array of all {@link Component}s associated with the given {@link Entity}.
 * @param entity The desired Entity.
 * @returns An array containing all of the Entity's associated components.
 */
export const getAllComponents = (entity: Entity): Component[] => {
  if (!entityExists(entity)) return []
  return bitECS.getEntityComponents(HyperFlux.store, entity) as Component[]
}

/**
 * @description Returns an {@link Object} containing the data of all {@link Component}s of the given {@link Entity}.
 * @param entity The desired Entity.
 * @returns An {@link Object} where each component of the given {@link Entity} has its own field.
 */
export const getAllComponentData = (entity: Entity): { [name: string]: ComponentType<any> } => {
  return Object.fromEntries(getAllComponents(entity).map((C) => [C.name, getComponent(entity, C)]))
}

export const removeAllComponents = (entity: Entity) => {
  if (!entityExists(entity)) return
  try {
    for (const component of bitECS.getEntityComponents(HyperFlux.store, entity)) {
      try {
        removeComponent(entity, component as Component)
      } catch (e) {
        console.error(e)
      }
    }
  } catch (e) {
    console.error(e)
  }
}

export const deserializeComponent = <C extends Component>(
  entity: Entity,
  Component: C,
  json: SetComponentType<C> | undefined = undefined
) => {
  if (Component.schema && HasRequiredSchema(Component.schema)) {
    const [valid, key] = HasRequiredSchemaValues(Component.schema as TSchema, json)
    if (!valid) throw new Error(`${Component.name}:deserializeComponent Missing required value for key ${key}`)
  }

  /** @todo this can be replaced with setComponent rather than just some of the initializers once reactors are not forced to run synchronously */
  if (!hasComponent(entity, Component)) {
    if (!entity) throw new Error('[deserializeComponent]: entity is undefined')
    if (!entityExists(entity)) throw new Error('[deserializeComponent]: entity does not exist')

    if (Component.storage) {
      const nextSize = nextPowerOf2(entity + 1)
      if (Component.storageSize < nextSize) resizeComponent(Component, nextSize)
    }

    _getComponentCounter(entity, Component)
    Component.counterMap[entity].set(0)

    const data = createInitialComponentValue(entity, Component)
    Component.valueMap[entity] = data
    bitECS.addComponent(HyperFlux.store, entity, Component)
  }

  if (json === null || json === undefined) return

  const component = getComponent(entity, Component)

  const args = Component.schema ? DeserializeSchemaValue(Component.schema, component, json) : json

  if (Component.schema && HasSchemaValidators(Component.schema)) {
    const [valid, key] = HasValidSchemaValues(Component.schema, args, component, entity)
    if (!valid)
      throw new Error(`${component.name}:deserializeComponent Invalid value for key ${key} ${JSON.stringify(args)}`)
  }

  setComponent(entity, Component, args)
}

export const serializeComponent = <C extends Component>(entity: Entity, Component: C) => {
  const component = getComponent(entity, Component)
  return JSON.parse(JSON.stringify(Component.toJSON(component))) as ReturnType<C['toJSON']>
}

// If we want to add more validation logic (ie. schema migrations), decouple this function from Component.toJSON first
export const validateComponentSchema = <C extends Component>(Component: C, data: ComponentType<C>) => {
  if (!Component.schema) return data
  return SerializeSchema(Component.schema, data)
}

// use seems to be unavailable in the server environment
export function _use(promise) {
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
export function useComponent<C extends Component>(entity: Entity, component: C): ComponentType<C> {
  if (entity === UndefinedEntity) throw new Error('InvalidUsage: useComponent called with UndefinedEntity')

  const state = _getComponentCounter(entity, component)
  useHookstate(state)

  // use() will suspend the component (by throwing a promise) and resume when the promise is resolved
  if (state.promise) {
    ;(React.use ?? _use)(state.promise)
  }

  return component.valueMap[entity]
}

export function useHasComponent<C extends Component>(entity: Entity, component: C): boolean {
  useOptionalComponent(entity, component)
  return hasComponent(entity, component)
}

/**
 * Use a component in a reactive context (a React component)
 */
export function useOptionalComponent<C extends Component>(entity: Entity, component: C): ComponentType<C> | undefined {
  const promised = useHookstate(_getComponentCounter(entity, component)).promised
  return promised ? undefined : component.valueMap[entity]
}

export const getComponentCountOfType = <C extends Component>(component: C): number => {
  const query = defineQuery([component])
  const length = query().length
  removeQuery(query)
  return length
}

export const getAllComponentsOfType = <C extends Component>(component: C): ComponentType<C>[] => {
  const query = defineQuery([component])
  const entities = query()
  removeQuery(query)
  return entities.map((e) => {
    return getComponent(e, component)!
  })
}

/**
 * === SECTION ===
 * Entity Layers
 */

/**
 * @description Returns array of relations that, for each entry, contains:
 *  - Layer number at slot 0
 *  - Entity ID at slot 1
 *  @example ```ts
 *  for ([layer, linkedEntity] of getLayerRelations(entity)) { ..... }
 *  ```
 * */
function getLayerRelationsEntities(entity: Entity): [LayerID, Entity][] | undefined {
  const layerComponent = LayerFunctions.getLayerComponent(entity)
  if (!layerComponent) return
  const layer = getOptionalComponent(entity, layerComponent)
  if (!layer) return
  return Object.entries(layer.relations).map(
    ([layer, val]): [LayerID, Entity] => [Number(layer), val] as [LayerID, Entity]
  )
}

function getLayerRelationsTypes(layer: LayerID): [LayerID, keyof typeof LayerRelationTypes][] {
  return Object.entries(LayerRelations[layer]).map(
    ([layer, val]) => [Number(layer), val] as [LayerID, keyof typeof LayerRelationTypes]
  )
}

/**
 * @description Returns the LayerComponent used by this entity from the LayerComponents map.
 * */
function getLayerComponent(entity: Entity) {
  return LayerComponents[LayerComponent.get(entity)]
}

/**
 * @description Returns true if the given entity/layer pair should trigger propagation behavior.
 * */
function shouldPropagate(entityLayer: LayerID, layer: LayerID): boolean {
  return LayerRelations[entityLayer][layer] === LayerRelationTypes.Propagate
}

/**
 * @description Returns an object containing the args required by {@link createPropagationArgs} when schema[Kind] is a Number
 * */
function createPropagationArgsNumber<C extends Component>(
  schema: Schema,
  key: string | number,
  obj: any,
  layer: LayerID,
  linkedLayer: LayerID,
  entity: Entity,
  component: C
) {
  if (obj === UndefinedEntity) return obj
  if ((schema[Kind] as any) === 'Number' && schema?.options?.['id'] === 'Entity') {
    const referencedEntity = obj as Entity

    // if the entity is already in the linked layer, return the current arg
    if (LayerComponent.get(referencedEntity) === linkedLayer) return referencedEntity

    // otherwise return the linked entity
    return getComponent(referencedEntity, LayerComponents[layer]).relations[linkedLayer]
  } else {
    return obj
  }
}

/**
 * @description Returns an object containing the args required by {@link createPropagationArgs} when schema[Kind] is of type any
 * */
function createPropagationArgsAny<C extends Component>(
  schema: Schema,
  key: string | number,
  obj: any,
  layer: LayerID,
  linkedLayer: LayerID,
  entity: Entity,
  component: C
) {
  if (!obj) return undefined
  if (typeof obj === 'object' && 'clone' in obj && typeof obj.clone === 'function') {
    return obj.clone()
  } else if (Array.isArray(obj)) {
    return [...obj] as any[]
  } else {
    return structuredClone(obj)
  }
}

/**
 * @description Returns an object containing the args required by {@link createPropagationArgs} when schema[Kind] is a Class
 * */
function createPropagationArgsClass<C extends Component>(
  schema: Schema,
  key: string | number,
  obj: any,
  layer: LayerID,
  linkedLayer: LayerID,
  entity: Entity,
  component: C
) {
  if (!obj) return undefined
  if (typeof obj === 'object' && 'clone' in obj && typeof obj.clone === 'function') {
    return obj.clone()
  } else {
    try {
      return structuredClone(obj)
    } catch (error) {
      // throw new Error(
      //   `[propagateSchema]: ${entity} ${component.name} ${key} is not a cloneable class. ` + error.message
      // )
      console.warn(`[propagateSchema]: ${entity} ${component.name} ${key} is not a cloneable class. ` + error.message)
      return obj
    }
  }
}

/**
 * @description Returns an object containing the args required by {@link createPropagationArgs} when schema[Kind] is an Object
 * */
function createPropagationArgsObject<C extends Component>(
  schema: Schema,
  key: string | number,
  obj: any,
  layer: LayerID,
  linkedLayer: LayerID,
  entity: Entity,
  component: C
) {
  if (!obj || typeof obj !== 'object') return undefined
  const props = schema.properties as any
  const args = {} as any
  for (const k in props) {
    const parsed = CreatePropagationArgs.Inner(props[k], k, obj, layer, linkedLayer, entity, component)
    if (typeof parsed === 'undefined') continue
    args[k] = parsed
  }
  return args
}

/**
 * @description Returns an object containing the args required by {@link createPropagationArgs} when schema[Kind] is a Record
 * */
function createPropagationArgsRecord<C extends Component>(
  schema: Schema,
  key: string | number,
  obj: any,
  layer: LayerID,
  linkedLayer: LayerID,
  entity: Entity,
  component: C
) {
  if (!obj) return undefined
  const { key: _, value } = schema.properties as { key: any; value: any }
  const args = {} as any
  for (const k in obj) {
    const parsed = CreatePropagationArgs.Inner(value, k, obj, layer, linkedLayer, entity, component)
    if (typeof parsed === 'undefined') continue
    args[k] = parsed
  }
  return args
}

/**
 * @description Returns an object containing the args required by {@link createPropagationArgs} when schema[Kind] is an Array
 * */
function createPropagationArgsArray<C extends Component>(
  schema: Schema,
  key: string | number,
  obj: any,
  layer: LayerID,
  linkedLayer: LayerID,
  entity: Entity,
  component: C
) {
  if (!obj) return undefined
  const props = schema.properties as any
  const args = [] as any[]
  for (let i = 0; i < obj.length; i++) {
    const parsed = CreatePropagationArgs.Inner(props, i, obj, layer, linkedLayer, entity, component)
    args[i] = parsed
  }
  return args
}

/**
 * @description Returns an object containing the args required by {@link createPropagationArgs} when schema[Kind] is a Tuple
 * */
function createPropagationArgsTuple<C extends Component>(
  schema: Schema,
  key: string | number,
  obj: any,
  layer: LayerID,
  linkedLayer: LayerID,
  entity: Entity,
  component: C
) {
  if (!obj) return undefined
  const props = schema.properties as any
  const args = [] as any[]
  for (let i = 0; i < props.length; i++) {
    const parsed = CreatePropagationArgs.Inner(props[i], i, obj, layer, linkedLayer, entity, component)
    args[i] = parsed
  }
  return args
}

/**
 * @description Returns an object containing the args required by {@link createPropagationArgs} when schema[Kind] is a Union
 * */
function createPropagationArgsUnion<C extends Component>(
  schema: Schema,
  key: string | number,
  obj: any,
  layer: LayerID,
  linkedLayer: LayerID,
  entity: Entity,
  component: C
) {
  const props = schema.properties as any
  for (const prop of props) {
    const parsed = CreatePropagationArgs.Inner(prop, '', obj, layer, linkedLayer, entity, component)
    if (typeof parsed !== 'undefined') return parsed
  }
  return null
}

/**
 * @description Returns an object containing the args required by {@link createPropagationArgs} for the default case
 * */
function createPropagationArgsDefault<C extends Component>(
  schema: Schema,
  key: string | number,
  obj: any,
  layer: LayerID,
  linkedLayer: LayerID,
  entity: Entity,
  component: C
) {
  let props = schema.properties as any
  if (!props) {
    // must be SoA data
    if (typeof obj === 'object') {
      props = {
        properties: Object.fromEntries(Object.keys(schema).map((key) => [key, { [Kind]: 'Any' }])),
        [Kind]: 'Object'
      }
    } else if (typeof obj === 'number') {
      return obj
    }
  }
  return CreatePropagationArgs.Inner(props, '', obj, layer, linkedLayer, entity, component)
}

/**
 * @description Returns an object containing the args required by {@link createPropagationArgs}
 * */
function createPropagationArgsInner<C extends Component>(
  schema: Schema,
  key: string | number,
  data: any,
  layer: LayerID,
  linkedLayer: LayerID,
  entity: Entity,
  component: C
) {
  const obj = key === '' ? data : data[key]
  if (typeof obj === 'undefined' || !schema.options?.serialized) return undefined

  switch (schema[Kind]) {
    case 'Null':
    case 'Undefined':
    case 'Void':
    case 'Bool':
    case 'String':
    case 'Literal': {
      return obj
    }
    case 'Number': {
      return CreatePropagationArgs.Number(schema, key, obj, layer, linkedLayer, entity, component)
    }
    case 'Any': {
      return CreatePropagationArgs.Any(schema, key, obj, layer, linkedLayer, entity, component)
    }
    case 'Class': {
      return CreatePropagationArgs.Class(schema, key, obj, layer, linkedLayer, entity, component)
    }
    case 'Object': {
      return CreatePropagationArgs.Object(schema, key, obj, layer, linkedLayer, entity, component)
    }
    case 'Record': {
      return CreatePropagationArgs.Record(schema, key, obj, layer, linkedLayer, entity, component)
    }
    case 'Array': {
      return CreatePropagationArgs.Array(schema, key, obj, layer, linkedLayer, entity, component)
    }
    case 'Tuple': {
      return CreatePropagationArgs.Tuple(schema, key, obj, layer, linkedLayer, entity, component)
    }
    case 'Union': {
      return CreatePropagationArgs.Union(schema, key, obj, layer, linkedLayer, entity, component)
    }
    case 'Partial':
    case 'Proxy':
    default: {
      return CreatePropagationArgs.Default(schema, key, obj, layer, linkedLayer, entity, component)
    }
  }
}

/**
 * @private Collection of internal functions used by {@link createLayerPropagationArgs}.
 *
 * @note
 * Usage of these functions through this object is preferable.
 * Simplifies unit testing by allowing the definition of function spies directly from this object.
 * */
export const CreatePropagationArgs = {
  Inner: createPropagationArgsInner,
  Number: createPropagationArgsNumber,
  Any: createPropagationArgsAny,
  Class: createPropagationArgsClass,
  Object: createPropagationArgsObject,
  Record: createPropagationArgsRecord,
  Array: createPropagationArgsArray,
  Tuple: createPropagationArgsTuple,
  Union: createPropagationArgsUnion,
  Default: createPropagationArgsDefault
}

/**
 * @description Runs the `@param linkedLayer` propagation process for the schema of the given `@param C` Component
 * @note Checking whether this process/behavior should be run or not is done with the {@link shouldPropagate} helper function.
 * */
function createLayerPropagationArgs<C extends Component>(entity: Entity, linkedLayer: LayerID, component: C) {
  if (!component.schema) return
  const componentSchema = component.schema as TTypedSchema<C>
  const vals = CreatePropagationArgs.Inner(
    componentSchema,
    '',
    getComponent(entity, component),
    LayerComponent.get(entity),
    linkedLayer,
    entity,
    component
  )

  for (const key in vals) {
    if (typeof vals[key] === 'undefined') delete vals[key]
  }

  return vals
}

/**
 * @description
 * Runs the `@param linkedLayer` propagation process for the given `@param entity`/`@param component` pair
 * It will also trigger Schema propagation when `@param component`.schema is truthy.
 *
 * @note Checking whether this process/behavior should be run or not is done with the {@link shouldPropagate} helper function.
 * */
function propagateLayer<C extends Component>(entity: Entity, component: C) {
  if (!bitECS.hasComponent(HyperFlux.store, entity, component)) return
  if ((component as any) === LayerComponent || LayerComponents.includes(component as any)) return
  const relations = LayerFunctions.getLayerRelationsEntities(entity)
  if (!relations) return
  const entityLayer = LayerComponent.get(entity)
  for (const [linkedLayer, linkedEntity] of relations) {
    if (!LayerFunctions.shouldPropagate(entityLayer, linkedLayer)) continue
    const newArgs = LayerFunctions.createLayerPropagationArgs(entity, linkedLayer, component)
    setComponent(linkedEntity, component, newArgs)
  }
}

/**
 * @description
 * Collection of ECSLayers Helper functions.
 *
 * @note
 * Usage of these functions through this object is preferable.
 * Simplifies unit testing by allowing the definition of function spies directly from this object.
 * */
export const LayerFunctions = {
  getLayerRelationsEntities,
  getLayerRelationsTypes,
  getLayerComponent,
  getAuthoringCounterpart,
  shouldPropagate,
  propagateLayer,
  createLayerPropagationArgs
}

export const Layers = {
  Simulation: 0 as const,
  Authoring: 1 as const
}

export type LayerID = (typeof Layers)[keyof typeof Layers]

export const LayerRelationTypes = {
  Propagate: 'propagate'
}

export const LayerRelations = {
  [Layers.Simulation]: {},
  [Layers.Authoring]: {
    [Layers.Simulation]: LayerRelationTypes.Propagate
  }
} as Record<number, Record<number, keyof typeof LayerRelationTypes>>

export const LayerComponents = Object.entries(Layers).map(([name, layer]) => {
  return defineComponent({
    name: `${name}LayerComponent`,
    schema: S.Object({
      relations: S.Record(
        S.Enum(Layers, {
          $comment:
            "A numeric enum, ie. the value of one of the following key-value pairs: 'Simulation': 0, 'Authoring': 1"
        }),
        S.Entity()
      )
    }),

    // backward references
    refs: {} as Record<Entity, Entity>,

    onSet: (entity, _component) => {
      for (const [linkedLayer, relation] of LayerFunctions.getLayerRelationsTypes(layer)) {
        if (relation === LayerRelationTypes.Propagate) {
          const linkedEntity = createEntity(linkedLayer)
          _component.relations[linkedLayer] = linkedEntity
          LayerComponents[linkedLayer].refs[linkedEntity] = entity
        }
      }
    },

    onRemove(entity, _component) {
      for (const [linkedLayer, relation] of LayerFunctions.getLayerRelationsTypes(layer)) {
        if (relation === LayerRelationTypes.Propagate) {
          const relation = _component.relations[linkedLayer]
          removeEntity(relation)
          delete LayerComponents[linkedLayer].refs[relation]
        }
      }
      LayerComponents[layer].refs[entity] = UndefinedEntity
    }
  })
})

export const SimulationLayerComponent = LayerComponents[Layers.Simulation]

// @note LayerComponent is the API for setting and getting the layer of an entity
export const LayerComponent = defineComponent({
  name: 'LayerComponent',

  storage: {
    layer: createResizableTypeArray(Uint8Array)
  },

  onSet(entity, component, layer: LayerID) {
    LayerComponent.layer[entity] = layer
    setComponent(entity, LayerComponents[layer])
  },

  get: (entity: Entity) => {
    return LayerComponent.layer[entity] as any as LayerID
  },

  onRemove(entity, component) {
    const layer = LayerComponent.layer[entity]
    removeComponent(entity, LayerComponents[layer])
    LayerComponent.layer[entity] = 0
  },

  hasUpstreamEntity(entity: Entity) {
    const entityLayer = LayerComponent.get(entity)
    if (entityLayer === Layers.Simulation) {
      const upstreamEntity = LayerComponents[Layers.Simulation].refs[entity]
      if (upstreamEntity !== undefined && upstreamEntity !== UndefinedEntity && entityExists(upstreamEntity))
        return true
    }
    return false
  }
})

export function getAuthoringCounterpart(entity: Entity) {
  const layer = LayerComponent.get(entity)
  if (layer === Layers.Authoring) {
    return entity
  }
  return LayerComponents[Layers.Simulation].refs[entity] ?? UndefinedEntity
}

export function getSimulationCounterpart(entity: Entity) {
  const layer = LayerComponent.get(entity)
  if (layer === Layers.Simulation) {
    return entity
  }
  const relations = LayerFunctions.getLayerRelationsEntities(entity)
  if (!relations) return UndefinedEntity
  const entityLayer = LayerComponent.get(entity)
  for (const [linkedLayer, linkedEntity] of relations) {
    if (linkedLayer === Layers.Simulation) {
      return linkedEntity
    }
  }
  return UndefinedEntity
}

/**
 * === SECTION ===
 * Component Transitions
 */

export const TransitionComponent = defineComponent({
  name: 'TransitionComponent',

  jsonID: 'IR_transition',

  schema: S.Array(
    S.Object({
      componentJsonID: S.String(),
      propertyPath: S.String(),
      transitionableType: S.String(),
      duration: S.Number({ default: 500 }),
      easing: S.String({ default: Easing.exponential.inOut.path }),
      initialValue: S.Type<TransitionableTypes | undefined>({ serialized: false }),
      events: S.Array(
        S.Object({
          age: S.Number(),
          toValue: S.Type<TransitionableTypes>(),
          duration: S.Number(),
          easing: S.String()
        }),
        { serialized: false }
      )
    })
  ),

  setTarget: function (
    entity: Entity,
    target: {
      componentJsonID: string
      propertyPath: string
      value: TransitionableTypes
      duration?: number
      easing?: EasingFunction
      type?: keyof typeof Transitionable
    }
  ) {
    if (!target.componentJsonID) throw new Error('[setTransition]: componentJsonID is required')
    const type = target.type ?? getTransitionableKeyForType(target.value)
    if (!type)
      throw new Error(
        `[setTransition]: Unknown transitionable type for ${target.componentJsonID} - ${target.propertyPath}`
      )
    const isType = Transitionable[type].isType(target.value)
    if (!isType)
      throw new Error(
        `[setTransition]: Invalid transitionable type for ${target.componentJsonID} - ${target.propertyPath}`
      )
    if (!hasComponent(entity, TransitionComponent)) {
      setComponent(entity, TransitionComponent)
    }
    const transitions = getComponent(entity, TransitionComponent)
    let transition = transitions.find(
      (t) => t.componentJsonID === target.componentJsonID && t.propertyPath === target.propertyPath
    )
    if (!transition) {
      const t = CreateSchemaValue(TransitionComponent.schema.properties)
      transitions.push(t)
      transition = transitions[transitions.length - 1]
      transition.componentJsonID = target.componentJsonID
      transition.propertyPath = target.propertyPath
      transition.transitionableType = type
    }
    if (target.duration && transition.duration !== target.duration) transition.duration = target.duration
    if (target.easing && transition.easing !== target.easing.path) transition.easing = target.easing.path
    if (target.type && transition.transitionableType !== type) transition.transitionableType = type
    transition.events.push({
      age: 0,
      duration: transition.duration,
      easing: transition.easing,
      toValue: target.value
    })
  },

  updateTransition(
    entity: Entity,
    transition: typeof TransitionComponent.schema.properties.static,
    deltaMilliSeconds: number,
    setProperty: boolean = true
  ) {
    if (transition.events.length === 0) return

    const Component = ComponentJSONIDMap.get(transition.componentJsonID)
    if (!Component) return
    const component = getComponent(entity, Component)
    if (!component) return
    const propertyValue = resolveObject(component, transition.propertyPath) as any as TransitionableTypes
    if (propertyValue === undefined) return

    if (transition.initialValue === undefined) {
      transition.initialValue = typeof propertyValue === 'number' ? propertyValue : propertyValue.clone()
    }

    const transitionable = Transitionable[transition.transitionableType] as Transitionable

    // Start with initial value
    let output = transition.initialValue
    let previousValue = transition.initialValue

    // Process each event as a transition stage
    for (const ev of transition.events) {
      ev.age += deltaMilliSeconds
      const timeSinceStart = ev.age

      // Apply easing function only if within duration
      if (timeSinceStart >= 0 && timeSinceStart <= ev.duration) {
        // Calculate and apply the delta
        const t = timeSinceStart / ev.duration
        const easing = Easing.fromPath(ev.easing)
        const s = easing(t)
        output = transitionable.interpolate(previousValue, ev.toValue, s)
      } else if (timeSinceStart > ev.duration) {
        // Event has fully transitioned
        output = ev.toValue
      }

      // Update previous value for next iteration
      previousValue = ev.toValue
    }

    // Remove completed events and update initial value
    transition.events = transition.events.filter((ev) => {
      if (ev.age >= ev.duration) {
        transition.initialValue = ev.toValue
        return false
      }
      return true
    })

    if (transition.events.length === 0) {
      transition.initialValue = undefined
    }

    if (setProperty) {
      if (typeof output === 'number') {
        if (transition.propertyPath) {
          // update nested component value
          const transitionPathParts = transition.propertyPath.split('/')
          const component = getComponent(entity, Component)
          const nested = resolveObject(component, transitionPathParts.slice(0, -1)) as any
          nested[transitionPathParts[transitionPathParts.length - 1]] = output
        } else {
          // non-reactive root component value update
          Component.valueMap[entity] = output
        }
      } else if ('copy' in (propertyValue as any)) {
        ;(propertyValue as any).copy(output)
      }
    }
  },

  update(entity: Entity) {
    const ecs = getState(ECSState)
    const deltaMilliseconds = ecs.deltaSeconds * 1000
    const transitions = getComponent(entity, TransitionComponent)
    for (const transition of transitions) {
      TransitionComponent.updateTransition(entity, transition, deltaMilliseconds)
    }
  }
})

/**
 * === SECTION ===
 * Entity Functions
 */

/**
 * $RemovedComponent
 * - internal to the ECS
 * - used as a component to mark an entity as existing, and it's store 'exists' is set to 0
 *       immediately upon calling removeEntity, thus we can use it for entity existence
 */
export const $RemovedComponent = defineComponent({
  name: '$RemovedComponent',
  storage: { exists: createResizableTypeArray(Uint8Array) }
})

// precalc initial few unnecessary resizes
resizeComponent($RemovedComponent, Math.pow(2, 8))

// add a delay such that we ensure any deletions never happen on the same animation frame to ensure reactors have enough time to run effects
let lastMarkedForRemoval = 0
const delay = 100 // 100ms - usually enough for a few frames on low end devices

const _markEntityForRemoval = (eid: Entity): void => {
  bitECS.addComponent(HyperFlux.store, eid, $RemovedComponent)
  $RemovedComponent.exists[eid] = 0
  // updating to now ensures we are at least <delay> time from the last mark, which ensures reactors always have enough time to run
  lastMarkedForRemoval = Date.now()
}

export const _removeMarkedEntity = (eid: Entity): void => {
  bitECS.removeComponent(HyperFlux.store, eid, $RemovedComponent)
  bitECS.removeEntity(HyperFlux.store, eid)
}

export const _removeMarkedEntities = (): void => {
  const now = Date.now()
  if (now - lastMarkedForRemoval > delay) return

  for (const eid of bitECS.query(HyperFlux.store, [$RemovedComponent]) as Entity[]) _removeMarkedEntity(eid)
}

export const $EntityRemovalSystem = defineSystem({
  uuid: '$EntityRemovalSystem',
  insert: { after: PresentationSystemGroup },
  execute: _removeMarkedEntities
})

export const createEntity = (layerID: LayerID = Layers.Simulation): Entity => {
  if (!LayerComponents[layerID]) throw new Error('createEntity: argument layerID must be a valid LayerID value')
  const entity = bitECS.addEntity(HyperFlux.store) as Entity
  if ($RemovedComponent.exists.length <= entity) {
    const nextSize = nextPowerOf2(entity + 1)
    if ($RemovedComponent.storageSize < nextSize) resizeComponent($RemovedComponent, nextSize)
  }
  $RemovedComponent.exists[entity] = 1
  setComponent(entity, LayerComponent, layerID)
  return entity
}

export const removeEntity = (entity: Entity) => {
  if (!entity || !entityExists(entity)) return ///throw new Error(`[removeEntity]: Entity ${entity} does not exist in the world`)

  const relations = LayerFunctions.getLayerRelationsEntities(entity)
  const entityLayer = LayerComponent.get(entity)
  if (relations) {
    for (const [layer, linkedEntity] of relations) {
      if (!LayerFunctions.shouldPropagate(entityLayer, layer)) continue
      removeEntity(linkedEntity)
    }
  }

  for (const component of bitECS.getEntityComponents(HyperFlux.store, entity)) {
    if (component === LayerComponent || LayerComponents.includes(component)) continue
    removeComponent(entity, component)
  }

  // always ensure layer component is removed last (it removes the specific layer component too)
  removeComponent(entity, LayerComponent)

  _markEntityForRemoval(entity)
}

export const entityExists = (entity: Entity) => {
  return $RemovedComponent.exists[entity] === 1
}

export const EntityContext = React.createContext(UndefinedEntity)

/** @deprecated entity is now passed in as a prop 'entity' to query and array child reactors */
export const useEntityContext = () => {
  return React.useContext(EntityContext)
}
