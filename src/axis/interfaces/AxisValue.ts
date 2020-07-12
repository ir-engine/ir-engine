import { Scalar, Vector2, Vector3 } from "../../common/types/NumericalTypes"
import Binary from "../../common/enums/Binary"
import { AxisType } from "../enums/AxisType"

export default interface AxisValue<T extends Binary | Scalar | Vector2 | Vector3> {
  type: AxisType
  value: T
}
