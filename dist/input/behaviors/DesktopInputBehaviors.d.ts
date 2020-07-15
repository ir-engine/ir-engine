import { Entity } from "ecsy";
import BinaryValue from "../../common/enums/BinaryValue";
import Behavior from "../../common/interfaces/Behavior";
export declare const handleMouseMovement: Behavior;
export declare const handleMouseButton: Behavior;
export declare function handleKey(entity: Entity, args: {
    event: KeyboardEvent;
    value: BinaryValue;
}): any;
