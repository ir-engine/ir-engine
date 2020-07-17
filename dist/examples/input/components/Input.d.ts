import InputMap from "../interfaces/InputMap";
import BehaviorComponent from "../../common/components/BehaviorComponent";
import InputAlias from "../types/InputAlias";
import InputValue from "../interfaces/InputValue";
import { Binary, Scalar, Vector2, Vector3 } from "../../common/types/NumericalTypes";
export default interface InputProps {
    gamepadConnected: boolean;
    gamepadThreshold: number;
    gamepadButtons: Binary[];
    gamepadInput: number[];
}
export default class Input extends BehaviorComponent<InputAlias, InputMap, InputValue<Scalar | Vector2 | Vector3>> {
    gamepadConnected: boolean;
    gamepadThreshold: number;
    gamepadButtons: Binary[];
    gamepadInput: number[];
}
