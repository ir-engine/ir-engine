import Query from "./Query"
import { queryKey } from "./Utils"
import { World } from "./World"

/**
 * @private
 * @class QueryManager
 */
export default class QueryManager {
  _world: World
  _queries: {}
  _entities: any
  constructor(world: World) {
    this._world = world

    // Queries indexed by a unique identifier for the components it has
    this._queries = {}
  }

  onEntityRemoved(entity) {
    for (const queryName in this._queries) {
      const query = this._queries[queryName]
      if (entity.queries.indexOf(query) !== -1) {
        query.removeEntity(entity)
      }
    }
  }

  /**
   * Callback when a component is added to an entity
   * @param {Entity} entity Entity that just got the new component
   * @param {Component} Component Component added to the entity
   */
  onEntityComponentAdded(entity, Component) {
    // @todo Use bitmask for checking components?

    // Check each indexed query to see if we need to add this entity to the list
    for (const queryName in this._queries) {
      const query = this._queries[queryName]

      if (!!~query.NotComponents.indexOf(Component) && ~query.entities.indexOf(entity)) {
        query.removeEntity(entity)
        continue
      }

      // Add the entity only if:
      // Component is in the query
      // and Entity has ALL the components of the query
      // and Entity is not already in the query
      if (!~query.Components.indexOf(Component) || !query.match(entity) || ~query.entities.indexOf(entity)) continue

      query.addEntity(entity)
    }
  }

  /**
   * Callback when a component is removed from an entity
   * @param {Entity} entity Entity to remove the component from
   * @param {Component} Component Component to remove from the entity
   */
  onEntityComponentRemoved(entity, Component) {
    for (const queryName in this._queries) {
      const query = this._queries[queryName]

      if (!!~query.NotComponents.indexOf(Component) && !~query.entities.indexOf(entity) && query.match(entity)) {
        query.addEntity(entity)
        continue
      }

      if (!!~query.Components.indexOf(Component) && !!~query.entities.indexOf(entity) && !query.match(entity)) {
        query.removeEntity(entity)
        continue
      }
    }
  }

  /**
   * Get a query for the specified components
   * @param {Component} Components Components that the query should have
   */
  getQuery(Components) {
    const key = queryKey(Components)
    let query = this._queries[key]
    if (!query) {
      this._queries[key] = query = new Query(Components, this)
    }
    return query
  }

  /**
   * Return some stats from this class
   */
  stats() {
    const stats = {}
    for (const queryName in this._queries) {
      stats[queryName] = this._queries[queryName].stats()
    }
    return stats
  }
}
