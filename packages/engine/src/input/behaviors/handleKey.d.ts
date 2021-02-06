import { BinaryType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
/**
 * System behavior called when a keyboard key is pressed
 *
 * @param {Entity} entity The entity
 * @param args is argument object
 */
export declare function handleKey(entity: Entity, args: {
    event: KeyboardEvent;
    value: BinaryType;
}): any;
