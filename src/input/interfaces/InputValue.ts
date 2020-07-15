import { NumericalType } from "../../common/types/NumericalTypes"
import { InputType } from "../enums/InputType"

export default interface InputValue<T extends NumericalType> {
  type: InputType // How many dimensions? Button, 2D?
  value: T // What's the value? Binary, scalar, vector
}
