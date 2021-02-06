import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { BinaryType } from "../../common/types/NumericalTypes";
/**
 * System behavior called whenever the mouse pressed
 *
 * @param {Entity} entity The entity
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */
export declare const handleOnScreenGamepadMovement: Behavior;
/**
 * System behavior called when a keyboard key is pressed
 *
 * @param {Entity} entity The entity
 * @param args is argument object
 */
export declare function handleOnScreenGamepadButton(entity: Entity, args: {
    event: CustomEvent;
    value: BinaryType;
}): any;
