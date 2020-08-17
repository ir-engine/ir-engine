import { BehaviorComponent } from "../../common/components/BehaviorComponent";
import { Binary, NumericalType } from "../../common/types/NumericalTypes";
import { InputSchema } from "../interfaces/InputSchema";
import { InputValue } from "../interfaces/InputValue";
import { InputAlias } from "../types/InputAlias";
export interface InputProps {
    gamepadConnected: boolean;
    gamepadThreshold: number;
    gamepadButtons: Binary[];
    gamepadInput: number[];
}
export declare class Input extends BehaviorComponent<InputAlias, InputSchema, InputValue<NumericalType>> {
    gamepadConnected: boolean;
    gamepadThreshold: number;
    gamepadButtons: Binary[];
    gamepadInput: number[];
}
