import { SystemStateComponent } from ".."
import { Component, ComponentConstructor } from "../classes/Component"
import { Entity } from "../classes/Entity"
import { ObjectPool } from "../classes/ObjectPool"
import { World } from "../classes/World"
import { COMPONENT_ADDED, COMPONENT_REMOVE } from "../types/EventTypes"
import { onEntityComponentAdded } from "./EntityFunctions"
import { getName } from "./Utils"

const proxyMap = new WeakMap()

const proxyHandler = {
  set(target, prop) {
    throw new Error(
      `Tried to write to "${target.name}#${String(
        prop
      )}" on immutable component. Use .getMutableComponent() to modify a component.`
    )
  }
}

export function Not(Component) {
  return {
    type: "not" as const,
    Component: Component
  }
}

export default function wrapImmutableComponent<T>(component: Component<T>): T {
  if (component === undefined) {
    return undefined
  }

  let wrappedComponent = proxyMap.get(component)

  if (!wrappedComponent) {
    wrappedComponent = new Proxy(component, proxyHandler)
    proxyMap.set(component, wrappedComponent)
  }

  return <T>wrappedComponent
}

export function registerComponent<C extends Component<any>>(
  Component: ComponentConstructor<C>,
  objectPool?: ObjectPool<C> | false
): void {
  if (World.components.indexOf(Component) !== -1) {
    console.warn(`Component type: '${getName(Component)}' already registered.`)
    return
  }

  const schema = Component.schema

  if (!schema) {
    throw new Error(`Component "${getName(Component)}" has no schema property.`)
  }

  for (const propName in schema) {
    const prop = schema[propName]

    if (!prop.type) {
      throw new Error(`Invalid schema for component "${getName(Component)}". Missing type for "${propName}" property.`)
    }
  }

  Component._typeId = World.nextComponentId++
  World.components.push(Component)
  World.componentsMap[Component._typeId] = Component
  World.numComponents[Component._typeId] = 0

  if (objectPool === undefined) {
    objectPool = new ObjectPool(Component)
  } else if (objectPool === false) {
    objectPool = undefined
  }

  World.componentPool[Component._typeId] = objectPool
}

export function hasRegisteredComponent<C extends Component<any>>(Component: ComponentConstructor<C>): boolean {
  return World.components.indexOf(Component) !== -1
}

export function componentAddedToEntity(component: Component<any>): void {
  World.numComponents[component._typeId]++
}

export function componentRemovedFromEntity(component: Component<any>): void {
  World.numComponents[component._typeId]--
}

export function getPoolForComponent(component: Component<any>): void {
  World.componentPool[component._typeId]
}

export function addComponentToEntity(entity, Component, values) {
  // @todo Probably define Component._typeId with a default value and avoid using typeof
  if (typeof Component._typeId === "undefined" && !World.componentsMap[Component._typeId]) {
    throw new Error(`Attempted to add unregistered component "${Component.name}"`)
  }

  if (~entity.componentTypes.indexOf(Component)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Component type already exists on entity.", entity, Component.name)
    }
    return
  }

  entity.componentTypes.push(Component)

  if (Component.__proto__ === SystemStateComponent) {
    entity.numStateComponents++
  }

  const componentPool = new ObjectPool(Component)

  const component = componentPool ? componentPool.acquire() : new Component(values)

  if (componentPool && values) {
    component.copy(values)
  }

  entity._components[Component._typeId] = component

  onEntityComponentAdded(entity, Component)
  componentAddedToEntity(Component)

  World.eventDispatcher.dispatchEvent(COMPONENT_ADDED, entity, Component)
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

  World.eventDispatcher.dispatchEvent(COMPONENT_REMOVE, entity, component)

  if (immediately) {
    removeComponentFromEntitySync(entity, component, index)
  } else {
    if (entity.componentTypesToRemove.length === 0) World.entitiesWithComponentsToRemove.push(entity)

    entity.componentTypes.splice(index, 1)
    entity.componentTypesToRemove.push(component)

    entity.componentsToRemove[component._typeId] = entity.components[component._typeId]
    delete entity.components[component._typeId]
  }
}

export function onEntityComponentRemoved(entity, component) {
  for (const queryName in this.queries) {
    const query = this.queries[queryName]

    if (!!~query.NotComponents.indexOf(component) && !~query.entities.indexOf(entity) && query.match(entity)) {
      query.addEntity(entity)
      continue
    }

    if (!!~query.Components.indexOf(component) && !!~query.entities.indexOf(entity) && !query.match(entity)) {
      query.removeEntity(entity)
      continue
    }
  }

  if (component instanceof SystemStateComponent) {
    entity.numStateComponents--

    // Check if the entity was a ghost waiting for the last system state component to be removed
    if (entity.numStateComponents === 0 && !entity.alive) {
      entity.remove()
    }
  }
}

export function removeComponentFromEntitySync(entity: Entity, component: Component<any>, index: number): void {
  // Remove T listing on entity and property ref, then free the component.
  entity.componentTypes.splice(index, 1)
  const c = entity.components[component._typeId]
  delete entity.components[component._typeId]
  c.dispose()
  componentRemovedFromEntity(c)
}

export function removeAllComponentsFromEntity(entity: Entity, immediately?: boolean): void {
  const Components = entity.componentTypes

  for (let j = Components.length - 1; j >= 0; j--) {
    if (Components[j].__proto__ !== SystemStateComponent) removeComponentFromEntity(entity, Components[j], immediately)
  }
}
