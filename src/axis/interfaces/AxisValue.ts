import { Scalar, Vector2, Vector3 } from "../../common/types/NumericalTypes"
import BinaryValue from "../../common/enums/BinaryValue"
import { AxisType } from "../enums/AxisType"

export default interface AxisValue<T extends BinaryValue | Scalar | Vector2 | Vector3> {
  type: AxisType
  value: T
}
