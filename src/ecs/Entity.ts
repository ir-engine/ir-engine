import { Component, ComponentConstructor } from "./Component"
import Query from "./Query"
import wrapImmutableComponent from "./ComponentFunctions"
import { World } from "./World"

export class Entity {
  removeObject3DComponent() {
    throw new Error("Method not implemented.")
  }
  id: number
  componentTypes: any[]
  components: {}
  componentsToRemove: {}
  queries: any[]
  componentTypesToRemove: any[]
  alive: boolean
  numStateComponents: number
  name: any
  constructor() {

    // Unique ID for this entity
    this.id = World.nextEntityId++
    this.componentTypes = []
    this.components = {}
    this.componentsToRemove = {}
    this.queries = []
    this.componentTypesToRemove = []
    this.alive = false
    this.numStateComponents = 0
  }

  // COMPONENTS

  getComponent<C extends Component<any>>(Component: C | unknown, includeRemoved?: boolean): Readonly<C> {
    let component = this.components[(Component as C)._typeId]

    if (!component && includeRemoved === true) {
      component = this.componentsToRemove[(Component as any)._typeId]
    }

    return process.env.NODE_ENV !== "production" ? <C>wrapImmutableComponent(Component, component) : <C>component
  }

  getRemovedComponent<C extends Component<any>>(Component: ComponentConstructor<C>): Readonly<C> {
    const component = this.componentsToRemove[Component._typeId]

    return <C>(process.env.NODE_ENV !== "production" ? wrapImmutableComponent(Component, component) : component)
  }

  getComponents(): { [componentName: string]: ComponentConstructor<any> } {
    return this.components
  }

  getComponentsToRemove(): { [componentName: string]: ComponentConstructor<any> } {
    return this.componentsToRemove
  }

  getComponentTypes(): Array<Component<any>> {
    return this.componentTypes
  }

  getMutableComponent<C extends Component<any>>(Component: ComponentConstructor<C>): C {
    const component = this.components[Component._typeId]

    if (!component) {
      return
    }

    for (let i = 0; i < this.queries.length; i++) {
      const query = this.queries[i]
      // @todo accelerate this check. Maybe having query._Components as an object
      // @todo add Not components
      if (query.reactive && query.Components.indexOf(Component) !== -1) {
        query.eventDispatcher.dispatchEvent(Query.prototype.COMPONENT_CHANGED, this, component)
      }
    }
    return <C>component
  }

  addComponent<C extends Component<any>>(
    Component: ComponentConstructor<C>,
    values?: Partial<Omit<C, keyof Component<any>>>
  ): this {
    entityAddComponent(this, Component, values)
    return this
  }

  removeComponent<C extends Component<any>>(Component: ComponentConstructor<C>, forceImmediate?: boolean): this {
    entityRemoveComponent(this, Component, forceImmediate)
    return this
  }

  hasComponent<C extends Component<any>>(Component: ComponentConstructor<C>, includeRemoved?: boolean): boolean {
    return (
      !!~this.componentTypes.indexOf(Component) ||
      (includeRemoved !== undefined && includeRemoved === true && this.hasRemovedComponent(Component))
    )
  }

  hasRemovedComponent<C extends Component<any>>(Component: ComponentConstructor<C>): boolean {
    return !!~this.componentTypesToRemove.indexOf(Component)
  }

  hasAllComponents(Components: Array<ComponentConstructor<any>>): boolean {
    for (let i = 0; i < Components.length; i++) {
      if (!this.hasComponent(Components[i])) return false
    }
    return true
  }

  hasAnyComponents(Components: Array<ComponentConstructor<any>>): boolean {
    for (let i = 0; i < Components.length; i++) {
      if (this.hasComponent(Components[i])) return true
    }
    return false
  }

  removeAllComponents(forceImmediate?: boolean): void {
    return entityRemoveAllComponents(this, forceImmediate)
  }

  copy(src): Entity {
    // TODO: This can definitely be optimized
    for (const ecsyComponentId in src._components) {
      const srcComponent = src._components[ecsyComponentId]
      this.addComponent(srcComponent.constructor)
      const component = this.getComponent(srcComponent.constructor)
      component.copy(srcComponent)
    }

    return this
  }

  clone(): Entity {
    return new Entity(this._entityManager).copy(this)
  }

  reset(): void {
    this.id = _nextEntityId++
    this.componentTypes.length = 0
    this.queries.length = 0

    for (const ecsyComponentId in this.components) {
      delete this.components[ecsyComponentId]
    }
  }

  remove(forceImmediate?: boolean): void {
    return removeEntity(this, forceImmediate)
  }
}
