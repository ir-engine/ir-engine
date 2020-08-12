import { Component, ComponentConstructor } from "./Component"
import Query from "./Query"
import wrapImmutableComponent from "./WrapImmutableComponent"

export class Entity {
  _entityManager: any
  id: number
  _ComponentTypes: any[]
  _components: {}
  _componentsToRemove: {}
  queries: any[]
  _ComponentTypesToRemove: any[]
  alive: boolean
  numStateComponents: number
  name: any
  constructor(entityManager) {
    this._entityManager = entityManager || null

    // Unique ID for this entity
    this.id = entityManager._nextEntityId++

    // List of components types the entity has
    this._ComponentTypes = []

    // Instance of the components
    this._components = {}

    this._componentsToRemove = {}

    // Queries where the entity is added
    this.queries = []

    // Used for deferred removal
    this._ComponentTypesToRemove = []

    this.alive = false

    //if there are state components on a entity, it can't be removed completely
    this.numStateComponents = 0
  }

  // COMPONENTS

  getComponent<C extends Component<any>>(Component: C | unknown, includeRemoved?: boolean): Readonly<C> {
    let component = this._components[(Component as C)._typeId]

    if (!component && includeRemoved === true) {
      component = this._componentsToRemove[(Component as any)._typeId]
    }

    return process.env.NODE_ENV !== "production" ? <C>wrapImmutableComponent(Component, component) : <C>component
  }

  getRemovedComponent<C extends Component<any>>(Component: ComponentConstructor<C>): Readonly<C> {
    const component = this._componentsToRemove[Component._typeId]

    return <C>(process.env.NODE_ENV !== "production" ? wrapImmutableComponent(Component, component) : component)
  }

  getComponents(): { [componentName: string]: ComponentConstructor<any> } {
    return this._components
  }

  getComponentsToRemove(): { [componentName: string]: ComponentConstructor<any> } {
    return this._componentsToRemove
  }

  getComponentTypes(): Array<Component<any>> {
    return this._ComponentTypes
  }

  getMutableComponent<C extends Component<any>>(Component: ComponentConstructor<C>): C {
    const component = this._components[Component._typeId]

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
    this._entityManager.entityAddComponent(this, Component, values)
    return this
  }

  removeComponent<C extends Component<any>>(Component: ComponentConstructor<C>, forceImmediate?: boolean): this {
    this._entityManager.entityRemoveComponent(this, Component, forceImmediate)
    return this
  }

  hasComponent<C extends Component<any>>(Component: ComponentConstructor<C>, includeRemoved?: boolean): boolean {
    return (
      !!~this._ComponentTypes.indexOf(Component) ||
      (includeRemoved !== undefined && includeRemoved === true && this.hasRemovedComponent(Component))
    )
  }

  hasRemovedComponent<C extends Component<any>>(Component: ComponentConstructor<C>): boolean {
    return !!~this._ComponentTypesToRemove.indexOf(Component)
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
    return this._entityManager.entityRemoveAllComponents(this, forceImmediate)
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
    this.id = this._entityManager._nextEntityId++
    this._ComponentTypes.length = 0
    this.queries.length = 0

    for (const ecsyComponentId in this._components) {
      delete this._components[ecsyComponentId]
    }
  }

  remove(forceImmediate?: boolean): void {
    return this._entityManager.removeEntity(this, forceImmediate)
  }
}
