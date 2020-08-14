export interface Attributes {
  priority?: number
  [propName: string]: any
}

export interface SystemQueries {
  [queryName: string]: {
    components: (ComponentConstructor<any> | NotComponent<any>)[]
    listen?: {
      added?: boolean
      removed?: boolean
      changed?: boolean | ComponentConstructor<any>[]
    }
  }
}

export interface SystemConstructor<T extends System> {
  isSystem: true
  new (...args: any): T
}

export interface NotComponent<C extends Component<any>> {
  type: "not"
  Component: ComponentConstructor<C>
}

// /**
//  * Use the Not class to negate a component query.
//  */
// export function Not<C extends Component<any>>(Component: ComponentConstructor<C>): NotComponent<C>;

import { getQuery } from "../functions/QueryFunctions"
import { Component, ComponentConstructor } from "./Component"
import { Entity } from "./Entity"
import Query from "./Query"
import { componentRegistered } from "../functions/Utils"

export abstract class System {
  /**
   * Defines what Components the System will query for.
   * This needs to be user defined.
   */
  static queries: SystemQueries

  static isSystem: true
  _mandatoryQueries: any
  priority: number
  executeTime: number
  initialized: boolean

  /**
   * The results of the queries.
   * Should be used inside of execute.
   */
  queries: {
    [queryName: string]: {
      results?: Entity[]
      added?: Entity[]
      removed?: Entity[]
      changed?: Entity[]
    }
  }

  /**
   * Whether the system will execute during the world tick.
   */
  enabled: boolean
  name: string

  abstract init(attributes?: Attributes): void
  abstract execute(delta: number, time: number): void

  canExecute(): boolean {
    if (this._mandatoryQueries.length === 0) return true

    for (let i = 0; i < this._mandatoryQueries.length; i++) {
      const query = this._mandatoryQueries[i]
      if (query.entities.length === 0) {
        return false
      }
    }

    return true
  }

  constructor(attributes?: Attributes) {
    this.enabled = true

    // @todo Better naming :)
    this.queries = {}
    this.queries = {}

    this.priority = 0

    // Used for stats
    this.executeTime = 0

    if (attributes && attributes.priority) {
      this.priority = attributes.priority
    }

    this._mandatoryQueries = []

    this.initialized = true

    if (this.queries) {
      for (const queryName in this.queries) {
        const queryConfig = this.queries[queryName]
        const Components = queryConfig.results
        if (!Components || Components.length === 0) {
          throw new Error("'components' attribute can't be empty in a query")
        }

        // Detect if the components have already been registered
        const unregisteredComponents = Components.filter(Component => !componentRegistered(Component))

        if (unregisteredComponents.length > 0) {
          throw new Error(
            `Tried to create a query '${queryName}.${queryName}' with unregistered components: [${unregisteredComponents.map(
              c => typeof c
            )}]`
          )
        }

        const query = getQuery(Components)

        this.queries[queryName] = query
        this._mandatoryQueries.push(query)
        this.queries[queryName] = {
          results: query.entities
        }

        // Reactive configuration added/removed/changed
        const validEvents = ["added", "removed", "changed"]

        const eventMapping = {
          added: Query.prototype.ENTITY_ADDED,
          removed: Query.prototype.ENTITY_REMOVED,
          changed: Query.prototype.COMPONENT_CHANGED // Query.prototype.ENTITY_CHANGED
        }
        const q = queryConfig as any
        if (q.listen) {
          validEvents.forEach(eventName => {
            if (!this.execute) {
              console.warn(
                `System '${this.name}' has defined listen events (${validEvents.join(
                  ", "
                )}) for query '${queryName}' but it does not implement the 'execute' method.`
              )
            }

            // Is the event enabled on this system's query?
            if (q.listen[eventName]) {
              const event = q.listen[eventName]

              if (eventName === "changed") {
                query.reactive = true
                if (event === true) {
                  // Any change on the entity from the components in the query
                  const eventList = (this.queries[queryName][eventName] = [])
                  query.eventDispatcher.addEventListener(Query.prototype.COMPONENT_CHANGED, entity => {
                    // Avoid duplicates
                    if (eventList.indexOf(entity) === -1) {
                      eventList.push(entity)
                    }
                  })
                } else if (Array.isArray(event)) {
                  const eventList = (this.queries[queryName][eventName] = [])
                  query.eventDispatcher.addEventListener(
                    Query.prototype.COMPONENT_CHANGED,
                    (entity, changedComponent) => {
                      // Avoid duplicates
                      if (event.indexOf(changedComponent.constructor) !== -1 && eventList.indexOf(entity) === -1) {
                        eventList.push(entity)
                      }
                    }
                  )
                }
              } else {
                const eventList = (this.queries[queryName][eventName] = [])

                query.eventDispatcher.addEventListener(eventMapping[eventName], entity => {
                  // @fixme overhead?
                  if (eventList.indexOf(entity) === -1) eventList.push(entity)
                })
              }
            }
          })
        }
      }
    }
  }

  stop(): void {
    this.executeTime = 0
    this.enabled = false
  }

  play(): void {
    this.enabled = true
  }

  clearEventQueues(): void {
    for (const queryName in this.queries) {
      const query = this.queries[queryName]
      if (query.added) {
        query.added.length = 0
      }
      if (query.removed) {
        query.removed.length = 0
      }
      if (query.changed) {
        if (Array.isArray(query.changed)) {
          query.changed.length = 0
        } else {
          for (const name in query.changed as any) {
            const q = query.changed[name] as any
            q.length = 0
          }
        }
      }
    }
  }

  toJSON() {
    const json = {
      name: this.name,
      enabled: this.enabled,
      executeTime: this.executeTime,
      priority: this.priority,
      queries: {}
    }

    if (this.queries) {
      const queries = this.queries
      for (const queryName in queries) {
        const query = this.queries[queryName]
        const queryDefinition = queries[queryName] as any
        const jsonQuery = (json.queries[queryName] = {
          key: queryName
        })
        const j = jsonQuery as any
        j.mandatory = queryDefinition.mandatory === true
        j.reactive =
          queryDefinition.listen &&
          (queryDefinition.listen.added === true ||
            queryDefinition.listen.removed === true ||
            queryDefinition.listen.changed === true ||
            Array.isArray(queryDefinition.listen.changed))

        if ((jsonQuery as any).reactive) {
          const j = jsonQuery as any
          j.listen = {}

          const methods = ["added", "removed", "changed"]
          methods.forEach(method => {
            if (query[method]) {
              j.listen[method] = {
                entities: query[method].length
              }
            }
          })
        }
      }
    }

    return json
  }
}

System.isSystem = true
