import StateType from "../types/StateAlias";
import { Scalar, Vector2, Vector3 } from "../../common/types/NumericalTypes";
interface weightedState {
    type: StateType;
    value: Scalar | Vector2 | Vector3;
}
interface outputState {
    type: StateType;
    weight: number;
}
export declare function computeOutputFromWeightedStates(inputValue: Scalar | Vector2 | Vector3, blendStateValues: weightedState[]): outputState[];
export {};
