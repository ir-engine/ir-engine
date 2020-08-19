import { Component, ComponentConstructor } from "../classes/Component"
import { Entity } from "../classes/Entity"
import { Query } from "../classes/Query"
import { Engine } from "../classes/Engine"
import { wrapImmutableComponent, registerComponent } from "./ComponentFunctions"
import { ObjectPool } from "../classes/ObjectPool"
import { SystemStateComponent } from "../classes/SystemStateComponent"

const ENTITY_CREATED = "EntityManager#ENTITY_CREATE"
const ENTITY_REMOVED = "EntityManager#ENTITY_REMOVED"
const COMPONENT_ADDED = "EntityManager#COMPONENT_ADDED"
const COMPONENT_REMOVE = "EntityManager#COMPONENT_REMOVE"

export function getMutableComponent<C extends Component<any>>(
  entity: Entity,
  Component: ComponentConstructor<C> | any
): C {
  const component = entity.components[Component._typeId]

  if (!component) {
    return
  }

  for (let i = 0; i < entity.queries.length; i++) {
    const query = entity.queries[i]

    if (query.reactive && query.components.indexOf(Component) !== -1) {
      query.eventDispatcher.dispatchEvent(Query.prototype.COMPONENT_CHANGED, entity, component)
    }
  }
  return <C>component
}

export function getRemovedComponent<C extends Component<any>>(
  entity: Entity,
  Component: ComponentConstructor<C>
): Readonly<C> {
  const component = entity.componentsToRemove[Component._typeId]

  return <C>(process.env.NODE_ENV !== "production" ? wrapImmutableComponent<Component<C>>(component) : component)
}

export function getComponents(entity: Entity): { [componentName: string]: ComponentConstructor<any> } {
  return entity.components
}

export function getComponentsToRemove(entity: Entity): { [componentName: string]: ComponentConstructor<any> } {
  return entity.componentsToRemove
}

export function getComponentTypes(entity: Entity): Array<Component<any>> {
  return entity.componentTypes
}

export function addComponent<C extends Component<any>>(
  entity: Entity,
  Component: ComponentConstructor<C>,
  values?: Partial<Omit<C, keyof Component<any>>>
): Entity {
  if (typeof Component._typeId === "undefined" && !Engine.componentsMap[(Component as any)._typeId]) {
    registerComponent(Component)
  }

  if (~entity.componentTypes.indexOf(Component)) {
      console.warn("Component type already exists on entity.", entity, Component.name)
    return
  }

  entity.componentTypes.push(Component)

  if ((Component as any).isSystemStateComponent !== undefined) {
    entity.numStateComponents++
  }

  const componentPool = new ObjectPool(Component)

  const component = (componentPool ? componentPool.acquire() : new Component(values)) as Component<any>

  if (componentPool && values) {
    component.copy(values)
  }

  entity.components[Component._typeId] = component

  // Check each indexed query to see if we need to add this entity to the list
  for (const queryName in Engine.queries) {
    const query = Engine.queries[queryName]

    if (!!~query.notComponents.indexOf(Component) && ~query.entities.indexOf(entity)) {
      query.removeEntity(entity)
      continue
    }

    // Add the entity only if:
    // Component is in the query
    // and Entity has ALL the components of the query
    // and Entity is not already in the query
    if (!~query.components.indexOf(Component) || !query.match(entity) || ~query.entities.indexOf(entity)) continue

    query.addEntity(entity)
  }
  Engine.numComponents[component._typeId]++

  Engine.eventDispatcher.dispatchEvent(COMPONENT_ADDED, entity, Component as any)
    return entity
}

export function removeComponent<C extends Component<any>>(
  entity: Entity,
  Component: ComponentConstructor<C>,
  forceImmediate?: boolean
): Entity {
  removeComponentFromEntity(entity, Component, forceImmediate)
  return entity
}

export function hasComponent<C extends Component<C>>(
  entity: Entity,
  Component: ComponentConstructor<C>,
  includeRemoved?: boolean
): boolean {
  return (
    entity.componentTypes.length > 0 &&
    !!~entity.componentTypes.indexOf(Component) ||
    (includeRemoved !== undefined && includeRemoved === true && hasRemovedComponent(entity, Component))
  )
}

export function hasRemovedComponent<C extends Component<any>>(
  entity: Entity,
  Component: ComponentConstructor<C>
): boolean {
  return !!~entity.componentTypesToRemove.indexOf(Component)
}

export function hasAllComponents(entity: Entity, Components: Array<ComponentConstructor<any>>): boolean {
  for (let i = 0; i < Components.length; i++) {
    if (!hasComponent(entity, Components[i])) return false
  }
  return true
}

export function hasAnyComponents(entity: Entity, Components: Array<ComponentConstructor<any>>): boolean {
  for (let i = 0; i < Components.length; i++) {
    if (hasComponent(entity, entity.components[i])) return true
  }
  return false
}

export function getEntityByName(name) {
  return Engine.entitiesByName[name]
}

export function onEntityRemoved(entity) {
  for (const queryName in Engine.queries) {
    const query = Engine.queries[queryName]
    if (entity.queries.indexOf(query) !== -1) {
      query.removeEntity(entity)
    }
  }
}

export function createEntity(name?: string): Entity {
  const entity = Engine.entityPool.acquire()
  entity.alive = true
  entity.name = name || ""
  if (name) {
    if (Engine.entitiesByName[name]) {
      console.warn(`Entity name '${name}' already exist`)
    } else {
      Engine.entitiesByName[name] = entity
    }
  }

  Engine.entities.push(entity)
  Engine.eventDispatcher.dispatchEvent(ENTITY_CREATED, entity)
  return entity
}

export function removeEntity(entity: Entity, immediately?: boolean): void {
  const index = Engine.entities.indexOf(entity)

  if (!~index) throw new Error("Tried to remove entity not in list")

  entity.alive = false

  if (entity.numStateComponents === 0) {
    // Remove from entity list
    Engine.eventDispatcher.dispatchEvent(ENTITY_REMOVED, entity)
    onEntityRemoved(entity)
    if (immediately === true) {
      Engine.entities.splice(index, 1)
      if (Engine.entitiesByName[entity.name]) {
        delete Engine.entitiesByName[entity.name]
      }
      Engine.entityPool.release(entity)
        } else {
      Engine.entitiesToRemove.push(entity)
    }
  }

  removeAllComponents(entity, immediately)
}

/**
 * Remove a component from an entity
 * @param {Entity} entity Entity which will get removed the component
 * @param {*} component Component to remove from the entity
 * @param {Bool} immediately If you want to remove the component immediately instead of deferred (Default is false)
 */
export function removeComponentFromEntity(entity: Entity, component: any, immediately?: boolean): void {
  const index = entity.componentTypes.indexOf(component)
  if (!~index) return

  Engine.eventDispatcher.dispatchEvent(COMPONENT_REMOVE, entity, component)

  if (immediately) {
    removeComponentFromEntitySync(entity, component, index)
  } else {
    if (entity.componentTypesToRemove.length === 0) Engine.entitiesWithComponentsToRemove.push(entity)

    entity.componentTypes.splice(index, 1)
    entity.componentTypesToRemove.push(component)

    entity.componentsToRemove[component._typeId] = entity.components[component._typeId]
    delete entity.components[component._typeId]
  }
  // Check each indexed query to see if we need to remove it
  for (const queryName in Engine.queries) {
    const query = Engine.queries[queryName]

    if (!!~query.notComponents.indexOf(component) && !~query.entities.indexOf(entity) && query.match(entity)) {
      query.addEntity(entity)
      continue
    }

    if (!!~query.components.indexOf(component) && !!~query.entities.indexOf(entity) && !query.match(entity)) {
      query.removeEntity(entity)
      continue
    }
  }

  if ((Component as any).__proto__ === SystemStateComponent) {
    entity.numStateComponents--;

    // Check if the entity was a ghost waiting for the last system state component to be removed
    if (entity.numStateComponents === 0 && !entity.alive) {
      entity.remove();
    }
  }
}

function removeComponentFromEntitySync(entity: Entity, component: Component<any>, index: number): void {
  // Remove T listing on entity and property ref, then free the component.
  entity.componentTypes.splice(index, 1)
  const c = entity.components[component._typeId]
  delete entity.components[component._typeId]
  c.dispose()
  Engine.numComponents[component._typeId]--
}

export function removeAllComponents(entity: Entity, immediately?: boolean): void {
  const Components = entity.componentTypes
  for (let j = Components.length - 1; j >= 0; j--) {
    if (Components[j].__proto__ !== SystemStateComponent) removeComponentFromEntity(entity, Components[j], immediately)
  }
}

export function removeAllEntities(): void {
  for (let i = Engine.entities.length - 1; i >= 0; i--) {
    removeEntity(Engine.entities[i])
  }
}

export function getComponent<C extends Component<C>>(
  entity: Entity,
  component: ComponentConstructor<C> | unknown,
  includeRemoved?: boolean
): Readonly<C> {
  let _component = entity.components[(component as C)._typeId]

  if (!_component && includeRemoved === true) {
    _component = entity.componentsToRemove[(component as any)._typeId]
  }

  return process.env.NODE_ENV !== "production" ? <C>wrapImmutableComponent(_component) : <C>_component
}
