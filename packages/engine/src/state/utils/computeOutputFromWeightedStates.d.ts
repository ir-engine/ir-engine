import { Scalar, Vector2, Vector3 } from "../../common/types/NumericalTypes";
import { StateAlias } from "../types/StateAlias";
interface weightedState {
    type: StateAlias;
    value: Scalar | Vector2 | Vector3;
}
interface outputState {
    type: StateAlias;
    weight: number;
}
export declare function computeOutputFromWeightedStates(inputValue: Scalar | Vector2 | Vector3, blendStateValues: weightedState[]): outputState[];
export {};
