import { ComponentConstructor } from '../interfaces/ComponentInterfaces';
import { EventDispatcher } from './EventDispatcher';
import { NotComponent } from './System';
import { Entity } from './Entity';
/** Interface for stats of a {@link Query}. */
export interface QueryStatType {
    /** Number of Components in this query. */
    numComponents: number;
    /** Number of Entities matched in this query. */
    numEntities: number;
}
/** Interface of Serialized {@link Query}. */
export interface QuerySerializeType {
    /** Key of the query. */
    key: any;
    /** Is Query reactive. */
    reactive: boolean;
    /** Number of Entities matched in this query. */
    numEntities: number;
    /** List of Components included or not included in this query.  */
    components: {
        /** List of components. */
        included: any[];
        /** List of non components. */
        not: any[];
    };
}
/**
 * Class to handle a system query.\
 * Queries are how systems identify entities with specified components.
 */
export declare class Query {
    /**
     * List of components to look for in this query.
     */
    components: any[];
    /**
     * List of components to use to filter out entities.
     */
    notComponents: any[];
    /**
     * List of entities currently attached to this query.
     * @todo: This could be optimized with a ringbuffer or sparse array
     */
    entities: any[];
    /**
     * Event dispatcher associated with this query.
     */
    eventDispatcher: EventDispatcher;
    /**
     * Is the query reactive?\
     * Reactive queries respond to listener events - onChanged, onAdded and onRemoved.
     */
    reactive: boolean;
    /**
     * Key for looking up the query.
     */
    key: any;
    /**
     * Constructor called when system creates query.
     *
     * @param Components List of Components. At least one component object is required to create query.
     */
    constructor(Components: Array<ComponentConstructor<any> | NotComponent<any>>);
    /**
     * Add entity to this query.
     * @param entity Entity to be added.
     */
    addEntity(entity: Entity): void;
    /**
     * Remove entity from this query.
     * @param entity Entity to be removed.
     */
    removeEntity(entity: Entity): void;
    /**
     * Check if an entity matches this query.
     *
     * @param entity Entity to be matched for this query.
     */
    match(entity: Entity): boolean;
    /**
     * Serialize query to JSON.
     */
    toJSON(): QuerySerializeType;
    /**
     * Return stats for this query.
     */
    stats(): QueryStatType;
}
