import { SystemUpdateType } from '../functions/SystemUpdateType';
import { ComponentConstructor } from '../interfaces/ComponentInterfaces';
import { Component } from './Component';
import { Entity } from './Entity';
import { Query } from './Query';
/** Interface for System attributes. */
export interface SystemAttributes {
    /** Priority of an Attribute. */
    priority?: number;
    /** Name of the property. */
    [propName: string]: any;
}
/** Interface for system queries. */
export interface SystemQueries {
    /** @param queryName name of query. */
    [queryName: string]: {
        components: Array<ComponentConstructor<any> | NotComponent<any>>;
        /** Whether query listens to events like added, removed or changed. */
        listen?: {
            added?: boolean;
            removed?: boolean;
            changed?: boolean | Array<ComponentConstructor<any>>;
        };
    };
}
/** Interface for system */
export interface SystemConstructor<T extends System> {
    isSystem: true;
    new (...args: any): T;
}
/**
 * Interface for not components.
 *
 * @typeparam C Subclass of {@link ecs/classes/Component.Component | Component}.
 **/
export interface NotComponent<C extends Component<any>> {
    /** Type is set to 'not' to make a not component. */
    type: 'not';
    /** Component object. */
    Component: ComponentConstructor<C>;
}
/**
 * Abstract class to define System properties.
 */
export declare abstract class System {
    /**
     * Defines what Components the System will query for.
     * This needs to be user defined.
     */
    static queries: SystemQueries;
    static isSystem: true;
    _mandatoryQueries: any;
    priority: number;
    executeTime: number;
    initialized: boolean;
    updateType: SystemUpdateType;
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
    };
    /**
     * Whether the system will execute during the world tick.
     */
    enabled: boolean;
    /** Name of the System. */
    name: string;
    /** Queries of system instances. */
    _queries: {};
    /** Execute Method definition. */
    execute?(delta: number, time: number): void;
    /**
     * Initializes system
     * @param attributes User defined system attributes.
     */
    constructor(attributes?: SystemAttributes);
    /** Get name of the System */
    static getName(): string;
    /**
     * Get query from the component.
     *
     * @param components List of components either component or not component.
     */
    getQuery(components: Array<ComponentConstructor<any> | NotComponent<any>>): Query;
    /** Stop the system. */
    stop(): void;
    /** Plays the system. */
    play(): void;
    /** Clears event queues. */
    clearEventQueues(): void;
    dispose(): void;
    /** Serialize the System */
    toJSON(): any;
}
