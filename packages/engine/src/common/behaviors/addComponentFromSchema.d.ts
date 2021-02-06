import { Entity } from "../../ecs/classes/Entity";
/**
 * Add Component into Entity.
 * @param entity Entity in which component will be added.
 * @param args Args contains Component and args of Component which will be added into the Entity.
 */
export declare const addComponentFromSchema: (entity: Entity, args: {
    component: any;
    componentArgs: any;
}) => void;
