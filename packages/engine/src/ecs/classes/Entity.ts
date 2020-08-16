import { addComponent, getComponent } from "../functions/EntityFunctions"
import { Engine } from "./Engine"
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
    this.id = Engine.nextEntityId++
    this.componentTypes = []
    this.components = {}
    this.componentsToRemove = {}
    this.queries = []
    this.componentTypesToRemove = []
    this.alive = false
    this.numStateComponents = 0
  }

  copy(src): Entity {
    for (const componentId in src.components) {
      const srcComponent = src.components[componentId]
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
    this.id = Engine.nextEntityId++
    this.componentTypes.length = 0
    this.queries.length = 0

    for (const componentId in this.components) {
      delete this.components[componentId]
    }
  }

  remove(forceImmediate?: boolean): void {
    return removeEntity(this, forceImmediate)
  }
}
