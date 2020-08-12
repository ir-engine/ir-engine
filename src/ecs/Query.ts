import { Component } from "./Component"
import EventDispatcher from "./EventDispatcher"
import QueryManager from "./QueryManager"
import { queryKey } from "./Utils"

export default class Query {
  Components: any[]
  NotComponents: any[]
  entities: any[]
  eventDispatcher: EventDispatcher
  reactive: boolean
  key: any
  ENTITY_ADDED = "Query#ENTITY_ADDED"
  ENTITY_REMOVED = "Query#ENTITY_REMOVED"
  COMPONENT_CHANGED = "Query#COMPONENT_CHANGED"

  /**
   * @param {Array(Component)} Components List of types of components to query
   */
  constructor(Components: Component<any>[], manager: QueryManager) {
    this.Components = []
    this.NotComponents = []

    Components.forEach(component => {
      if (typeof component === "object") {
        this.NotComponents.push((component as any).Component)
      } else {
        this.Components.push(component)
      }
    })

    if (this.Components.length === 0) {
      throw new Error("Can't create a query without components")
    }

    this.entities = []

    this.eventDispatcher = new EventDispatcher()

    // This query is being used by a reactive system
    this.reactive = false

    this.key = queryKey(Components)

    // Fill the query with the existing entities
    for (let i = 0; i < manager._entities.length; i++) {
      const entity = manager._entities[i]
      if (this.match(entity)) {
        // @todo ??? this.addEntity(entity); => preventing the event to be generated
        entity.queries.push(this)
        this.entities.push(entity)
      }
    }
  }

  /**
   * Add entity to this query
   * @param {Entity} entity
   */
  addEntity(entity) {
    entity.queries.push(this)
    this.entities.push(entity)

    this.eventDispatcher.dispatchEvent(Query.prototype.ENTITY_ADDED, entity)
  }

  /**
   * Remove entity from this query
   * @param {Entity} entity
   */
  removeEntity(entity) {
    let index = this.entities.indexOf(entity)
    if (~index) {
      this.entities.splice(index, 1)

      index = entity.queries.indexOf(this)
      entity.queries.splice(index, 1)

      this.eventDispatcher.dispatchEvent(Query.prototype.ENTITY_REMOVED, entity)
    }
  }

  match(entity) {
    return entity.hasAllComponents(this.Components) && !entity.hasAnyComponents(this.NotComponents)
  }

  toJSON() {
    return {
      key: this.key,
      reactive: this.reactive,
      components: {
        included: this.Components.map(C => C.name),
        not: this.NotComponents.map(C => C.name)
      },
      numEntities: this.entities.length
    }
  }

  /**
   * Return stats for this query
   */
  stats() {
    return {
      numComponents: this.Components.length,
      numEntities: this.entities.length
    }
  }
}
