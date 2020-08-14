import { Component, ComponentConstructor } from "./Component"
import Query from "./Query"
import wrapImmutableComponent from "./ComponentFunctions"
import { Entity } from "./Entity"

export function getComponent<C extends Component<any>>(
  entity: Entity,
  Component: C | unknown,
  includeRemoved?: boolean
): Readonly<C> {
  let component = entity.components[(Component as C)._typeId]

  if (!component && includeRemoved === true) {
    component = entity.componentsToRemove[(Component as any)._typeId]
  }

  return process.env.NODE_ENV !== "production" ? <C>wrapImmutableComponent(Component, component) : <C>component
}

export function getRemovedComponent<C extends Component<any>>(
  entity: Entity,
  Component: ComponentConstructor<C>
): Readonly<C> {
  const component = entity.componentsToRemove[Component._typeId]

  return <C>(process.env.NODE_ENV !== "production" ? wrapImmutableComponent(Component, component) : component)
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

export function getMutableComponent<C extends Component<any>>(entity: Entity, Component: ComponentConstructor<C>): C {
  const component = entity.components[Component._typeId]

  if (!component) {
    return
  }

  for (let i = 0; i < entity.queries.length; i++) {
    const query = entity.queries[i]
    // @todo accelerate entity check. Maybe having query._Components as an object
    // @todo add Not components
    if (query.reactive && query.Components.indexOf(Component) !== -1) {
      query.eventDispatcher.dispatchEvent(Query.prototype.COMPONENT_CHANGED, entity, component)
    }
  }
  return <C>component
}

export function addComponent<C extends Component<any>>(
  entity: Entity,
  Component: ComponentConstructor<C>,
  values?: Partial<Omit<C, keyof Component<any>>>
): Entity {
  entity._entityManager.entityAddComponent(entity, Component, values)
  return entity
}

export function removeComponent<C extends Component<any>>(
  entity: Entity,
  Component: ComponentConstructor<C>,
  forceImmediate?: boolean
): Entity {
  entity._entityManager.entityRemoveComponent(entity, Component, forceImmediate)
  return entity
}

export function hasComponent<C extends Component<any>>(
  entity: Entity,
  Component: ComponentConstructor<C>,
  includeRemoved?: boolean
): boolean {
  return (
    !!~entity.componentTypes.indexOf(Component) ||
    (includeRemoved !== undefined && includeRemoved === true && entity.hasRemovedComponent(Component))
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
    if (!entity.hasComponent(Components[i])) return false
  }
  return true
}

export function hasAnyComponents(entity: Entity, Components: Array<ComponentConstructor<any>>): boolean {
  for (let i = 0; i < Components.length; i++) {
    if (entity.hasComponent(Components[i])) return true
  }
  return false
}

export function removeAllComponents(entity: Entity, forceImmediate?: boolean): void {
  return entity._entityManager.entityRemoveAllComponents(entity, forceImmediate)
}
