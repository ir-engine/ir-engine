import { QUERY_COMPONENT_CHANGED, QUERY_ENTITY_ADDED, QUERY_ENTITY_REMOVED } from '../constants/Events'
import {
  componentRegistered,
  hasRegisteredComponent,
  queryKeyFromComponents,
  registerComponent
} from '../functions/ComponentFunctions'
import { SystemUpdateType } from '../functions/SystemUpdateType'
import { ComponentConstructor } from '../interfaces/ComponentInterfaces'
import { Component } from './Component'
import { Engine } from './Engine'
import { Entity } from './Entity'
import { Query } from './Query'
import { now } from '../../common/functions/now'

/** Interface for system queries. */
export interface SystemQueries {
  /** @param queryName name of query. */
  [queryName: string]: {
    components: Array<ComponentConstructor<any> | NotComponent<any>>

    /** Whether query listens to events like added, removed or changed. */
    listen?: {
      added?: boolean
      removed?: boolean
      changed?: boolean | Array<ComponentConstructor<any>>
    }
  }
}

/** Interface for system */
export interface SystemConstructor<T extends System, A> {
  isSystem: true
  updateType: SystemUpdateType
  new (attributes: A): T
}

/**
 * Interface for not components.
 *
 * @author Fernando Serrano, Robert Long
 * @typeparam C Subclass of {@link ecs/classes/Component.Component | Component}.
 **/
export interface NotComponent<C extends Component<any>> {
  /** Type is set to 'not' to make a not component. */
  type: 'not'

  /** Component object. */
  Component: ComponentConstructor<C>
}

/**
 * A Class which holds all the active systems.\
 * It will store systems based on its update type.
 */
export class ActiveSystems {
  /** Free update systems. */
  [SystemUpdateType.Free]: System[] = [];
  /** Fixed update systems. */
  [SystemUpdateType.Fixed]: System[] = [];
  /** Network update systems. */
  [SystemUpdateType.Network]: System[] = []

  /**
   * Adds system to active system array based on its update type.
   * @param system System being added.
   */
  add(updateType: SystemUpdateType, system: System) {
    this[updateType].push(system)
  }

  /**
   * Returns all active system arrays concatenated.
   */
  getAll() {
    return [...this[SystemUpdateType.Free], ...this[SystemUpdateType.Fixed], ...this[SystemUpdateType.Network]]
  }

  /**
   * Clears active system arrays.
   */
  clear() {
    this[SystemUpdateType.Free] = []
    this[SystemUpdateType.Fixed] = []
    this[SystemUpdateType.Network] = []
  }

  /**
   * Removes system from active array.
   * @param system System being removed.
   */
  remove(updateType: SystemUpdateType, system: System) {
    this[updateType].splice(this[updateType].indexOf(system), 1)
  }

  /**
   * Executes systems of provided update type.
   * @param delta Time since last frame.
   * @param time Current time.
   * @param updateType Update type of the system which will be executed.
   */
  execute(delta: number, time: number, updateType: SystemUpdateType) {
    this[updateType].forEach((system) => {
      if (system.initialized && system.enabled) {
        const startTime = now()
        system.execute!(delta, time)
        system.executeTime = now() - startTime
        system.clearEventQueues()
      }
    })
  }

  /**
   * Executes all the systems of all update type.
   * @param delta Time since last frame.
   * @param time Curremt time.
   */
  executeAll(delta: number, time: number) {
    this.execute(delta, time, SystemUpdateType.Free)
    this.execute(delta, time, SystemUpdateType.Fixed)
    this.execute(delta, time, SystemUpdateType.Network)
  }
}

/**
 * Abstract class to define System properties.
 *
 * @author Fernando Serrano, Robert Long
 */
export abstract class System {
  /**
   * Defines what Components the System will query for.
   * This needs to be user defined.
   *
   * @author Fernando Serrano, Robert Long
   */
  static queries: SystemQueries = {}

  static isSystem: true
  static updateType: SystemUpdateType

  _mandatoryQueries: any

  executeTime: number
  initialized: boolean

  /**
   * The results of the queries.
   * Should be used inside of execute.
   *
   * @author Fernando Serrano, Robert Long
   */
  queryResults: {
    [queryName: string]: {
      all?: Entity[]
      added?: Entity[]
      removed?: Entity[]
      changed?: Entity[]
    }
  } = {}

  /**
   * Whether the system will execute during the world tick.
   *
   * @author Fernando Serrano, Robert Long
   */
  enabled: boolean

  /** Name of the System. */
  name: string

  /** Queries of system instances. */
  _queries: {} = {}

  /** Execute Method definition. */
  execute?(delta: number, time: number): void

  async initialize(): Promise<any> {
    this.initialized = true
    return
  }

  /**
   * Initializes system
   *
   * @author Fernando Serrano, Robert Long
   */
  constructor(_?: any) {
    const _name = (this.constructor as any).getName()
    const name = _name.substr(0, 1) === '_' ? _name.slice(1) : _name
    this.name = name

    this.enabled = true

    // @todo Better naming :)
    this._queries = {}
    this.queryResults = {}

    // Used for stats
    this.executeTime = 0

    this._mandatoryQueries = []

    if ((this.constructor as any).queries) {
      for (const queryName in (this.constructor as any).queries) {
        const queryConfig = (this.constructor as any).queries[queryName]
        const Components = queryConfig.components
        if (!Components || Components.length === 0) {
          throw new Error("'components' attribute can't be empty in a query")
        }

        // Detect if the components have already been registered
        const unregisteredComponents: any[] = Components.filter((Component) => !componentRegistered(Component))

        if (unregisteredComponents.length > 0) {
          unregisteredComponents.forEach((component) => {
            if (!hasRegisteredComponent(component)) registerComponent(component)
          })
        }

        // TODO: Solve this
        const query = this.getQuery(Components)

        this._queries[queryName] = query
        if (queryConfig.mandatory === true) {
          this._mandatoryQueries.push(query)
        }
        this.queryResults[queryName] = {
          all: query.entities
        }

        // Reactive configuration added/removed/changed
        const validEvents = ['added', 'removed', 'changed']

        const eventMapping = {
          added: QUERY_ENTITY_ADDED,
          removed: QUERY_ENTITY_REMOVED,
          changed: QUERY_COMPONENT_CHANGED
        }
        const q = queryConfig
        if (q.listen) {
          validEvents.forEach((eventName) => {
            // Is the event enabled on this system's query?
            if (q.listen[eventName]) {
              const event = q.listen[eventName]

              if (eventName === 'changed') {
                query.reactive = true
                if (event === true) {
                  // Any change on the entity from the components in the query
                  const eventList = (this.queryResults[queryName][eventName] = [])
                  query.eventDispatcher.addEventListener(QUERY_COMPONENT_CHANGED, (entity) => {
                    // Avoid duplicates
                    if (!eventList.includes(entity)) {
                      eventList.push(entity)
                    }
                  })
                } else if (Array.isArray(event)) {
                  const eventList = (this.queryResults[queryName][eventName] = [])
                  query.eventDispatcher.addEventListener(QUERY_COMPONENT_CHANGED, (entity, changedComponent) => {
                    // Avoid duplicates
                    if (event.includes(changedComponent.constructor) && !eventList.includes(entity)) {
                      eventList.push(entity)
                    }
                  })
                }
              } else {
                const eventList = (this.queryResults[queryName][eventName] = [])

                query.eventDispatcher.addEventListener(eventMapping[eventName], (entity) => {
                  // @fixme overhead?
                  if (!eventList.includes(entity)) eventList.push(entity)
                })
              }
            }
          })
        }
        Engine.queries.push(query)
      }
    }

    const c = (this.constructor as any).prototype
    c.order = Engine.systems.length
  }

  /** Get name of the System */
  static getName(): string {
    const name: string = (this.constructor as any).getName()
    return name.substr(0, 1) === '_' ? name.slice(1) : name
  }

  /**
   * Get query from the component.
   *
   * @author Fernando Serrano, Robert Long
   * @param components List of components either component or not component.
   */
  getQuery(components: Array<ComponentConstructor<any> | NotComponent<any>>): Query {
    const key = queryKeyFromComponents(components)
    let query = this._queries[key]
    if (!query) {
      this._queries[key] = query = new Query(components)
    }
    return query
  }

  /** Stop the system. */
  stop(): void {
    this.executeTime = 0
    this.enabled = false
  }

  /** Plays the system. */
  play(): void {
    this.enabled = true
  }

  /** Clears event queues. */
  clearEventQueues(): void {
    for (const queryName in this.queryResults) {
      const query = this.queryResults[queryName]
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
            ;(query.changed as any)[name].length = 0
          }
        }
      }
    }
  }

  /**
   * @function reset Reset the system. Used for resetting the system without disposing of events and other hooks.
   */
  reset(): void {}

  /**
   * @function reset Dispose the system. Used for completely removing everything in this system from memory.
   */
  dispose(): void {}

  /** Serialize the System */
  toJSON(): any {
    const json = {
      name: this.name,
      enabled: this.enabled,
      executeTime: this.executeTime,
      queries: {}
    }

    if (this.queryResults) {
      const queries = (this.constructor as any).queries
      for (const queryName in queries) {
        const query = this.queryResults[queryName]
        const queryDefinition = queries[queryName] as any
        const jsonQuery = (json.queries[queryName] = {
          key: this._queries[queryName].key
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

          const methods = ['added', 'removed', 'changed']
          methods.forEach((method) => {
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
System.getName = function () {
  return this.name
}
