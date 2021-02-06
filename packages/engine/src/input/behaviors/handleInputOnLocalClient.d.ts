import { Behavior } from '../../common/interfaces/Behavior';
/**
 * Call all behaviors associated with current input in it's current lifecycle phase
 * i.e. if the player has pressed some buttons that have added the value to the input queue,
 * call behaviors (move, jump, drive, etc) associated with that input.
 * There are two cycles:
 * - call behaviors according to value.lifecycleState
 * - clean processed LifecycleValue.ENDED inputs
 *
 * @param {Entity} entity The entity
 * @param args
 * @param {Number} delta Time since last frame
 */
export declare const handleInputOnLocalClient: Behavior;
