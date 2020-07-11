import { Scalar, Vector2, Vector3 } from "../../common/types/NumericalTypes"
import AxisType from "../types/AxisType"

export default interface AxisValue<T extends Scalar | Vector2 | Vector3> {
  axis: AxisType
  value: T
}
