export interface Attributes {
    priority?: number;
    [propName: string]: any;
}
export interface SystemQueries {
    [queryName: string]: {
        components: (ComponentConstructor<any> | NotComponent<any>)[];
        listen?: {
            added?: boolean;
            removed?: boolean;
            changed?: boolean | ComponentConstructor<any>[];
        };
    };
}
export interface SystemConstructor<T extends System> {
    isSystem: true;
    new (...args: any): T;
}
export interface NotComponent<C extends Component<any>> {
    type: "not";
    Component: ComponentConstructor<C>;
}
import { Component, ComponentConstructor } from "./Component";
import { Entity } from "./Entity";
import { Query } from "./Query";
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
    name: string;
    _queries: {};
    abstract init(attributes?: Attributes): void;
    abstract execute(delta: number, time: number): void;
    canExecute(): boolean;
    constructor(attributes?: Attributes);
    static getName(): any;
    getQuery(components: (ComponentConstructor<any> | NotComponent<any>)[]): Query;
    stop(): void;
    play(): void;
    clearEventQueues(): void;
    toJSON(): {
        name: string;
        enabled: boolean;
        executeTime: number;
        priority: number;
        queries: {};
    };
}
