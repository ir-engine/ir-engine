import { addComponent, getComponent } from "../functions/EntityFunctions"
import { World } from "./World"
import { removeEntity } from "../functions/EntityFunctions"

export class Entity {
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

  copy(src): Entity {
    for (const ecsyComponentId in src._components) {
      const srcComponent = src._components[ecsyComponentId]
      addComponent(this, srcComponent.constructor)
      const component = getComponent(this, srcComponent.constructor)
      component.copy(srcComponent)
    }

    return this
  }

  clone(): Entity {
    return new Entity().copy(this)
  }

  reset(): void {
    this.id = World.nextEntityId++
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


