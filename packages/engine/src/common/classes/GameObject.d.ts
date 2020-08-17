import { Entity } from "../../ecs/classes/Entity";
import { ComponentConstructor } from "../../ecs/classes/Component";
/**
 * GameObjects are the fundamental objects in Armada that represent characters,
 * props and scenery. They do not accomplish much in themselves but they act as
 * containers for Components.
 * A GameObject always has a Transform component attached (to represent position
 * and orientation) and it is not possible to remove this.
 */
export declare class GameObject extends Entity {
    constructor();
    removeComponent(component: ComponentConstructor<any>, forceImmediate?: boolean): this;
}
