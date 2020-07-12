import { Scalar, Vector2, Vector3 } from "../../common/types/NumericalTypes"
import AxisAlias from "../types/AxisAlias"
import Binary from "../../common/enums/Binary"

export default interface AxisValue<T extends Binary | Scalar | Vector2 | Vector3> {
  axis: AxisAlias
  value: T
}
