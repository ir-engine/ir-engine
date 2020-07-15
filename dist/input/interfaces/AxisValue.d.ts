import { NumericalType } from "../../common/types/NumericalTypes";
import { InputType } from "../enums/InputType";
export default interface InputValue<T extends NumericalType> {
    type: InputType;
    value: T;
}
