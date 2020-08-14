import { addComponent, getComponent, onEntityRemoved } from "../functions/EntityFunctions"
import { World } from "./World"
import { ENTITY_CREATED, ENTITY_REMOVED } from "../types/EventTypes"
import { removeAllComponentsFromEntity, componentRemovedFromEntity } from "../functions/ComponentFunctions"

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
  if (!World.deferredRemovalEnabled) {
    return
  }
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
    while (entity._ComponentTypesToRemove.length > 0) {
      const Component = entity._ComponentTypesToRemove.pop()

      const component = entity._componentsToRemove[Component._typeId]
      delete entity._componentsToRemove[Component._typeId]
      component.dispose()
      componentRemovedFromEntity(Component)
    }
  }

  World.entitiesWithComponentsToRemove.length = 0
}
