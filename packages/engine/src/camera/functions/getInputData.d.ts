import { NumericalType } from "../../common/types/NumericalTypes";
import { Input } from "../../input/components/Input";
/**
 * Get Input data from the device.
 *
 * @param inputComponent Input component which is holding input data.
 * @param inputAxes Axes of the input.
 * @param forceRefresh
 *
 * @returns Input value from input component.
 */
export declare function getInputData(inputComponent: Input, inputAxes: number, forceRefresh?: boolean): NumericalType;
