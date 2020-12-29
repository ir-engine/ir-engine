import { QUERY_COMPONENT_CHANGED, QUERY_ENTITY_ADDED, QUERY_ENTITY_REMOVED } from '../constants/Events';
import { componentRegistered, hasRegisteredComponent, queryKeyFromComponents, registerComponent } from '../functions/ComponentFunctions';
import { SystemUpdateType } from '../functions/SystemUpdateType';
import { ComponentConstructor } from '../interfaces/ComponentInterfaces';
import { Component } from './Component';
import { Engine } from './Engine';
import { Entity } from './Entity';
import { Query } from './Query';

export interface SystemAttributes {
  priority?: number;
  [propName: string]: any;
}

export interface SystemQueries {
  [queryName: string]: {
    components: Array<ComponentConstructor<any> | NotComponent<any>>;
    listen?: {
      added?: boolean;
      removed?: boolean;
      changed?: boolean | Array<ComponentConstructor<any>>;
    };
  };
}

export interface SystemConstructor<T extends System> {
  isSystem: true;
  new (...args: any): T;
}

export interface NotComponent<C extends Component<any>> {
  type: 'not';
  Component: ComponentConstructor<C>;
}

export abstract class System {
  /**
   * Defines what Components the System will query for.
   * This needs to be user defined.
   */
  static queries: SystemQueries = {}

  static isSystem: true
  _mandatoryQueries: any
  priority: number
  executeTime: number
  initialized: boolean

  updateType = SystemUpdateType.Free

  /**
   * The results of the queries.
   * Should be used inside of execute.
   */
  queryResults: {
    [queryName: string]: {
      all?: Entity[];
      added?: Entity[];
      removed?: Entity[];
      changed?: Entity[];
    };
  } = {}

  /**
   * Whether the system will execute during the world tick.
   */
  enabled: boolean
  name: string
  _queries: {} = {}
  execute? (delta: number, time: number): void

  constructor (attributes?: SystemAttributes) {
    this.enabled = true;

    // @todo Better naming :)
    this._queries = {};
    this.queryResults = {};

    this.priority = 0;

    // Used for stats
    this.executeTime = 0;

    if (attributes && attributes.priority) {
      this.priority = attributes.priority;
    }

    this._mandatoryQueries = [];

    this.initialized = true;

    if ((this.constructor as any).queries) {
      for (const queryName in (this.constructor as any).queries) {
        const queryConfig = (this.constructor as any).queries[queryName];
        const Components = queryConfig.components;
        if (!Components || Components.length === 0) {
          throw new Error("'components' attribute can't be empty in a query");
        }

        // Detect if the components have already been registered
        const unregisteredComponents: any[] = Components.filter(Component => !componentRegistered(Component));

        if (unregisteredComponents.length > 0) {
          unregisteredComponents.forEach(component => {
            if(!hasRegisteredComponent(component)) registerComponent(component);
          });
        }

        // TODO: Solve this
        const query = this.getQuery(Components);

        this._queries[queryName] = query;
        if ((queryConfig).mandatory === true) {
          this._mandatoryQueries.push(query);
        }
        this.queryResults[queryName] = {
          all: query.entities
        };

        // Reactive configuration added/removed/changed
        const validEvents = ['added', 'removed', 'changed'];

        const eventMapping = {
          added: QUERY_ENTITY_ADDED,
          removed: QUERY_ENTITY_REMOVED,
          changed: QUERY_COMPONENT_CHANGED
        };
        const q = queryConfig;
        if (q.listen) {
          validEvents.forEach(eventName => {

            // Is the event enabled on this system's query?
            if (q.listen[eventName]) {
              const event = q.listen[eventName];
 
              if (eventName === 'changed') {
                query.reactive = true;
                if (event === true) {
                  // Any change on the entity from the components in the query
                  const eventList = (this.queryResults[queryName][eventName] = []);
                  query.eventDispatcher.addEventListener(QUERY_COMPONENT_CHANGED, entity => {
                    // Avoid duplicates
                    if (!eventList.includes(entity)) {
                      eventList.push(entity);
                    }
                  });
                } else if (Array.isArray(event)) {
                  const eventList = (this.queryResults[queryName][eventName] = []);
                  query.eventDispatcher.addEventListener(
                    QUERY_COMPONENT_CHANGED,
                    (entity, changedComponent) => {
                      // Avoid duplicates
                      if (event.includes(changedComponent.constructor) && !eventList.includes(entity)) {
                        eventList.push(entity);
                      }
                    }
                  );
                }
              } else {
                const eventList = (this.queryResults[queryName][eventName] = []);

                query.eventDispatcher.addEventListener(eventMapping[eventName], entity => {
                  // @fixme overhead?
                  if (!eventList.includes(entity)) eventList.push(entity);
                });
              }
            }
          });
        }
        Engine.queries.push(query);
      }
    }

    const c = (this.constructor as any).prototype;
    c.order = Engine.systems.length;
  }

  static getName () {
    return (this.constructor as any).getName();
  }

  getQuery (components: Array<ComponentConstructor<any> | NotComponent<any>>): Query {
    const key = queryKeyFromComponents(components);
    let query = this._queries[key];
    if (!query) {
      this._queries[key] = query = new Query(components);
    }
    return query;
  }

  stop (): void {
    this.executeTime = 0;
    this.enabled = false;
  }

  play (): void {
    this.enabled = true;
  }


  clearEventQueues (): void {
    for (const queryName in this.queryResults) {
      const query = this.queryResults[queryName];
      if (query.added) {
        query.added.length = 0;
      }
      if (query.removed) {
        query.removed.length = 0;
      }
      if (query.changed) {
        if (Array.isArray(query.changed)) {
          query.changed.length = 0;
        } else {
          for (const name in query.changed as any) {
            (query.changed as any)[name].length = 0;
          }
        }
      }
    }
  }
dispose(){
  
}
  toJSON () {
    const json = {
      name: this.name,
      enabled: this.enabled,
      executeTime: this.executeTime,
      priority: this.priority,
      queries: {}
    };

    if (this.queryResults) {
      const queries = (this.constructor as any).queries;
      for (const queryName in queries) {
        const query = this.queryResults[queryName];
        const queryDefinition = queries[queryName] as any;
        const jsonQuery = (json.queries[queryName] = {
          key: this._queries[queryName].key
        });
        const j = jsonQuery as any;
        j.mandatory = queryDefinition.mandatory === true;
        j.reactive =
          queryDefinition.listen &&
          (queryDefinition.listen.added === true ||
            queryDefinition.listen.removed === true ||
            queryDefinition.listen.changed === true ||
            Array.isArray(queryDefinition.listen.changed));

        if ((jsonQuery as any).reactive) {
          const j = jsonQuery as any;
          j.listen = {};

          const methods = ['added', 'removed', 'changed'];
          methods.forEach(method => {
            if (query[method]) {
              j.listen[method] = {
                entities: query[method].length
              };
            }
          });
        }
      }
    }

    return json;
  }
}

System.isSystem = true;
System.getName = function () {
  return this.name;
};