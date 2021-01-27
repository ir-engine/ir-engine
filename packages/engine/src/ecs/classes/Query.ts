import { queryKeyFromComponents } from '../functions/ComponentFunctions';
import { ComponentConstructor } from '../interfaces/ComponentInterfaces';
import { EventDispatcher } from './EventDispatcher';
import { Engine } from './Engine';
import { NotComponent } from './System';
import { hasAllComponents, hasAnyComponents } from '../functions/EntityFunctions';
import { Entity } from './Entity';
import { QUERY_ENTITY_ADDED, QUERY_ENTITY_REMOVED } from '../constants/Events';

/** Interface for stats of a {@link Query}. */
export interface QueryStatType {
  /** Number of Components in this query. */
  numComponents: number,
  /** Number of Entities matched in this query. */
  numEntities: number,
}

/** Interface of Serialized {@link Query}. */
export interface QuerySerializeType {
  /** Key of the query. */
  key: any,
  /** Is Query reactive. */
  reactive: boolean,
  /** Number of Entities matched in this query. */
  numEntities: number,
  /** List of Components included or not included in this query.  */
  components: {
    /** List of components. */
    included: any[],

    /** List of non components. */
    not: any[],
  }
}

/**
 * Class to handle a system query.\
 * Queries are how systems identify entities with specified components.
 */
export class Query {
  /**
   * List of components to look for in this query.
   */
  components: any[]

  /**
   * List of components to use to filter out entities.
   */
  notComponents: any[]

  /**
   * List of entities currently attached to this query.
   * @todo: This could be optimized with a ringbuffer or sparse array
   */
  entities: any[]

  /**
   * Event dispatcher associated with this query.
   */
  eventDispatcher: EventDispatcher

  /**
   * Is the query reactive?\
   * Reactive queries respond to listener events - onChanged, onAdded and onRemoved.
   */
  reactive: boolean

  /**
   * Key for looking up the query.
   */
  key: any

  /**
   * Constructor called when system creates query.
   * 
   * @param Components List of Components. At least one component object is required to create query.
   */
  constructor (Components: Array<ComponentConstructor<any> | NotComponent<any>>) {
    this.components = [];
    this.notComponents = [];

    Components.forEach(component => {
      if (typeof component === 'object') {
        this.notComponents.push((component as any).Component);
      } else {
        this.components.push(component);
      }
    });

    if (this.components.length === 0) {
      throw new Error("Can't create a query without components");
    }

    this.entities = [];

    this.eventDispatcher = new EventDispatcher();

    // This query is being used by a reactive system
    this.reactive = false;

    this.key = queryKeyFromComponents(Components);

    // Fill the query with the existing entities
    for (let i = 0; i < Engine.entities.length; i++) {
      const entity = Engine.entities[i];
      if (this.match(entity)) {
        entity.queries.push(this);
        this.entities.push(entity);
      }
    }
  }

  /**
   * Add entity to this query.
   * @param entity Entity to be added.
   */
  addEntity (entity: Entity): void {
    entity.queries.push(this);
    this.entities.push(entity);

    this.eventDispatcher.dispatchEvent(QUERY_ENTITY_ADDED, entity);
  }

  /**
   * Remove entity from this query.
   * @param entity Entity to be removed.
   */
  removeEntity(entity: Entity): void {
    let index = this.entities.indexOf(entity);
    if (~index) {
      this.entities.splice(index, 1);

      index = entity.queries.indexOf(this);
      entity.queries.splice(index, 1);

      this.eventDispatcher.dispatchEvent(QUERY_ENTITY_REMOVED, entity);
    }
  }

  /**
   * Check if an entity matches this query.
   * 
   * @param entity Entity to be matched for this query.
   */
  match (entity: Entity): boolean {
    return hasAllComponents(entity, this.components) && !hasAnyComponents(entity, this.notComponents);
  }

  /**
   * Serialize query to JSON.
   */
  toJSON (): QuerySerializeType {
    return {
      key: this.key,
      reactive: this.reactive,
      components: {
        included: this.components.map(C => C.name),
        not: this.notComponents.map(C => C.name)
      },
      numEntities: this.entities.length
    };
  }

  /**
   * Return stats for this query.
   */
  stats (): QueryStatType {
    return {
      numComponents: this.components.length,
      numEntities: this.entities.length
    };
  }
}
