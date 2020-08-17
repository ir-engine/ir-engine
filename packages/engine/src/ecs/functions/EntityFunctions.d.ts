import { Component, ComponentConstructor } from "../classes/Component";
import { Entity } from "../classes/Entity";
export declare const ENTITY_CREATED = "EntityManager#ENTITY_CREATE";
export declare const ENTITY_REMOVED = "EntityManager#ENTITY_REMOVED";
export declare function getMutableComponent<C extends Component<any>>(entity: Entity, Component: ComponentConstructor<C> | any): C;
export declare function getRemovedComponent<C extends Component<any>>(entity: Entity, Component: ComponentConstructor<C>): Readonly<C>;
export declare function getComponentsFromEntity(entity: Entity): {
    [componentName: string]: ComponentConstructor<any>;
};
export declare function getComponentsToRemove(entity: Entity): {
    [componentName: string]: ComponentConstructor<any>;
};
export declare function getComponentTypes(entity: Entity): Array<Component<any>>;
export declare function addComponentToEntity<C extends Component<any>>(entity: Entity, Component: ComponentConstructor<C>, values?: Partial<Omit<C, keyof Component<any>>>): Entity;
export declare function removeComponentFromEntity<C extends Component<any>>(entity: Entity, Component: ComponentConstructor<C>, forceImmediate?: boolean): Entity;
export declare function entityHasComponent<C extends Component<any>>(entity: Entity, Component: ComponentConstructor<C>, includeRemoved?: boolean): boolean;
export declare function hasRemovedComponent<C extends Component<any>>(entity: Entity, Component: ComponentConstructor<C>): boolean;
export declare function hasAllComponents(entity: Entity, Components: Array<ComponentConstructor<any>>): boolean;
export declare function hasAnyComponents(entity: Entity, Components: Array<ComponentConstructor<any>>): boolean;
export declare function removeAllComponents(entity: Entity, forceImmediate?: boolean): void;
export declare function getEntityByName(name: any): any;
export declare function onEntityRemoved(entity: any): void;
export declare function onEntityComponentAdded(entity: any, Component: any): void;
export declare function createEntity(name?: string): Entity;
export declare function removeEntity(entity: Entity, immediately?: boolean): void;
export declare function removeAllEntities(): void;
export declare function releaseEntity(entity: Entity, index: number): void;
export declare function processDeferredEntityRemoval(): void;
export declare function getComponentOnEntity<C extends Component<C>>(entity: Entity, component: ComponentConstructor<C> | unknown, includeRemoved?: boolean): Readonly<C>;
