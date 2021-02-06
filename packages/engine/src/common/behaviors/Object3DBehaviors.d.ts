/** This Module contains function to perform different operations on
 *    {@link https://threejs.org/docs/#api/en/core/Object3D | Object3D } from three.js library.
 * @packageDocumentation
 * */
import { Object3D } from "three";
import { Behavior } from '../interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { Component } from '../../ecs/classes/Component';
import { ComponentConstructor } from '../../ecs/interfaces/ComponentInterfaces';
/**
 * Add Component into Entity from the Behavior.
 * @param entity Entity in which component will be added.
 * @param args Args contains Component and args of Component which will be added into the Entity.
 */
export declare function addComponentFromBehavior<C>(entity: Entity, args: {
    component: ComponentConstructor<Component<C>>;
    objArgs: any;
}): void;
/**
 * Add Tag Component with into Entity from the Behavior.
 * @param entity Entity in which component will be added.
 * @param args Args contains Component which will be added into the Entity.
 */
export declare function addTagComponentFromBehavior<C>(entity: Entity, args: {
    component: ComponentConstructor<Component<C>>;
}): void;
/**
 * Add Object3D Component with args into Entity from the Behavior.
 */
export declare const addObject3DComponent: Behavior;
/**
 * Remove Object3D Component from the Entity.
 * @param entity Entity from which component will be removed.
 * @param unparent Whether to remove parent entity as well. Default is **```true```**.
 */
export declare function removeObject3DComponent(entity: Entity, unparent?: boolean): void;
/**
 * Remove Entity and associated all Object3D Components.
 * @param entity Entity which will be removed.
 * @param forceImmediate Whether to remove Entity immediately or wait for frame to complete.
 */
export declare function remove(entity: Entity, forceImmediate: boolean): void;
/**
 * Get Object3D from the given Entity.
 * @param entity Entity from which Object3D will be retrieved.
 *
 * @returns Object3D retrieved from the Entity.
 */
export declare function getObject3D(entity: Entity): Object3D;
/**
 * Get List of Component tags associated with given Object3D.
 * @param entity Object3D from which Component tags will be retrieved.
 *
 * @returns List of Components tags of given Object3D.
 */
export declare function getComponentTags(object3d: Object3D): Array<Component<any>>;
