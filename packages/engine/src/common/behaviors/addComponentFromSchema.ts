import { Entity } from "../../ecs/classes/Entity";
import { addComponent } from "../../ecs/functions/EntityFunctions";

/**
 * Add Component into Entity.
 * @param entity Entity in which component will be added.
 * @param args Args contains Component and args of Component which will be added into the Entity.
 */
export const addComponentFromSchema = (entity: Entity, args: { component: any; componentArgs: any }): void => {
    addComponent(entity, args.component, args.componentArgs);
    console.log("Added component: ", args.component);
};
