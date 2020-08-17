import { Component, ComponentConstructor } from "../classes/Component";
import { Entity } from "../classes/Entity";
import { ObjectPool } from "../classes/ObjectPool";
export declare const COMPONENT_ADDED = "EntityManager#COMPONENT_ADDED";
export declare const COMPONENT_REMOVE = "EntityManager#COMPONENT_REMOVE";
export declare function Not(Component: any): {
    type: "not";
    Component: any;
};
export declare function wrapImmutableComponent<T>(component: Component<T>): T;
export declare function registerComponent<C extends Component<any>>(Component: ComponentConstructor<C>, objectPool?: ObjectPool<C> | false): void;
export declare function hasRegisteredComponent<C extends Component<any>>(Component: ComponentConstructor<C>): boolean;
export declare function componentAddedToEntity(component: Component<any>): void;
export declare function componentRemovedFromEntity(component: Component<any>): void;
export declare function getPoolForComponent(component: Component<any>): void;
export declare function addComponentToEntity(entity: Entity, Component: ComponentConstructor<Component<any>>, values: any): void;
/**
 * Remove a component from an entity
 * @param {Entity} entity Entity which will get removed the component
 * @param {*} component Component to remove from the entity
 * @param {Bool} immediately If you want to remove the component immediately instead of deferred (Default is false)
 */
export declare function removeComponentFromEntity(entity: Entity, component: any, immediately?: boolean): void;
export declare function onEntityComponentRemoved(entity: any, component: any): void;
export declare function removeComponentFromEntitySync(entity: Entity, component: Component<any>, index: number): void;
export declare function removeAllComponentsFromEntity(entity: Entity, immediately?: boolean): void;
