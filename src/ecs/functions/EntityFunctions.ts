import { Component, ComponentConstructor } from "../classes/Component"
import { Entity } from "../classes/Entity"
import Query from "../classes/Query"
import { World } from "../classes/World"
import wrapImmutableComponent, {
  addComponentToEntity,
  removeAllComponentsFromEntity,
  removeComponentFromEntity,
  componentRemovedFromEntity
} from "./ComponentFunctions"
import { ENTITY_CREATED, ENTITY_REMOVED } from "../types/EventTypes"

export function getComponent<C extends Component<any>>(
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
  addComponentToEntity(entity, Component, values)
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

export function hasComponent<C extends Component<any>>(
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

export function removeAllComponents(entity: Entity, forceImmediate?: boolean): void {
  return removeAllComponentsFromEntity(entity, forceImmediate)
}

export function getEntityByName(name) {
  return World.entitiesByName[name]
}

export function onEntityRemoved(entity) {
  for (const queryName in World.queries) {
    const query = World.queries[queryName]
    if (entity.queries.indexOf(query) !== -1) {
      query.removeEntity(entity)
    }
  }
}

export function onEntityComponentAdded(entity, Component) {
  // Check each indexed query to see if we need to add this entity to the list
  for (const queryName in World.queries) {
    const query = World.queries[queryName]

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
  const entity = World.entityPool.acquire()
  entity.alive = true
  entity.name = name || ""
  if (name) {
    if (World.entitiesByName[name]) {
      console.warn(`Entity name '${name}' already exist`)
    } else {
      World.entitiesByName[name] = entity
    }
  }

  World.entities.push(entity)
  World.eventDispatcher.dispatchEvent(ENTITY_CREATED, entity)
  return entity
}
export function removeEntity(entity: Entity, immediately?: boolean): void {
  const index = World.entities.indexOf(entity)

  if (!~index) throw new Error("Tried to remove entity not in list")

  entity.alive = false

  if (entity.numStateComponents === 0) {
    // Remove from entity list
    World.eventDispatcher.dispatchEvent(ENTITY_REMOVED, entity)
    onEntityRemoved(entity)
    if (immediately === true) {
      releaseEntity(entity, index)
    } else {
      World.entitiesToRemove.push(entity)
    }
  }

  removeAllComponentsFromEntity(entity, immediately)
}

export function removeAllEntities(): void {
  for (let i = World.entities.length - 1; i >= 0; i--) {
    removeEntity(World.entities[i])
  }
}

export function releaseEntity(entity: Entity, index: number): void {
  World.entities.splice(index, 1)

  if (World.entitiesByName[entity.name]) {
    delete World.entitiesByName[entity.name]
  }
  World.entityPool.release(entity)
}

export function processDeferredEntityRemoval() {
  // if (!World.deferredRemovalEnabled) {
  return
  // }
  let entitiesToRemove
  let entitiesWithComponentsToRemove
  for (let i = 0; i < entitiesToRemove.length; i++) {
    const entity = entitiesToRemove[i]
    const index = World.entities.indexOf(entity)
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

  World.entitiesWithComponentsToRemove.length = 0
}
