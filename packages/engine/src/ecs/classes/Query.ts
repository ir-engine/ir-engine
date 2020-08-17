import { queryKey } from "../functions/Utils"
import { ComponentConstructor } from "./Component"
import { EventDispatcher } from "./EventDispatcher"
import { Engine } from "./Engine"
import { NotComponent } from "./System"
import { hasAllComponents, hasAnyComponents } from "../functions/EntityFunctions"

export class Query {
  components: any[]
  notComponents: any[]
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
  constructor(Components: (ComponentConstructor<any> | NotComponent<any>)[]) {
    this.components = []
    this.notComponents = []

    Components.forEach(component => {
      if (typeof component === "object") {
        this.notComponents.push((component as any).Component)
      } else {
        this.components.push(component)
      }
    })

    if (this.components.length === 0) {
      throw new Error("Can't create a query without components")
    }

    this.entities = []

    this.eventDispatcher = new EventDispatcher()

    // This query is being used by a reactive system
    this.reactive = false

    this.key = queryKey(Components)

    // Fill the query with the existing entities
    for (let i = 0; i < Engine.entities.length; i++) {
      const entity = Engine.entities[i]
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
    return hasAllComponents(entity, this.components) && !hasAnyComponents(entity, this.notComponents)
  }

  toJSON() {
    return {
      key: this.key,
      reactive: this.reactive,
      components: {
        included: this.components.map(C => C.name),
        not: this.notComponents.map(C => C.name)
      },
      numEntities: this.entities.length
    }
  }

  /**
   * Return stats for this query
   */
  stats() {
    return {
      numComponents: this.components.length,
      numEntities: this.entities.length
    }
  }
}
