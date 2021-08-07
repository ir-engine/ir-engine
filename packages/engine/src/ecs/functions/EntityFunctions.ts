/** Functions to provide entity level functionalities. */

import { Component } from '../classes/Component'
import { ComponentConstructor } from '../interfaces/ComponentInterfaces'
import { Entity } from '../classes/Entity'
import { Query } from '../classes/Query'
import { Engine } from '../classes/Engine'
import { wrapImmutableComponent, registerComponent } from './ComponentFunctions'
import { ObjectPool } from '../classes/ObjectPool'
import { SystemStateComponent } from '../classes/SystemStateComponent'
import { QUERY_COMPONENT_CHANGED } from '../constants/Events'
import { COMPONENT_ADDED, ENTITY_CREATED, ENTITY_REMOVED, COMPONENT_REMOVE } from '../constants/Events'

/**
 * Get direct access to component data to modify.\
 * This will add the entity to any querying system's onChanged result.
 *
 * @author Fernando Serrano, Robert Long
 * @param entity Entity.
 * @param component Type of component.
 */
export function getMutableComponent<C extends Component<C>>(entity: Entity, Component: ComponentConstructor<C>): C {
  const component = entity.components[Component._typeId]

  if (!component) {
    return
  }

  for (let i = 0; i < entity.queries.length; i++) {
    const query = entity.queries[i]

    if (query.reactive && query.components.indexOf(Component) !== -1) {
      query.eventDispatcher.dispatchEvent(QUERY_COMPONENT_CHANGED, entity, component)
    }
  }
  return component
}

/**
 * Get a component that has been removed from the entity but hasn't been removed this frame.\
 * This will only work if {@link ecs/classes/Engine.Engine.deferredRemovalEnabled | Engine.deferredRemovalEnabled } is true in the engine (it is by default).
 *
 * @author Fernando Serrano, Robert Long
 * @param entity Entity.
 * @param component Type of component to be removed.
 *
 * @returns Removed component from the entity which hasn't been removed this frame.
 */
export function getRemovedComponent<C extends Component<C>>(
  entity: Entity,
  Component: ComponentConstructor<C>
): Readonly<C> {
  const component = entity.componentsToRemove[Component._typeId]

  return <C>(process.env.NODE_ENV !== 'production' ? wrapImmutableComponent<Component<C>>(component) : component)
}

/**
 *
 * @author Fernando Serrano, Robert Long
 * @param entity Entity to get components.
 * @returns An object with all components on the entity, keyed by component name.
 */
export function getComponents(entity: Entity): { [componentName: string]: ComponentConstructor<any> } {
  return entity.components
}

/**
 *
 * @author Fernando Serrano, Robert Long
 * @param entity Entity to get removed component.
 * @returns All components that are going to be removed from the entity and sent back to the pool at the end of this frame.
 */
export function getComponentsToRemove(entity: Entity): { [componentName: string]: ComponentConstructor<any> } {
  return entity.componentsToRemove
}

/**
 *
 * @author Fernando Serrano, Robert Long
 * @param entity Entity to get component types.
 * @returns An array of component types on this entity.
 */
export function getComponentTypes(entity: Entity): Array<Component<any>> {
  return entity.componentTypes
}

/**
 * Get all the components of given type currently registered in the engine
 * @author Nayankumar Patel
 * @param componentType Type of components to be retrived
 * @returns all the components of given type
 */
export function getAllMutableComponentOfType<C extends Component<C>>(componentType: ComponentConstructor<C>): C[] {
  const portalComps = []

  Engine.entities.forEach((entity: Entity) => {
    const portalComponent = getMutableComponent(entity, componentType)

    if (!portalComponent) return

    portalComps.push(portalComponent)
  })

  return portalComps
}

/**
 * Add a component to an entity.
 *
 * @author Fernando Serrano, Robert Long
 * @param entity Entity.
 * @param Component Type of component which will be added.
 * @param values values to be passed to the component constructor.
 * @returns The component added to the entity.
 */
export function addComponent<C extends Component<C>>(
  entity: Entity,
  Component: ComponentConstructor<C>,
  values?: Partial<Omit<C, keyof Component<C>>>
): C {
  if (typeof Component._typeId === 'undefined' && !Engine.componentsMap[(Component as any)._typeId]) {
    registerComponent(Component)
  }

  if (~entity.componentTypes.indexOf(Component)) {
    // console.warn('Component type already exists on entity.', entity, Component.name);
    return
  }

  entity.componentTypes.push(Component)

  if ((Component as any).isSystemStateComponent !== undefined) {
    entity.numStateComponents++
  }

  const componentPool = new ObjectPool(Component)

  const component = (componentPool ? componentPool.acquire() : new Component(values)) as Component<any>
  component.entity = entity
  component._typeId = Component._typeId

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
  return component as C
}

/**
 * Remove a component from an entity.
 *
 * @author Fernando Serrano, Robert Long
 * @param entity Entity.
 * @param Component Type of component which will be removed.
 * @param forceImmediate Remove immediately or wait for the frame to complete.
 * @returns The component removed from the entity (you probably don't need this).
 */
export function removeComponent<C extends Component<C>>(
  entity: Entity,
  Component: ComponentConstructor<C>,
  forceImmediate?: boolean
): C {
  const index = entity.componentTypes.indexOf(Component)
  if (!~index) return
  const component = entity.components[Component._typeId]

  Engine.eventDispatcher.dispatchEvent(COMPONENT_REMOVE, entity, component)

  if (forceImmediate) {
    // Remove T listing on entity and property ref, then free the component.
    entity.componentTypes.splice(index, 1)
    const c = entity.components[component._typeId]
    delete entity.components[component._typeId]
    c.dispose()
    Engine.numComponents[component._typeId]--
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

    if (!!~query.notComponents.indexOf(Component) && !~query.entities.indexOf(entity) && query.match(entity)) {
      query.addEntity(entity)
      continue
    }

    // if component is listed in query.components and entity is in query.entities but query do not match entity anymore - remove from query
    if (!!~query.components.indexOf(Component) && !!~query.entities.indexOf(entity) && !query.match(entity)) {
      query.removeEntity(entity)
      continue
    }
  }

  // Component instanceof SystemStateComponent
  if ((Component as any).__proto__ === SystemStateComponent) {
    entity.numStateComponents--

    // Check if the entity was a ghost waiting for the last system state component to be removed
    if (entity.componentTypes.length === 0) {
      removeEntity(entity)
    }
  }
  return component
}

/**
 * Check if an entity has a component type.
 *
 * @author Fernando Serrano, Robert Long
 * @param entity Entity being checked.
 * @param Components Type of components to check.
 * @param includeRemoved Also check in {@link ecs/classes/Entity.Entity.componentTypesToRemove | Entity.componentTypesToRemove}.
 * @returns True if the entity has the component.
 */
export function hasComponent<C extends Component<C>>(
  entity: Entity,
  Component: ComponentConstructor<C>,
  includeRemoved?: boolean
): boolean {
  return (
    (entity.componentTypes.length > 0 && !!~entity.componentTypes.indexOf(Component)) ||
    (includeRemoved !== undefined && includeRemoved && hasRemovedComponent(entity, Component))
  )
}

/**
 * Check if an entity had a component type removed this frame.
 *
 * @author Fernando Serrano, Robert Long
 * @param entity Entity.
 * @param Components Type of components to check.
 * @returns True if the entity had the component removed this frame.
 */
export function hasRemovedComponent<C extends Component<any>>(
  entity: Entity,
  Component: ComponentConstructor<C>
): boolean {
  return !!~entity.componentTypesToRemove.indexOf(Component)
}

/**
 * Check if an entity has aall component types in an array.
 *
 * @author Fernando Serrano, Robert Long
 * @param entity Entity
 * @param Components Type of components to check.
 * @returns True if the entity has all components.
 */
export function hasAllComponents(entity: Entity, Components: Array<ComponentConstructor<any>>): boolean {
  for (let i = 0; i < Components.length; i++) {
    if (!hasComponent(entity, Components[i])) return false
  }
  return true
}

/**
 * Check if an entity has any of the component types in an array.
 *
 * @author Fernando Serrano, Robert Long
 * @param entity Entity.
 * @param Components Type of components to check.
 * @returns True if the entity has any of the components.
 */
export function hasAnyComponents(entity: Entity, Components: Array<ComponentConstructor<any>>): boolean {
  for (let i = 0; i < Components.length; i++) {
    if (hasComponent(entity, Components[i])) return true
  }
  return false
}

/**
 * Create a new entity.
 *
 * @author Fernando Serrano, Robert Long
 * @returns Newly created entity.
 */
export function createEntity(): Entity {
  const entity = Engine.entityPool.acquire()
  Engine.entities.push(entity)
  Engine.entityMap.set(String(entity.id), entity)
  Engine.eventDispatcher.dispatchEvent(ENTITY_CREATED, entity)
  return entity
}

/**
 * Remove the entity from the simulation and return it to the pool.
 *
 * @author Fernando Serrano, Robert Long
 * @param entity Entity which will be removed.
 * @param immediately Remove immediately or wait for the frame to complete.
 */
export function removeEntity(entity: Entity, immediately?: boolean): void {
  const index = Engine.entities.indexOf(entity)

  if (!~index) {
    console.error('Tried to remove entity not in list')
    return
  }

  if (entity.numStateComponents === 0) {
    // Remove from entity list
    Engine.eventDispatcher.dispatchEvent(ENTITY_REMOVED, entity)
    for (const queryName in Engine.queries) {
      const query = Engine.queries[queryName]
      if (entity.queries.indexOf(query) !== -1) {
        query.removeEntity(entity)
      }
    }
    if (immediately) {
      Engine.entities.splice(index, 1)
      Engine.entityMap.delete(String(entity.id))
      Engine.entityPool.release(entity)
    } else {
      Engine.entitiesToRemove.push(entity)
    }
  }

  removeAllComponents(entity, immediately)
}

/**
 * Remove all components from an entity.
 *
 * @author Fernando Serrano, Robert Long
 * @param entity Entity whose components will be removed.
 * @param immediately Remove immediately or wait for the frame to complete.
 */
export function removeAllComponents(entity: Entity, immediately?: boolean): void {
  const Components = entity.componentTypes
  for (let j = Components.length - 1; j >= 0; j--) {
    if (Components[j].__proto__ !== SystemStateComponent) removeComponent(entity, Components[j], immediately)
  }
}

/**
 * Remove all entities from the simulation.
 *
 * @author Fernando Serrano, Robert Long
 */
export function removeAllEntities(): void {
  for (let i = Engine.entities.length - 1; i >= 0; i--) {
    removeEntity(Engine.entities[i])
  }
}

/**
 * Get a component from the entity
 *
 * @author Fernando Serrano, Robert Long
 * @param entity Entity to be searched.
 * @param component Type of the component to be returned.
 * @param includeRemoved Include Components from {@link ecs/classes/Entity.Entity.componentsToRemove | Entity.componentsToRemove}.
 * @returns Component.
 */
export function getComponent<C extends Component<C>>(
  entity: Entity,
  component: ComponentConstructor<C>,
  includeRemoved?: boolean
): C {
  let _component = entity.components[component._typeId]

  if (!_component && includeRemoved) {
    _component = entity.componentsToRemove[component._typeId]
  }

  return <C>_component
}

/**
 * Get an entity by it's locally assigned unique ID
 *
 * @author Fernando Serrano, Robert Long
 * @param id
 * @returns Entity.
 */
export function getEntityByID(id: number): Entity {
  return Engine.entityMap.get(String(id))
}

/**
 * Get an entity by it's name assigned while creating entity in the editor
 * It returns the first entity with the matching name.
 * @author Nayankumar Patel
 * @param name
 * @returns Entity or undefined if not found.
 */
export function getEntityByName(name: string): Entity | undefined {
  for (let i = 0; i < Engine.entities.length; i++) {
    if (Engine.entities[i].name === name) return Engine.entities[i]
  }

  return undefined
}
