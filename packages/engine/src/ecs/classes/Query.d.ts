import { ComponentConstructor } from "./Component";
import { EventDispatcher } from "./EventDispatcher";
import { NotComponent } from "./System";
export declare class Query {
    components: any[];
    notComponents: any[];
    entities: any[];
    eventDispatcher: EventDispatcher;
    reactive: boolean;
    key: any;
    ENTITY_ADDED: string;
    ENTITY_REMOVED: string;
    COMPONENT_CHANGED: string;
    /**
     * @param {Array(Component)} Components List of types of components to query
     */
    constructor(Components: (ComponentConstructor<any> | NotComponent<any>)[]);
    /**
     * Add entity to this query
     * @param {Entity} entity
     */
    addEntity(entity: any): void;
    /**
     * Remove entity from this query
     * @param {Entity} entity
     */
    removeEntity(entity: any): void;
    match(entity: any): boolean;
    toJSON(): {
        key: any;
        reactive: boolean;
        components: {
            included: any[];
            not: any[];
        };
        numEntities: number;
    };
    /**
     * Return stats for this query
     */
    stats(): {
        numComponents: number;
        numEntities: number;
    };
}
