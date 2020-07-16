import { NumericalType } from "../../common/types/NumericalTypes";
import { InputType } from "../enums/InputType";
import LifecycleValue from "../../common/enums/LifecycleValue";
export default interface InputValue<T extends NumericalType> {
    type: InputType;
    value: T;
    lifecycleState?: LifecycleValue;
}
