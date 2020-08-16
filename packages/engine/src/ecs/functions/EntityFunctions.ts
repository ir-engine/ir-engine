import { Component, ComponentConstructor } from "../classes/Component"
import { Entity } from "../classes/Entity"
import { Query } from "../classes/Query"
import { Engine } from "../classes/Engine"
import { wrapImmutableComponent, removeAllComponentsFromEntity, componentRemovedFromEntity } from "./ComponentFunctions"

export const ENTITY_CREATED = "EntityManager#ENTITY_CREATE"
export const ENTITY_REMOVED = "EntityManager#ENTITY_REMOVED"

export function getComponentOnEntity<C extends Component<C>>(
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

    if (query.reactive && query.Components.indexOf(Component) !== -1) {
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

export function getComponentsFromEntity(entity: Entity): { [componentName: string]: ComponentConstructor<any> } {
  return entity.components
}

export function getComponentsToRemove(entity: Entity): { [componentName: string]: ComponentConstructor<any> } {
  return entity.componentsToRemove
}

export function getComponentTypes(entity: Entity): Array<Component<any>> {
  return entity.componentTypes
}

export function addComponentToEntity<C extends Component<any>>(
  entity: Entity,
  Component: ComponentConstructor<C>,
  values?: Partial<Omit<C, keyof Component<any>>>
): Entity {
  addComponentToEntity(entity, Component, values)
  return entity
}

export function removeComponentFromEntity<C extends Component<any>>(
  entity: Entity,
  Component: ComponentConstructor<C>,
  forceImmediate?: boolean
): Entity {
  removeComponentFromEntity(entity, Component, forceImmediate)
  return entity
}

export function entityHasComponent<C extends Component<any>>(
  entity: Entity,
  Component: ComponentConstructor<C>,
  includeRemoved?: boolean
): boolean {
  return (
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
    if (!entityHasComponent(entity, Components[i])) return false
  }
  return true
}

export function hasAnyComponents(entity: Entity, Components: Array<ComponentConstructor<any>>): boolean {
  for (let i = 0; i < Components.length; i++) {
    if (entityHasComponent(entity, entity.components[i])) return true
  }
  return false
}

export function removeAllComponents(entity: Entity, forceImmediate?: boolean): void {
  return removeAllComponentsFromEntity(entity, forceImmediate)
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

export function onEntityComponentAdded(entity, Component) {
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
      releaseEntity(entity, index)
    } else {
      Engine.entitiesToRemove.push(entity)
    }
  }

  removeAllComponentsFromEntity(entity, immediately)
}

export function removeAllEntities(): void {
  for (let i = Engine.entities.length - 1; i >= 0; i--) {
    removeEntity(Engine.entities[i])
  }
}

export function releaseEntity(entity: Entity, index: number): void {
  Engine.entities.splice(index, 1)

  if (Engine.entitiesByName[entity.name]) {
    delete Engine.entitiesByName[entity.name]
  }
  Engine.entityPool.release(entity)
}

export function processDeferredEntityRemoval() {
  // if (!World.deferredRemovalEnabled) {
  return
  // }
  let entitiesToRemove
  let entitiesWithComponentsToRemove
  for (let i = 0; i < entitiesToRemove.length; i++) {
    const entity = entitiesToRemove[i]
    const index = Engine.entities.indexOf(entity)
    releaseEntity(entity, index)
  }
  entitiesToRemove.length = 0

  for (let i = 0; i < entitiesWithComponentsToRemove.length; i++) {
    const entity = entitiesWithComponentsToRemove[i]
    while (entity.componentTypesToRemove.length > 0) {
      const Component = entity.componentTypesToRemove.pop()

      const component = entity.componentsToRemove[Component._typeId]
      delete entity.componentsToRemove[Component._typeId]
      component.dispose()
      componentRemovedFromEntity(Component)
    }
  }

  Engine.entitiesWithComponentsToRemove.length = 0
}
