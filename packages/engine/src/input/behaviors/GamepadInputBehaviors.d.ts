import { Behavior } from "../../common/interfaces/Behavior";
/**
 * System behavior to handle gamepad input
 *
 * @param {Entity} entity The entity
 */
export declare const handleGamepads: Behavior;
/**
 * Gamepad axios
 *
 * @param {Entity} entity The entity
 * @param args is argument object
 */
export declare const handleGamepadAxis: Behavior;
/**
 * When a gamepad connects
 *
 * @param {Entity} entity The entity
 * @param args is argument object
 */
export declare const handleGamepadConnected: Behavior;
/**
 * When a gamepad disconnects
 *
 * @param {Entity} entity The entity
 * @param args is argument object
 */
export declare const handleGamepadDisconnected: Behavior;
