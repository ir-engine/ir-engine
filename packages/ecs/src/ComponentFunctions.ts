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

All portions of the code written by the Infinite Reality Engine team are Copyright 2021-2023 
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
  NO_PROXY_STEALTH,
  ReactorRoot,
  SetPartialStateAction,
  State,
  getState,
  hookstate,
  none,
  resolveObject,
  startReactor,
  useHookstate
} from '@ir-engine/hyperflux'
import { Subscribable, subscribable } from '@hookstate/subscribable'
import { ECSState } from './ECSState'
import { Easing, EasingFunction } from './EasingFunctions'
import { Entity, UndefinedEntity } from './Entity'
import { EntityContext, entityExists, removeEntity } from './EntityFunctions'
import { defineQuery, removeQuery } from './QueryFunctions'
import { Transitionable, TransitionableTypes, getTransitionableKeyForType } from './Transitionable'
import * as bitECSLegacy from './bitecsLegacy'
import { createEntity } from './createEntity'
import { Kind, Schema, SoA, Static, Schema as TSchema, TSoASchema, TTypedSchema } from './schemas/JSONSchemaTypes'
import {
  createSchemaSoAStores,
  CreateSchemaValue,
  DeserializeSchemaValue,
  HasRequiredSchema,
  HasRequiredSchemaValues,
  HasSchemaDeserializers,
  HasSchemaValidators,
  HasValidSchemaValues,
  IsSingleValueSchema,
  SerializeSchema
} from './schemas/JSONSchemaUtils'
import { S } from './schemas/JSONSchemas'
import { error } from 'console'
import { Types } from './bitecsLegacy'

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
  ErrorTypes = never
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
  onInit?: (initial: InitializationType) => ComponentType & OnInitValidateNotState<ComponentType>
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
  reactor?: any // previously <React.FC> breaks types
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
  ErrorTypes = string
> {
  isComponent: true
  name: string
  jsonID?: string
  schema?: Schema
  onInit?: (initial: InitializationType) => ComponentType & OnInitValidateNotState<ComponentType>
  toJSON: (component: ComponentType) => JSON
  onSet: (entity: Entity, component: State<ComponentType>, json?: SetJSON) => void
  onRemove: (entity: Entity, component: State<ComponentType>) => void
  reactor?: any
  reactorMap: Map<Entity, ReactorRoot>
  stateMap: Record<Entity, State<ComponentType, Subscribable>>
  valueMap: Record<Entity, ComponentType>
  errors: ErrorTypes[]
  storageSize: number
  __ComponentType: ComponentType
}

export type SoAComponentType<S extends Schema> = S extends TSchema ? SoA<S> : unknown

/** @description Generic `type` for all Engine's ECS {@link Component}s. All of its fields are required to not be `null`. */
export type ComponentType<C extends Component> = C['__ComponentType']
/** @description Generic `type` for {@link Component}s, that takes the shape of the type returned by the its serialization function {@link Component.toJSON}. */
export type SerializedComponentType<C extends Component> = ReturnType<C['toJSON']>
/** @description Generic `type` for {@link Component}s, that takes the shape of the type returned by its {@link Component.onSet} function. */
export type SetComponentType<C extends Component> = Parameters<C['onSet']>[2]
/** @description Generic `type` for {@link Component}s, that takes the shape of the type used by its {@link Component.errors} field. */
export type ComponentErrorsType<C extends Component> =
  C['errors'][number] /** @todo What is C[...][number] doing here? */

const schemaIsJSONSchema = (schema?: ComponentSchema): schema is TSchema => {
  return !!(schema as TSchema)?.[Kind]
}

// const schemaIsECSSchema = (schema?: ComponentSchema): schema is bitECSLegacy.ISchema => {
//   return !!(schema && (schema as TSchema)[Kind] === undefined)
// }

type Primitive = string | number | bigint | boolean | undefined | symbol
export type ComponentPropertyPath<T, Prefix = ''> = {
  [K in keyof T]: T[K] extends Function // eslint-disable-line @typescript-eslint/ban-types
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
 *     id: S.SoA(Types.ui32)
 *   }),
 *   onSet: (entity, component, json) => {
 *     // side effects
 *   },
 *   onRemove: (entity, component) => {},
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
  SOAComponent = Schema extends TSchema ? SoAComponentType<Schema> : unknown
>(
  def: ComponentPartial<Schema, InitializationType, ComponentType, JSON, SetJSON, ErrorTypes> & ComponentExtras
) => {
  const Component = {} as Component<Schema, InitializationType, ComponentType, JSON, SetJSON, ErrorTypes> & {
    _TYPE: ComponentType
  } & ComponentExtras &
    SOAComponent & { setTransition: typeof setTransition }
  Component.isComponent = true

  Component.onSet = () => {}
  Component.onRemove = () => {}
  Component.toJSON = (component: ComponentType) => {
    return validateComponentSchema(def as any, component) as JSON
  }

  if (def.schema) createSchemaSoAStores(Component, def.schema)

  Component.errors = []
  Object.assign(Component, def)
  if (Component.reactor) Object.defineProperty(Component.reactor, 'name', { value: `Internal${Component.name}Reactor` })
  Component.reactorMap = new Map()
  // We have to create an stateful existence map in order to reactively track which entities have a given component.
  // Unfortunately, we can't simply use a single shared state because hookstate will (incorrectly) invalidate other nested states when a single component
  // instance is added/removed, so each component instance has to be isolated from the others.
  Component.valueMap = {}
  Component.stateMap = {}
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
    entity: Entity,
    propertyPath: P,
    value: ComponentPropertyFromPath<ComponentType, P> & TransitionableTypes,
    options: {
      duration?: number
      easing?: EasingFunction
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

export const getOptionalMutableComponent = <C extends Component>(
  entity: Entity,
  component: C
): State<ComponentType<C>, Subscribable> | undefined => {
  return !bitECS.hasComponent(HyperFlux.store, entity, component)
    ? undefined
    : (component.stateMap[entity]! as State<ComponentType<C>, Subscribable> | undefined)
}

export const getMutableComponent = <C extends Component>(
  entity: Entity,
  component: C
): State<ComponentType<C>, Subscribable> => {
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
  if (schemaIsJSONSchema(component.schema)) {
    const schema = CreateSchemaValue(entity, component.schema) as InitializationType
    if (component.onInit) return component.onInit(schema) as ComponentType
    else return schema as unknown as ComponentType
    // } else if (schemaIsECSSchema(component.schema)) {
    //   const proxy = createProxyForECSSchema(entity, component)
    //   if (component.onInit) return component.onInit(proxy)
    //   else return proxy as unknown as ComponentType
  } else if (component.onInit) return component.onInit(undefined as InitializationType) as ComponentType
  else return null as ComponentType
}

function nearestPowerOf2(n: number) {
  return 1 << (31 - Math.clz32(n))
}

function nextPowerOf2(n: number) {
  return nearestPowerOf2((n - 1) * 2)
}

const TypedArray = Object.getPrototypeOf(Uint8Array)

const resizeSoA = (arrayOrObject: any, size: number) => {
  if (arrayOrObject instanceof TypedArray == false) {
    for (const propertyName in arrayOrObject) {
      resizeSoA(arrayOrObject[propertyName], size)
    }
  } else {
    const byteLength = size * arrayOrObject.constructor.BYTES_PER_ELEMENT
    arrayOrObject.buffer.resize(byteLength)
  }
}

export const resizeComponent = (component: Component, size: number) => {
  const schema = component.schema
  if (!schemaIsECSSchema(schema)) return
  for (const propertyName in schema) {
    resizeSoA(component[propertyName], size)
  }
  component.storageSize = size
}

/**
 * @description Returns array of relations that, for each entry, contains:
 *  - Layer number at slot 0
 *  - Entity ID at slot 1
 *  @example ```ts
 *  for ([layer, linkedEntity] of getLayerRelations(entity)) { ..... }
 *  ```
 * */
function getLayerRelationsEntities(entity: Entity): [LayerID, Entity][] {
  const LayerComponent = LayerFunctions.getLayerComponent(entity)
  if (!LayerComponent) return []
  const layer = getOptionalComponent(entity, LayerComponent)
  if (!layer) return []
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
 * @description Runs the `@param linkedLayer` propagation process for the schema of the given `@param C` Component
 * @note Checking whether this process/behavior should be run or not is done with the {@link shouldPropagate} helper function.
 * */
function createLayerPropagationArgs<C extends Component>(entity: Entity, linkedLayer: LayerID, component: C) {
  if (!component.schema) return
  const componentSchema = component.schema as TTypedSchema<C>
  const layer = LayerComponent.get(entity)

  const createArgs = (schema: TTypedSchema<C>, key: string | number, data: any) => {
    const obj = key === '' ? data : data[key]
    if (obj === undefined || obj == null || obj === UndefinedEntity) return obj

    switch (schema[Kind] as any) {
      case 'Null':
      case 'Undefined':
      case 'Void':
      case 'Bool':
      case 'String':
      case 'Enum':
      case 'Literal': {
        return obj
      }
      case 'Number': {
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
      case 'Any': {
        if (typeof obj === 'object' && 'clone' in obj && typeof obj.clone === 'function') {
          return obj.clone()
        } else if (Array.isArray(obj)) {
          return [...obj] as any[]
        } else {
          return structuredClone(obj)
        }
      }
      case 'Class': {
        if ('clone' in obj && typeof obj.clone === 'function') {
          return obj.clone()
        } else {
          try {
            return structuredClone(obj)
          } catch (error) {
            throw new Error(
              `[propagateSchema]: ${entity} ${component.name} ${key} is not a cloneable class. ` + error.message
            )
          }
        }
      }
      case 'Object': {
        const props = schema.properties as any
        const args = {} as any
        for (const k in props) {
          const parsed = createArgs(props[k], k, obj)
          args[k] = parsed
        }
        return args
      }
      case 'Record': {
        const { key, value } = schema.properties as { key: any; value: any }
        const args = {} as any
        for (const k in obj) {
          const parsed = createArgs(value, k, obj)
          args[k] = parsed
        }
        return args
      }
      case 'Array': {
        const props = schema.properties as any
        const args = [] as any[]
        for (let i = 0; i < obj.length; i++) {
          const parsed = createArgs(props, i, obj)
          args[i] = parsed
        }
        return args
      }
      case 'Tuple': {
        const props = schema.properties as any
        const args = [] as any[]
        for (let i = 0; i < props.length; i++) {
          const parsed = createArgs(props[i], i, obj)
          args[i] = parsed
        }
        return args
      }
      case 'Union': {
        const props = schema.properties as any
        for (const prop of props) {
          const parsed = createArgs(prop, '', obj)
          if (parsed) return parsed
        }
        return null
      }
      default: {
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
        return createArgs(props, '', obj)
      }
    }
  }

  return createArgs(componentSchema, '', getComponent(entity, component))
}

/**
 * @description
 * Runs the `@param linkedLayer` propagation process for the given `@param entity`/`@param component` pair
 * It will also trigger Schema propagation when `@param component`.schema is truthy.
 *
 * @note Checking whether this process/behavior should be run or not is done with the {@link shouldPropagate} helper function.
 * */
function propagateLayer<C extends Component>(entity: Entity, component: C) {
  if ((component as any) === LayerComponent || LayerComponents.includes(component as any)) return
  const entityLayer = LayerComponent.get(entity)
  for (const [linkedLayer, linkedEntity] of LayerFunctions.getLayerRelationsEntities(entity)) {
    if (!hasComponent(entity, component)) {
      removeComponent(linkedEntity, component)
      continue
    }
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
  shouldPropagate,
  createLayerPropagationArgs,
  propagateLayer
}

const _getComponentState = <C extends Component>(entity: Entity, component: C) => {
  if (!component.stateMap[entity]) {
    component.stateMap[entity] = hookstate(none, subscribable())
    // component.stateMap[entity].subscribe(() => {
    //   component.valueMap[entity] = component.stateMap[entity].get(NO_PROXY_STEALTH)
    //   LayerFunctions.propagateLayer(entity, component)
    // })
  }
  return component.stateMap[entity]
}

/**
 * @todo we used to have some of the conditionals here cached scoped inside onSet,
 * but now that it is it's own function we may want to precompute and cache these again
 */
const _mergeComponentState = <C extends Component>(
  entity: Entity,
  component: C,
  args: SetComponentType<C> | undefined = undefined
) => {
  const componentState = component.stateMap[entity]

  if (schemaIsJSONSchema(component.schema)) {
    if (HasRequiredSchema(component.schema)) {
      const [valid, key] = HasRequiredSchemaValues(component.schema, args)
      if (!valid) throw new Error(`${component.name}:OnSet Missing required value for key ${key}`)
    }

    if (args === null || args === undefined) return

    const cleanJson = DeserializeSchemaValue(component.schema, componentState.get(NO_PROXY_STEALTH), args)

    if (cleanJson === null || cleanJson === undefined) return

    if (HasSchemaValidators(component.schema)) {
      const [valid, key] = HasValidSchemaValues(
        component.schema,
        cleanJson,
        componentState.get(NO_PROXY_STEALTH),
        entity
      )
      if (!valid) throw new Error(`${component.name}:OnSet Invalid value for key ${key} ${JSON.stringify(args)}`)
    }

    if (Array.isArray(cleanJson) || typeof cleanJson !== 'object' || IsSingleValueSchema(component.schema))
      componentState.set(cleanJson)
    else if (cleanJson) {
      for (const key of Object.keys(cleanJson)) {
        componentState[key].set((_) => cleanJson?.[key])
      }
    } else {
      componentState.set(cleanJson as any)
    }

    return
  }

  // if (args === null || args === undefined) return

  // // if no schema, just set the json - assume insecure or internal
  // if (Array.isArray(args) || typeof args !== 'object' || IsSingleValueSchema(component.schema)) componentState.set(args)
  // else _mergeStateValuesDeep(componentState, args)
}

// const _mergeStateValuesDeep = (target: State<any>, source: any) => {
//   console.log({target, source})
//   if (typeof source !== 'object') {
//     target.set(source)
//     return
//   }
//   for (const key in target) {
//     if (typeof source[key] === 'object') {
//       if (source[key] === null) {
//         target[key].set(null)
//         return
//       }
//       if (Array.isArray(source[key])) {
//         target[key].set([...source[key]]) // clone array deeply rather than reference
//         return
//       }
//       _mergeStateValuesDeep(target[key], source[key]) // recurse objects
//     }
//   }
// }

/**
 * @description
 * Assigns the given component to the given entity, and returns the component.
 * @notes
 * - If the component already exists, it will be overwritten.
 * - Unlike calling {@link removeComponent} followed by {@link addComponent}, the entry queue will not be rerun.
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
  if (!bitECS.entityExists(HyperFlux.store, entity)) {
    throw new Error('[setComponent]: entity does not exist')
  }

  if (schemaIsECSSchema(component.schema)) {
    const nextSize = nextPowerOf2(entity + 1)
    if (component.storageSize < nextSize) resizeComponent(component, nextSize)
  }

  const state = _getComponentState(entity, component)

  if (!hasComponent(entity, component)) {
    state.set(createInitialComponentValue(entity, component))
    bitECS.addComponent(HyperFlux.store, entity, component)
    // TODO; can remove when hookstate subscription is working
    component.valueMap[entity] = component.stateMap[entity].get(NO_PROXY_STEALTH)
  }

  _mergeComponentState(entity, component, args)
  component.onSet(entity, state, args)

  // TODO; can remove when hookstate subscription is working
  component.valueMap[entity] = component.stateMap[entity].get(NO_PROXY_STEALTH)
  LayerFunctions.propagateLayer(entity, component)

  if (component.reactor && !component.reactorMap.has(entity) && LayerComponent.get(entity) === Layers.Simulation) {
    const root = startReactor(() => {
      return React.createElement(EntityContext.Provider, { value: entity }, React.createElement(component.reactor, {}))
    }) as ReactorRoot
    root['entity'] = entity
    root['component'] = component.name
    component.reactorMap.set(entity, root)
    root.run()
  }

  const root = component.reactorMap.get(entity)
  root?.run()
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
    const exists = !!useOptionalComponent(entity, component)
    if (!exists) hasAllComponents = false
  }

  return hasAllComponents
}

export const removeComponent = <C extends Component>(entity: Entity, component: C) => {
  if (!hasComponent(entity, component)) return

  const entityLayer = LayerComponent.get(entity)
  for (const [layer, linkedEntity] of LayerFunctions.getLayerRelationsEntities(entity)) {
    if (!LayerFunctions.shouldPropagate(entityLayer, layer)) continue
    removeComponent(linkedEntity, component)
  }

  component.onRemove(entity, component.stateMap[entity]!)
  bitECS.removeComponent(HyperFlux.store, entity, component)
  const root = component.reactorMap.get(entity)
  component.reactorMap.delete(entity)
  if (root?.isRunning) root.stop()
  /** clear state data after reactor stops, to ensure hookstate is still referenceable */
  component.stateMap[entity]?.set(none)
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
  if (!bitECS.entityExists(HyperFlux.store, entity)) return []
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

export const serializeComponent = <C extends Component>(entity: Entity, Component: C) => {
  const component = getComponent(entity, Component)
  return JSON.parse(JSON.stringify(Component.toJSON(component))) as ReturnType<C['toJSON']>
}

// If we want to add more validation logic (ie. schema migrations), decouple this function from Component.toJSON first
export const validateComponentSchema = <C extends Component>(Component: C, data: ComponentType<C>) => {
  if (schemaIsJSONSchema(Component.schema)) {
    return SerializeSchema(Component.schema, data)
  }

  return data
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
export function useComponent<C extends Component>(entity: Entity, component: C): State<ComponentType<C>, Subscribable> {
  if (entity === UndefinedEntity) throw new Error('InvalidUsage: useComponent called with UndefinedEntity')

  const state = _getComponentState(entity, component)

  // use() will suspend the component (by throwing a promise) and resume when the promise is resolved
  if (state.promise) {
    ;(React.use ?? _use)(state.promise)
  }

  return useHookstate(state) as State<ComponentType<C>, Subscribable>
}

/**
 * Use a component in a reactive context (a React component)
 */
export function useOptionalComponent<C extends Component>(
  entity: Entity,
  component: C
): State<ComponentType<C>, Subscribable> | undefined {
  const componentState = useHookstate(_getComponentState(entity, component)) as State<ComponentType<C>, Subscribable>
  return componentState.promised ? undefined : componentState
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
      relations: S.Record(S.Enum(Layers), S.Entity())
    }),

    // backward references
    refs: {} as Record<Entity, Entity>,

    onSet: (entity, _component) => {
      for (const [linkedLayer, relation] of LayerFunctions.getLayerRelationsTypes(layer)) {
        if (relation === LayerRelationTypes.Propagate) {
          const linkedEntity = createEntity(linkedLayer as LayerID)
          getMutableComponent(entity, LayerComponents[layer]).relations[linkedLayer].set(linkedEntity)
          LayerComponents[linkedLayer].refs[linkedEntity] = entity
        }
      }
    },

    onRemove(entity, _component) {
      for (const [linkedLayer, relation] of LayerFunctions.getLayerRelationsTypes(layer)) {
        if (relation === LayerRelationTypes.Propagate) {
          const relation = getComponent(entity, LayerComponents[layer]).relations[linkedLayer]
          removeEntity(relation)
          delete LayerComponents[linkedLayer].refs[relation]
        }
      }
    }
  })
})

export const SimulationLayerComponent = LayerComponents[Layers.Simulation]

export const LayerComponent = defineComponent({
  name: 'LayerComponent',

  schema: S.Object({
    somethingElse: S.Bool(),
    layer: S.SoA(Types.ui8)
  }),

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

export const getAuthoringCounterpart = (entity: Entity) => {
  return LayerComponents[Layers.Authoring].refs[entity]
}

export const TransitionComponent = defineComponent({
  name: 'TransitionComponent',

  jsonID: 'IR_transition',

  schema: S.Array(
    S.Object({
      componentJsonID: S.String(),
      propertyPath: S.String(),
      transitionableType: S.String(),
      duration: S.Number(500),
      easing: S.String(Easing.exponential.inOut.path),
      initialValue: S.NonSerialized(S.Type<TransitionableTypes>()),
      outputValue: S.NonSerialized(S.Type<TransitionableTypes>()),
      events: S.NonSerialized(
        S.Array(
          S.Object({
            age: S.Number(),
            fromValue: S.Type<TransitionableTypes>(),
            toValue: S.Type<TransitionableTypes>(),
            duration: S.Number(),
            easing: S.String()
          })
        )
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
      const t = CreateSchemaValue(entity, TransitionComponent.schema.properties)
      transitions.push(t)
      transition = transitions[transitions.length - 1]
      transition.componentJsonID = target.componentJsonID
      transition.propertyPath = target.propertyPath
      transition.transitionableType = type
    }
    if (target.duration && transition.duration !== target.duration) transition.duration = target.duration
    if (target.easing && transition.easing !== target.easing.path) transition.easing = target.easing.path
    if (target.type && transition.transitionableType !== type) transition.transitionableType = type
    TransitionComponent.updateTransition(entity, transition, 0, false)
    transition.events.push({
      age: 0,
      duration: transition.duration,
      easing: transition.easing,
      fromValue: transition.outputValue,
      toValue: target.value
    })
  },

  updateTransition(
    entity: Entity,
    transition: typeof TransitionComponent.schema.properties.static,
    deltaMilliSeconds: number,
    setProperty: boolean = true
  ) {
    const Component = ComponentJSONIDMap.get(transition.componentJsonID)
    if (!Component) return
    const component = getComponent(entity, Component)
    if (!component) return
    const propertyValue = resolveObject(component, transition.propertyPath) as any as TransitionableTypes
    if (propertyValue === undefined) return

    if (transition.initialValue === undefined) {
      transition.initialValue = typeof propertyValue === 'number' ? propertyValue : propertyValue.clone()
    }

    if (transition.events.length === 0) {
      transition.outputValue = transition.initialValue
      return
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

    transition.outputValue = output

    if (setProperty) {
      if (typeof output === 'number') {
        const mutableComponent = getMutableComponent(entity, Component)
        const mutableProperty = resolveObject(mutableComponent, transition.propertyPath as any) as any
        mutableProperty.set(output)
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
