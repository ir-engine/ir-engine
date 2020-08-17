import { Behavior } from "../../common/interfaces/Behavior";
import { Binary } from "../../common/types/NumericalTypes";
import { Entity } from "../../ecs/classes/Entity";
export declare const handleMouseMovement: Behavior;
export declare const handleMouseButton: Behavior;
export declare function handleKey(entity: Entity, args: {
    event: KeyboardEvent;
    value: Binary;
}): any;
