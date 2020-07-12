import { Scalar, Vector2, Vector3 } from "../../common/types/NumericalTypes"
import BinaryValue from "../../common/enums/BinaryValue"
import { InputType } from "../enums/InputType"

export default interface InputValue<T extends BinaryValue | Scalar | Vector2 | Vector3> {
  type: InputType
  value: T
}
