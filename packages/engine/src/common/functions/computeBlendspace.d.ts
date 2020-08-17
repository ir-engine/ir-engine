import { StateAlias } from "../../state/types/StateAlias";
import { Scalar, Vector2, Vector3 } from "../types/NumericalTypes";
interface blendStatePositionValue {
    stateType: StateAlias;
    position: Scalar | Vector2 | Vector3;
}
interface outputState {
    stateType: StateAlias;
    weight: number;
}
export declare function computeBlendValue(inputValue: Scalar | Vector2 | Vector3, blendStateValues: blendStatePositionValue[]): outputState[];
export {};
