import { Object3D } from "three";
import { Behavior } from "../../interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { ComponentConstructor, Component } from "../../../ecs/classes/Component";
export declare function addTagComponentFromBehavior<C>(entity: Entity, args: {
    component: ComponentConstructor<Component<C>>;
}): void;
export declare const addObject3DComponent: Behavior;
export declare function removeObject3DComponent(entity: any, unparent?: boolean): void;
export declare function remove(entity: any, forceImmediate: any): void;
export declare function getObject3D(entity: any): Object3D;
export declare function getComponentTags(object3d: Object3D): Component<any>[];
