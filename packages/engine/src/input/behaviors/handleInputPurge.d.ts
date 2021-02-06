import { Behavior } from '../../common/interfaces/Behavior';
/**
 * Call all behaviors associated with current input in ENDED lifecycle phase
 * call behaviors associated with that input.ended and clear all
 *
 * @param {Entity} entity The entity
 * @param args
 * @param {Number} delta Time since last frame
 */
export declare const handleInputPurge: Behavior;
