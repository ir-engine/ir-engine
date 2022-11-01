import * as bitECS from 'bitecs'
import { FC, startTransition, useEffect } from 'react'

import config from '@xrengine/common/src/config'
import { DeepReadonly } from '@xrengine/common/src/DeepReadonly'
import multiLogger from '@xrengine/common/src/logger'
import { HookableFunction } from '@xrengine/common/src/utils/createHookableFunction'
import { getNestedObject } from '@xrengine/common/src/utils/getNestedProperty'
import { createReactor } from '@xrengine/hyperflux'
import {
  createState,
  NO_PROXY,
  none,
  State,
  StateMethods,
  useHookstate
} from '@xrengine/hyperflux/functions/StateFunctions'

import { Engine } from '../classes/Engine'
import { Entity, UndefinedEntity } from '../classes/Entity'
import { World } from '../classes/World'
import { createEntityReactorWrapper, EntityReactorProps, EntityReactorRoot } from './EntityFunctions'

const logger = multiLogger.child({ component: 'engine:ecs:ComponentFunctions' })

const INITIAL_COMPONENT_SIZE = config.client.appEnv === 'test' ? 100000 : 1000 // TODO set to 0 after next bitECS update
bitECS.setDefaultSize(INITIAL_COMPONENT_SIZE)

/**
 * @todo move this to engine scope
 */
export const ComponentMap = new Map<string, Component<any, any, any>>()
globalThis.ComponentMap = ComponentMap

type PartialIfObject<T> = T extends object ? Partial<T> : T

type OnInitValidateNotState<T> = T extends StateMethods<any, {}> ? 'onAdd must not return a State object' : T

type SomeStringLiteral = 'a' | 'b' | 'c' // just a dummy string literal union
type StringLiteral<T> = string extends T ? SomeStringLiteral : string

export interface ComponentPartial<
  ComponentType = any,
  Schema = unknown,
  JSON = ComponentType,
  SetJSON = PartialIfObject<DeepReadonly<JSON>>,
  ErrorTypes = never
> {
  name: string
  schema?: Schema
  onInit?: (entity: Entity, world: World) => ComponentType & OnInitValidateNotState<ComponentType>
  toJSON?: (entity: Entity, component: State<ComponentType>) => JSON
  onSet?: (entity: Entity, component: State<ComponentType>, json?: SetJSON) => void
  onRemove?: (entity: Entity, component: State<ComponentType>) => void | Promise<void>
  reactor?: React.FC<EntityReactorProps>
  errors?: ErrorTypes[]
}
export interface Component<
  ComponentType = any,
  Schema = unknown,
  JSON = ComponentType,
  SetJSON = PartialIfObject<DeepReadonly<JSON>>,
  ErrorTypes = string
> {
  name: string
  schema?: Schema
  onInit: (entity: Entity, world: World) => ComponentType & OnInitValidateNotState<ComponentType>
  toJSON: (entity: Entity, component: State<ComponentType>) => JSON
  onSet: (entity: Entity, component: State<ComponentType>, json?: SetJSON) => void
  onRemove: (entity: Entity, component: State<ComponentType>) => void
  reactor?: HookableFunction<React.FC<EntityReactorProps>>
  reactorRoots: Map<Entity, EntityReactorRoot>
  map: StateMethods<Record<Entity, ComponentType>>
  errors: ErrorTypes[]
}

export type SoAComponentType<S extends bitECS.ISchema> = bitECS.ComponentType<S>
export type ComponentType<C extends Component> = NonNullable<C['map']['value'][keyof C['map']['value']]>
export type SerializedComponentType<C extends Component> = ReturnType<C['toJSON']>
export type SetComponentType<C extends Component> = Parameters<C['onSet']>[2]
export type ComponentErrorsType<C extends Component> = C['errors'][number]

export const defineComponent = <
  ComponentType = true,
  Schema extends bitECS.ISchema = any,
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
  Component.onInit = (entity) => true as any
  Component.onSet = (entity, component, json) => {}
  Component.onRemove = () => {}
  Component.toJSON = (entity, component) => component.value as any
  Component.errors = []
  Object.assign(Component, def)
  Component.reactorRoots = new Map()
  Component.map = createState({} as Record<Entity, ComponentType>)
  ComponentMap.set(Component.name, Component)
  return Component
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
    onSet: (entity, component, json) => {
      Component.map[entity].set(json ?? true)
    }
  })
  return Component
}

export const getOptionalComponentState = <ComponentType>(
  entity: Entity,
  component: Component<ComponentType, unknown, unknown>,
  getRemoved = false,
  world = Engine.instance.currentWorld
): State<ComponentType> | undefined => {
  if (entity === UndefinedEntity) return undefined
  if (getRemoved) return component.map[entity]
  if (bitECS.hasComponent(world, component, entity)) return component.map[entity]
  return undefined
}

export const getComponentState = <ComponentType>(
  entity: Entity,
  component: Component<ComponentType, unknown, unknown>,
  getRemoved = false,
  world = Engine.instance.currentWorld
): State<ComponentType> => {
  const componentState = getOptionalComponentState(entity, component, getRemoved, world)!
  // TODO: uncomment the following after enabling es-lint no-unnecessary-condition rule
  if (!componentState?.value) throw new Error(`[getComponent]: entity does not have ${component.name}`)
  return componentState
}

export const getOptionalComponent = <ComponentType>(
  entity: Entity,
  component: Component<ComponentType, unknown, unknown>,
  getRemoved = false,
  world = Engine.instance.currentWorld
): ComponentType | undefined => {
  return getOptionalComponentState(entity, component, getRemoved, world)?.get(NO_PROXY) as ComponentType | undefined
}

export const getComponent = <ComponentType>(
  entity: Entity,
  component: Component<ComponentType, unknown, unknown>,
  getRemoved = false,
  world = Engine.instance.currentWorld
): ComponentType => {
  return getComponentState(entity, component, getRemoved, world).get(NO_PROXY)
}

/**
 * Set a component on an entity. If the component already exists, it will be overwritten.
 * Unlike calling removeComponent followed by addComponent, entry queue will not be rerun.
 *
 * @param entity
 * @param Component
 * @param args
 * @param world
 *
 * @returns the component
 */
export const setComponent = <C extends Component>(
  entity: Entity,
  Component: C,
  args: SetComponentType<C> | undefined = undefined,
  world = Engine.instance.currentWorld
) => {
  if (!entity) {
    throw new Error('[setComponent]: entity is undefined')
  }
  if (!world) {
    throw new Error('[setComponent]: world is undefined')
  }
  if (!bitECS.entityExists(world, entity)) {
    throw new Error('[setComponent]: entity does not exist')
  }
  if (!hasComponent(entity, Component)) {
    const c = Component.onInit(entity, world)
    Component.map[entity].set(c)
    bitECS.addComponent(world, Component, entity, false) // don't clear data on-add
    if (Component.reactor) {
      const root = createReactor(createEntityReactorWrapper(Component, Component.reactor)) as EntityReactorRoot
      root.entity = entity
      Component.reactorRoots.set(entity, root)
    }
  }
  startTransition(() => {
    Component.onSet(entity, Component.map[entity], args as Readonly<SerializedComponentType<C>>)
    const root = Component.reactorRoots.get(entity)
    if (!root?.isRunning) root?.run()
  })
}

/**
 * Experimental API
 */
export const updateComponent = <C extends Component>(
  entity: Entity,
  Component: C,
  props: Partial<SerializedComponentType<C>>,
  world = Engine.instance.currentWorld
) => {
  const comp = getComponentState(entity, Component)
  if (!comp) {
    throw new Error('[updateComponent]: component does not exist')
  }

  startTransition(() => {
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
    const root = Component.reactorRoots.get(entity)
    if (!root?.isRunning) root?.run()
  })
}

/**
 * Like `setComponent`, but throws an error if the component already exists.
 * @param entity
 * @param Component
 * @param args
 * @param world
 * @returns
 */
export const addComponent = <C extends Component>(
  entity: Entity,
  Component: C,
  args: SetComponentType<C> | undefined = undefined,
  world = Engine.instance.currentWorld
) => {
  if (hasComponent(entity, Component, world)) throw new Error(`${Component.name} already exists on entity ${entity}`)
  setComponent(entity, Component, args, world)
}

export const hasComponent = <C extends Component>(
  entity: Entity,
  component: C,
  world = Engine.instance.currentWorld
) => {
  return bitECS.hasComponent(world, component, entity)
}

export const getOrAddComponent = <C extends Component>(
  entity: Entity,
  component: C,
  args?: SetComponentType<C>,
  getRemoved = false,
  world = Engine.instance.currentWorld
) => {
  return hasComponent(entity, component, world)
    ? getComponent(entity, component, getRemoved, world)
    : addComponent(entity, component, args, world)
}

export const removeComponent = <C extends Component>(
  entity: Entity,
  component: C,
  world = Engine.instance.currentWorld
) => {
  if (!bitECS.entityExists(world, entity)) return
  if (bitECS.hasComponent(world, component, entity)) component.onRemove(entity, component.map[entity])
  // component.map[entity].set(none)
  bitECS.removeComponent(world, component, entity, false)
  const root = component.reactorRoots.get(entity)
  if (!root?.isRunning) root?.stop()
  component.reactorRoots.delete(entity)
}

export const getAllComponents = (entity: Entity, world = Engine.instance.currentWorld): Component[] => {
  if (!bitECS.entityExists(Engine.instance.currentWorld, entity)) return []
  return bitECS.getEntityComponents(world, entity) as Component[]
}

export const getAllComponentData = (
  entity: Entity,
  world = Engine.instance.currentWorld
): { [name: string]: ComponentType<any> } => {
  return Object.fromEntries(getAllComponents(entity, world).map((C) => [C.name, getComponent(entity, C)]))
}

export const getComponentCountOfType = <C extends Component>(
  component: C,
  world = Engine.instance.currentWorld
): number => {
  const query = defineQuery([component])
  const length = query(world).length
  bitECS.removeQuery(world, query._query)
  return length
}

export const getAllComponentsOfType = <C extends Component<any>>(
  component: C,
  world = Engine.instance.currentWorld
): ComponentType<C>[] => {
  const query = defineQuery([component])
  const entities = query(world)
  bitECS.removeQuery(world, query._query)
  return entities.map((e) => {
    return getComponent(e, component)!
  })
}

export const removeAllComponents = (entity: Entity, world = Engine.instance.currentWorld) => {
  try {
    for (const component of bitECS.getEntityComponents(world, entity)) {
      removeComponent(entity, component as Component, world)
    }
  } catch (_) {
    logger.warn('Components of entity already removed')
  }
}

export const serializeComponent = <C extends Component<any, any, any>>(entity: Entity, Component: C) => {
  const component = getComponentState(entity, Component)
  return Component.toJSON(entity, component) as ReturnType<C['toJSON']>
}

export function defineQuery(components: (bitECS.Component | bitECS.QueryModifier)[]) {
  const query = bitECS.defineQuery([...components, bitECS.Not(EntityRemovedComponent)]) as bitECS.Query
  const enterQuery = bitECS.enterQuery(query)
  const exitQuery = bitECS.exitQuery(query)
  const wrappedQuery = (world = Engine.instance.currentWorld) => query(world) as Entity[]
  wrappedQuery.enter = (world = Engine.instance.currentWorld) => enterQuery(world) as Entity[]
  wrappedQuery.exit = (world = Engine.instance.currentWorld) => exitQuery(world) as Entity[]
  wrappedQuery._query = query
  wrappedQuery._enterQuery = enterQuery
  wrappedQuery._exitQuery = exitQuery
  return wrappedQuery
}

export function removeQuery(world: World, query: ReturnType<typeof defineQuery>) {
  bitECS.removeQuery(world, query._query)
  bitECS.removeQuery(world, query._enterQuery)
  bitECS.removeQuery(world, query._exitQuery)
}

/**
 * Use a query in a reactive context (a React component)
 */
export function useQuery(query: Query, world = Engine.instance.currentWorld) {
  const state = useHookstate([] as Entity[])
  useEffect(() => {
    state.set(query(world))
    const queryState = { query, state }
    world.reactiveQueryStates.add(queryState)
    return () => {
      removeQuery(world, query)
      world.reactiveQueryStates.delete(queryState)
    }
  }, [query, world])
  return state.value
}

/**
 * Use a component in a reactive context (a React component)
 */
export function useComponent<C extends Component<any>>(
  entity: Entity,
  Component: C,
  allowRemoved = false,
  world = Engine.instance.currentWorld
) {
  const component = useHookstate(Component.map[entity]) as State<ComponentType<C>>
  const hasOrAllowRemoved = allowRemoved || hasComponent(entity, Component, world)
  if (!hasOrAllowRemoved) throw new Error(`${Component.name} does not exist on entity ${entity}`)
  return component
}

/**
 * Use a component in a reactive context (a React component)
 */
export function useOptionalComponent<C extends Component<any>>(
  entity: Entity,
  Component: C,
  allowRemoved = false,
  world = Engine.instance.currentWorld
) {
  const component = useHookstate(Component.map[entity]) as State<ComponentType<C>>
  const hasOrAllowRemoved = allowRemoved || hasComponent(entity, Component, world)
  return hasOrAllowRemoved ? component : undefined
}

export type Query = ReturnType<typeof defineQuery>

export const EntityRemovedComponent = defineComponent({ name: 'EntityRemovedComponent' })

globalThis.XRE_getComponent = getComponent
globalThis.XRE_getAllComponents = getAllComponents
globalThis.XRE_getAllComponentData = getAllComponentData
globalThis.XRE_addComponent = addComponent
globalThis.XRE_setComponent = setComponent
globalThis.XRE_removeComponent = removeComponent
