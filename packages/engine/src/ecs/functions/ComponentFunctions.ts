import * as bitECS from 'bitecs'
import React, { startTransition, useEffect, useLayoutEffect } from 'react'

import config from '@etherealengine/common/src/config'
import { DeepReadonly } from '@etherealengine/common/src/DeepReadonly'
import multiLogger from '@etherealengine/common/src/logger'
import { HookableFunction } from '@etherealengine/common/src/utils/createHookableFunction'
import { getNestedObject } from '@etherealengine/common/src/utils/getNestedProperty'
import { useForceUpdate } from '@etherealengine/common/src/utils/useForceUpdate'
import { startReactor } from '@etherealengine/hyperflux'
import { hookstate, NO_PROXY, none, State, useHookstate } from '@etherealengine/hyperflux/functions/StateFunctions'

import { Engine } from '../classes/Engine'
import { Entity } from '../classes/Entity'
import { World } from '../classes/World'
import { EntityReactorProps, EntityReactorRoot } from './EntityFunctions'

const logger = multiLogger.child({ component: 'engine:ecs:ComponentFunctions' })

export const INITIAL_COMPONENT_SIZE = config.client.appEnv === 'test' ? 100000 : 5000 // TODO set to 0 after next bitECS update
bitECS.setDefaultSize(INITIAL_COMPONENT_SIZE)

export const ComponentMap = new Map<string, Component<any, any, any>>()
globalThis.ComponentMap = ComponentMap

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
  schema?: Schema
  onInit?: (
    this: SoAComponentType<Schema>,
    entity: Entity,
    world: World
  ) => ComponentType & OnInitValidateNotState<ComponentType>
  toJSON?: (entity: Entity, component: State<ComponentType>) => JSON
  onSet?: (entity: Entity, component: State<ComponentType>, json?: SetJSON) => void
  onRemove?: (entity: Entity, component: State<ComponentType>) => void | Promise<void>
  reactor?: React.FC<EntityReactorProps>
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
  schema?: Schema
  onInit: (
    this: SoAComponentType<Schema>,
    entity: Entity,
    world: World
  ) => ComponentType & OnInitValidateNotState<ComponentType>
  toJSON: (entity: Entity, component: State<ComponentType>) => JSON
  onSet: (entity: Entity, component: State<ComponentType>, json?: SetJSON) => void
  onRemove: (entity: Entity, component: State<ComponentType>) => void
  reactor?: HookableFunction<React.FC<EntityReactorProps>>
  reactorMap: Map<Entity, EntityReactorRoot>
  existenceMap: State<Record<Entity, boolean>>
  stateMap: Record<Entity, State<ComponentType> | undefined>
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
  Component.reactorMap = new Map()
  // We have to create an stateful existence map in order to reactively track which entities have a given component.
  // Unfortunately, we can't simply use a single shared state because hookstate will (incorrectly) invalidate other nested states when a single component
  // instance is added/removed, so each component instance has to be isolated from the others.
  Component.existenceMap = hookstate({} as Record<Entity, boolean>)
  Component.stateMap = {}
  Component.valueMap = {}
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
    onSet: (entity, component, json: any) => {
      Component.stateMap[entity]!.set(json ?? true)
    },
    toJSON: (entity, component) => component.value as any
  })
  return Component
}

export const getOptionalComponentState = <ComponentType>(
  entity: Entity,
  component: Component<ComponentType, {}, unknown>,
  world = Engine.instance.currentWorld
): State<ComponentType> | undefined => {
  // if (entity === UndefinedEntity) return undefined
  if (component.existenceMap[entity].value) return component.stateMap[entity]
  return undefined
}

export const getComponentState = <ComponentType>(
  entity: Entity,
  component: Component<ComponentType, {}, unknown>,
  world = Engine.instance.currentWorld
): State<ComponentType> => {
  const componentState = getOptionalComponentState(entity, component, world)!
  // TODO: uncomment the following after enabling es-lint no-unnecessary-condition rule
  // if (!componentState?.value) throw new Error(`[getComponent]: entity does not have ${component.name}`)
  return componentState
}

export const getOptionalComponent = <ComponentType>(
  entity: Entity,
  component: Component<ComponentType, {}, unknown>,
  world = Engine.instance.currentWorld
): ComponentType | undefined => {
  return component.valueMap[entity] as ComponentType | undefined
}

export const getComponent = <ComponentType>(
  entity: Entity,
  component: Component<ComponentType, {}, unknown>,
  world = Engine.instance.currentWorld
): ComponentType => {
  return component.valueMap[entity] as ComponentType
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
  let value = args
  if (!hasComponent(entity, Component)) {
    value = Component.onInit(entity, world) ?? args
    Component.existenceMap[entity].set(true)
    if (!Component.stateMap[entity]) Component.stateMap[entity] = hookstate(value)
    else Component.stateMap[entity]!.set(value)
    bitECS.addComponent(world, Component, entity, false) // don't clear data on-add
    if (Component.reactor) {
      if (!Component.reactor.name || Component.reactor.name === 'reactor')
        Object.defineProperty(Component.reactor, 'name', { value: `${Component.name}Reactor-${entity}` })
      const root = startReactor(Component.reactor) as EntityReactorRoot
      root.entity = entity
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
  props: Partial<SerializedComponentType<C>>,
  world = Engine.instance.currentWorld
) => {
  if (typeof props === 'undefined') return

  const comp = getComponentState(entity, Component, world)
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
  world = Engine.instance.currentWorld
) => {
  return hasComponent(entity, component, world)
    ? getComponent(entity, component, world)
    : addComponent(entity, component, args, world)
}

export const removeComponent = <C extends Component>(
  entity: Entity,
  component: C,
  world = Engine.instance.currentWorld
) => {
  if (!bitECS.entityExists(world, entity) || !bitECS.hasComponent(world, component, entity)) return
  component.onRemove(entity, component.stateMap[entity]!)
  bitECS.removeComponent(world, component, entity, false)
  component.existenceMap[entity].set(false)
  component.stateMap[entity]?.set(none)
  delete component.valueMap[entity]
  const root = component.reactorMap.get(entity)
  if (!root?.isRunning) root?.stop()
  component.reactorMap.delete(entity)
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

export type QueryComponents = (Component<any> | bitECS.QueryModifier | bitECS.Component)[]

/**
 * Use a query in a reactive context (a React component)
 */
export function useQuery(components: QueryComponents) {
  const world = Engine.instance.currentWorld

  const result = useHookstate([] as Entity[])
  const forceUpdate = useForceUpdate()

  // Use an immediate (layout) effect to ensure that `queryResult`
  // is deleted from the `reactiveQueryStates` map immediately when the current
  // component is unmounted, before any other code attempts to set it
  // (component state can't be modified after a component is unmounted)
  useLayoutEffect(() => {
    const query = defineQuery(components)
    result.set(query(world))
    const queryState = { query, result, components }
    world.reactiveQueryStates.add(queryState)
    return () => {
      removeQuery(world, query)
      world.reactiveQueryStates.delete(queryState)
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

/**
 * Use a component in a reactive context (a React component)
 */
export function useComponent<C extends Component<any>>(
  entity: Entity,
  Component: C,
  world = Engine.instance.currentWorld
) {
  const hasComponent = useHookstate(Component.existenceMap[entity]).value
  if (!hasComponent) throw new Error(`${Component.name} does not exist on entity ${entity}`)
  return useHookstate(Component.stateMap[entity]) as any as State<ComponentType<C>> // todo fix any cast
}

/**
 * Use a component in a reactive context (a React component)
 */
export function useOptionalComponent<C extends Component<any>>(
  entity: Entity,
  Component: C,
  world = Engine.instance.currentWorld
) {
  const hasComponent = useHookstate(Component.existenceMap[entity]).value
  if (!Component.stateMap[entity]) Component.stateMap[entity] = hookstate(undefined)
  const component = useHookstate(Component.stateMap[entity]) as any as State<ComponentType<C>> // todo fix any cast
  return hasComponent ? component : undefined
}

export type Query = ReturnType<typeof defineQuery>

export const EntityRemovedComponent = defineComponent({ name: 'EntityRemovedComponent' })

globalThis.XRE_getComponent = getComponent
globalThis.XRE_getAllComponents = getAllComponents
globalThis.XRE_getAllComponentData = getAllComponentData
globalThis.XRE_addComponent = addComponent
globalThis.XRE_setComponent = setComponent
globalThis.XRE_removeComponent = removeComponent

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
