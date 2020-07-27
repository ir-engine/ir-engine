import StateType from "../../state/types/StateAlias";
import { Scalar, Vector2, Vector3 } from "../types/NumericalTypes";
interface blendStatePositionValue {
    stateType: StateType;
    position: Scalar | Vector2 | Vector3;
}
interface outputState {
    stateType: StateType;
    weight: number;
}
export default function computeBlendValue(inputValue: Scalar | Vector2 | Vector3, blendStateValues: blendStatePositionValue[]): outputState[];
export {};
