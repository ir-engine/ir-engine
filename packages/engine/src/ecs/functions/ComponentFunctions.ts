import * as bitECS from 'bitecs'

import { DeepReadonly } from '@xrengine/common/src/DeepReadonly'
import multiLogger from '@xrengine/common/src/logger'
import { getNestedObject } from '@xrengine/common/src/utils/getNestedProperty'

import { Engine } from '../classes/Engine'
import { Entity } from '../classes/Entity'
import { World } from '../classes/World'

const logger = multiLogger.child({ component: 'engine:ecs:ComponentFunctions' })

const INITIAL_COMPONENT_SIZE = process.env['APP_ENV'] === 'test' ? 100000 : 1000 // TODO set to 0 after next bitECS update
bitECS.setDefaultSize(INITIAL_COMPONENT_SIZE)

/**
 * @todo move this to engine scope
 */
export const ComponentMap = new Map<string, Component<unknown, unknown, unknown>>()
globalThis.ComponentMap = ComponentMap

export interface ComponentPartial<ComponentType = unknown, Schema = unknown, JSON = unknown> {
  name: string
  schema?: Schema
  isTag?: boolean
  onAdd?: (entity: Entity) => ComponentType
  toJSON?: (entity: Entity, component: ComponentType) => JSON
  onUpdate?: (entity: Entity, component: ComponentType, json: DeepReadonly<Partial<JSON>>) => void
  onRemove?: (entity: Entity, component: ComponentType) => void
}
export interface Component<ComponentType = unknown, Schema = unknown, JSON = unknown>
  extends ComponentPartial<ComponentType, Schema, JSON> {
  onAdd: (entity: Entity) => ComponentType
  toJSON: (entity: Entity, component: ComponentType) => JSON
  onUpdate: (entity: Entity, component: ComponentType, json: DeepReadonly<Partial<JSON>>) => void
  onRemove: (entity: Entity, component: ComponentType) => void
  /**
   * @deprecated use `name`
   */
  _name: string // backwards-compat; to be removed
  map: Map<number, ComponentType>
}

export type SoAComponentType<S extends bitECS.ISchema> = bitECS.ComponentType<S>
export type ComponentType<C extends Component> = NonNullable<ReturnType<C['map']['get']>>
export type SerializedComponentType<C extends Component> = ReturnType<C['toJSON']>

export const defineComponent = <ComponentType, Schema extends bitECS.ISchema = {}, JSON = unknown>(
  def: ComponentPartial<ComponentType, Schema, JSON>
) => {
  const Component = bitECS.defineComponent(def.schema, INITIAL_COMPONENT_SIZE) as Component<
    ComponentType,
    Schema,
    JSON
  > &
    SoAComponentType<Schema>
  Component.onAdd = (entity) => {
    return {} as any
  }
  Component.onUpdate = (entity, component, json) => {}
  Component.onRemove = () => {}
  Component.toJSON = (entity) => {
    return undefined as any
  }
  Object.assign(Component, def)
  Component._name = Component.name // backwards-compat; to be removed
  if (!def.isTag) Component.map = new Map()
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
  const Component = defineComponent<ComponentType, Schema, ComponentType>({ name, schema })
  Component.onUpdate = (entity, component, json) => {
    Component.map!.set(entity, json as any)
  }
  return Component
}

export const getComponent = <ComponentType>(
  entity: Entity,
  component: Component<ComponentType, unknown, unknown>,
  getRemoved = false,
  world = Engine.instance.currentWorld
): ComponentType => {
  if (typeof entity === 'undefined' || entity === null) {
    throw new Error('[getComponent]: entity is undefined')
  }
  if (typeof world === 'undefined' || world === null) {
    throw new Error('[getComponent]: world is undefined')
  }
  if (!component.map) {
    throw new Error('[getComponent]: tag components have no data')
  }
  if (getRemoved) return component.map?.get(entity)!
  if (bitECS.hasComponent(world, component, entity)) return component.map?.get(entity)!
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
export const setComponent = <C extends Component>(
  entity: Entity,
  component: C,
  args: SerializedComponentType<C>,
  world = Engine.instance.currentWorld
) => {
  if (typeof entity === 'undefined' || entity === null) {
    throw new Error('[setComponent]: entity is undefined')
  }
  if (typeof world === 'undefined' || world === null) {
    throw new Error('[setComponent]: world is undefined')
  }
  if (!hasComponent(entity, component)) {
    const c = component.onAdd(entity)
    component.map?.set(entity, c)
    bitECS.addComponent(world, component, entity, false) // don't clear data on-add
  }
  const c = component.map?.get(entity)! as ComponentType<C>
  component.onUpdate(entity, c, args as Readonly<SerializedComponentType<C>>)
  return component.map?.get(entity)! as ComponentType<C>
}

/**
 * Experimental API
 */
export const updateComponent = <C extends Component>(
  entity: Entity,
  component: C,
  props: Partial<SerializedComponentType<C>>,
  world = Engine.instance.currentWorld
) => {
  const comp = getComponent(entity, component)

  if (!comp) {
    throw new Error('[updateComponent]: component does not exist')
  }

  for (const propertyName of Object.keys(props as any)) {
    const value = props[propertyName]
    const { result, finalProp } = getNestedObject(comp, propertyName)

    if (value && value.copy) {
      if (!result[finalProp]) result[finalProp] = new value.constructor()
      result[finalProp].copy(value)
    } else if (
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

/**
 * Like `setComponent`, but throws an error if the component already exists.
 * @param entity
 * @param component
 * @param args
 * @param world
 * @returns
 */
export const addComponent = <C extends Component>(
  entity: Entity,
  component: C,
  args: SerializedComponentType<C>,
  world = Engine.instance.currentWorld
) => {
  if (hasComponent(entity, component, world)) throw new Error(`${component.name} already exists on entity ${entity}`)
  return setComponent(entity, component, args, world)
}

export const hasComponent = <T, S, J>(
  entity: Entity,
  component: Component<T, S, J>,
  world = Engine.instance.currentWorld
) => {
  if (typeof entity === 'undefined' || entity === null) {
    throw new Error('[hasComponent]: entity is undefined')
  }
  return bitECS.hasComponent(world, component, entity)
}

export const getOrAddComponent = <T, S, J>(
  entity: Entity,
  component: Component<T, S, J>,
  args: J,
  getRemoved = false,
  world = Engine.instance.currentWorld
) => {
  return hasComponent(entity, component, world)
    ? getComponent(entity, component, getRemoved, world)
    : addComponent(entity, component, args, world)
}

export const removeComponent = <T, S, J>(
  entity: Entity,
  component: Component<T, S, J>,
  world = Engine.instance.currentWorld
) => {
  if (typeof entity === 'undefined' || entity === null) {
    throw new Error('[removeComponent]: entity is undefined')
  }
  if (typeof world === 'undefined' || world === null) {
    throw new Error('[removeComponent]: world is undefined')
  }
  bitECS.removeComponent(world, component, entity, false)
  if (component.map?.has(entity)) component.onRemove(entity, component.map.get(entity)!)
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

export const serializeComponent = <J>(entity: Entity, Component: Component<unknown, unknown, J>) => {
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
  wrappedQuery._enterQuery = enterQuery
  wrappedQuery._exitQuery = exitQuery
  return wrappedQuery
}

export function removeQuery(world: World, query: ReturnType<typeof defineQuery>) {
  bitECS.removeQuery(world, query._query)
  bitECS.removeQuery(world, query._enterQuery)
  bitECS.removeQuery(world, query._exitQuery)
}

export type Query = ReturnType<typeof defineQuery>

export const EntityRemovedComponent = defineComponent({ name: 'EntityRemovedComponent' })

globalThis.XRE_getComponent = getComponent
globalThis.XRE_getAllComponents = getAllComponents
globalThis.XRE_getAllComponentData = getAllComponentData
globalThis.XRE_addComponent = addComponent
globalThis.XRE_setComponent = setComponent
globalThis.XRE_removeComponent = removeComponent
