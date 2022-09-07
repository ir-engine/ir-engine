import * as bitECS from 'bitecs'

import multiLogger from '@xrengine/common/src/logger'

import { Engine } from '../classes/Engine'
import { Entity } from '../classes/Entity'

const logger = multiLogger.child({ component: 'engine:ecs:ComponentFunctions' })

const INITIAL_COMPONENT_SIZE = 1000 // TODO set to 0 after next bitECS update
bitECS.setDefaultSize(1000)

/**
 * @todo move this to engine scope
 */
export const ComponentMap = new Map<string, Component<any, any, any>>()
globalThis.ComponentMap = ComponentMap

export interface ComponentPartial<Component, Schema extends bitECS.ISchema = {}, JSON = {}> {
  name: string
  schema?: Schema
  onAdd?: (entity: Entity, json: any) => Component
  onRemove?: (entity: Entity, component: Component) => void
  toJSON?: (entity: Entity, component: Component) => JSON
}
export interface Component<ComponentType, Schema extends bitECS.ISchema = {}, JSON = {}>
  extends ComponentPartial<ComponentType, Schema, JSON> {
  onAdd: (entity: Entity, json: any) => ComponentType
  onRemove: (entity: Entity, component: ComponentType) => void
  toJSON: (entity: Entity, component: ComponentType) => JSON
  /**
   * @deprecated use `name`
   */
  _name: string // backwards-compat; to be removed
  map: Map<number, ComponentType>
}

export type SoAComponentType<S extends bitECS.ISchema> = bitECS.ComponentType<S>
export type ComponentType<C extends Component<any, any>> = NonNullable<ReturnType<C['map']['get']>>
export type SerializedComponentType<C extends Component<any, any>> = NonNullable<ReturnType<C['toJSON']>>

export const defineComponent = <ComponentType, Schema extends bitECS.ISchema = {}, JSON = ComponentType>(
  def: ComponentPartial<ComponentType, Schema, JSON>
) => {
  const Component = bitECS.defineComponent(def.schema, INITIAL_COMPONENT_SIZE) as Component<
    ComponentType,
    Schema,
    JSON
  > &
    SoAComponentType<Schema>
  Component.onAdd = (entity, json) => {
    return json
  }
  Component.onRemove = () => {}
  Component.toJSON = (entity) => {
    return undefined as any
  }
  Object.assign(Component, def)
  Component._name = Component.name // backwards-compat; to be removed
  Component.map = new Map()
  ComponentMap.set(Component.name, Component)
  return Component
}

/**
 * @deprecated use `defineComponent`
 */
export const createMappedComponent = <T = {}, S extends bitECS.ISchema = {}>(name: string, schema?: S) => {
  return defineComponent<T, S>({ name, schema })
}

export const getComponent = <T, S extends bitECS.ISchema>(
  entity: Entity,
  component: Component<T, S>,
  getRemoved = false,
  world = Engine.instance.currentWorld
): T => {
  if (typeof entity === 'undefined' || entity === null) {
    throw new Error('[getComponent]: entity is undefined')
  }
  if (typeof world === 'undefined' || world === null) {
    throw new Error('[getComponent]: world is undefined')
  }
  if (getRemoved) return component.map.get(entity)!
  if (bitECS.hasComponent(world, component, entity)) return component.map.get(entity)!
  return null!
}

/**
 * Set a component on an entity. If the component already exists, it will be overwritten.
 * Unlike calling removeComponent followed by addComponent, entry queue will not be rerun.
 *
 * @param entity
 * @param component
 * @param args
 * @param world
 *
 * @returns the component
 */
export const setComponent = <T, S extends bitECS.ISchema, J>(
  entity: Entity,
  component: Component<T, S, J>,
  args: J,
  world = Engine.instance.currentWorld
) => {
  if (typeof entity === 'undefined' || entity === null) {
    throw new Error('[setComponent]: entity is undefined')
  }
  if (typeof world === 'undefined' || world === null) {
    throw new Error('[setComponent]: world is undefined')
  }
  if (hasComponent(entity, component)) removeComponent(entity, component)
  component.map.set(entity, component.onAdd(entity, args))
  bitECS.addComponent(world, component, entity, false) // don't clear data on-add
  return component.map.get(entity)!
}

/**
 * Like `setComponent`, but throws an error if the component already exists.
 * @param entity
 * @param component
 * @param args
 * @param world
 * @returns
 */
export const addComponent = <T, S extends bitECS.ISchema, J>(
  entity: Entity,
  component: Component<T, S, J>,
  args: J,
  world = Engine.instance.currentWorld
) => {
  if (hasComponent(entity, component, world)) throw new Error(`${component.name} already exists on entity ${entity}`)
  return setComponent(entity, component, args, world)
}

export const hasComponent = <T, S extends bitECS.ISchema>(
  entity: Entity,
  component: Component<T, S>,
  world = Engine.instance.currentWorld
) => {
  if (typeof entity === 'undefined' || entity === null) {
    throw new Error('[hasComponent]: entity is undefined')
  }
  return bitECS.hasComponent(world, component, entity)
}

export const getOrAddComponent = <T, S extends bitECS.ISchema>(
  entity: Entity,
  component: Component<T, S>,
  args: T,
  getRemoved = false,
  world = Engine.instance.currentWorld
) => {
  return hasComponent(entity, component, world)
    ? getComponent(entity, component, getRemoved, world)
    : addComponent(entity, component, args, world)
}

export const removeComponent = <T, S extends bitECS.ISchema>(
  entity: Entity,
  component: Component<T, S>,
  world = Engine.instance.currentWorld
) => {
  if (typeof entity === 'undefined' || entity === null) {
    throw new Error('[removeComponent]: entity is undefined')
  }
  if (typeof world === 'undefined' || world === null) {
    throw new Error('[removeComponent]: world is undefined')
  }
  bitECS.removeComponent(world, component, entity)
  const c = component.map.get(entity)!
  c && component.onRemove(entity, c)
}

export const getAllComponents = (entity: Entity, world = Engine.instance.currentWorld): Component<any, any>[] => {
  if (!bitECS.entityExists(Engine.instance.currentWorld, entity)) return []
  return bitECS.getEntityComponents(world, entity) as Component<any, any>[]
}

export const getComponentCountOfType = <T, S extends bitECS.ISchema>(
  component: Component<T, S>,
  world = Engine.instance.currentWorld
): number => {
  const query = defineQuery([component])
  const length = query(world).length
  bitECS.removeQuery(world, query._query)
  return length
}

export const getAllComponentsOfType = <T, S extends bitECS.ISchema>(
  component: Component<T, S>,
  world = Engine.instance.currentWorld
): T[] => {
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
      removeComponent(entity, component as Component<any, any>, world)
    }
  } catch (_) {
    logger.warn('Components of entity already removed')
  }
}

export const serializeComponent = <J>(entity: Entity, Component: Component<any, any, J>) => {
  const component = getComponent(entity, Component)
  return Component.toJSON(entity, component)
}

export function defineQuery(components: (bitECS.Component | bitECS.QueryModifier)[]) {
  const query = bitECS.defineQuery([...components, bitECS.Not(EntityRemovedComponent)]) as bitECS.Query
  const enterQuery = bitECS.enterQuery(query)
  const exitQuery = bitECS.exitQuery(query)
  const wrappedQuery = (world = Engine.instance.currentWorld) => query(world) as Entity[]
  wrappedQuery.enter = (world = Engine.instance.currentWorld) => enterQuery(world) as Entity[]
  wrappedQuery.exit = (world = Engine.instance.currentWorld) => exitQuery(world) as Entity[]
  wrappedQuery._query = query
  return wrappedQuery
}

export type Query = ReturnType<typeof defineQuery>

export const EntityRemovedComponent = defineComponent({ name: 'EntityRemovedComponent' })

globalThis.XRE_getComponent = getComponent
globalThis.XRE_getAllComponents = getAllComponents
