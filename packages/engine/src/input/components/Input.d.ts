import { BehaviorComponent } from '../../common/components/BehaviorComponent';
import { BinaryType, NumericalType } from '../../common/types/NumericalTypes';
import { InputSchema } from '../interfaces/InputSchema';
import { InputValue } from '../interfaces/InputValue';
import { InputAlias } from '../types/InputAlias';
/**
 * Interface with props that don't get automatically added by the BehaviorComponent generic
 *
 * @property {Boolean} gamepadConnected Connection a new gamepad
 * @property {Number} gamepadThreshold Threshold value from 0 to 1
 * @property {Binary[]} gamepadButtons Map gamepad buttons
 * @property {Number[]} gamepadInput Map gamepad buttons to abstract input
*/
export interface InputProps {
    gamepadConnected: boolean;
    gamepadThreshold: number;
    gamepadButtons: BinaryType[];
    gamepadInput: number[];
}
/**
 * Input inherits from BehaviorComponent, which adds .map and .data
 *
 * @property {Boolean} gamepadConnected Connection a new gamepad
 * @property {Number} gamepadThreshold Threshold value from 0 to 1
 * @property {Binary[]} gamepadButtons Map gamepad buttons
 * @property {Number[]} gamepadInput Map gamepad buttons to abstract input
 */
export declare class Input extends BehaviorComponent<InputAlias, InputSchema, InputValue<NumericalType>> {
    gamepadConnected: boolean;
    gamepadThreshold: number;
    gamepadButtons: BinaryType[];
    gamepadInput: number[];
    prevData: Map<InputAlias, InputValue<NumericalType>>;
    constructor();
    reset(): void;
}
