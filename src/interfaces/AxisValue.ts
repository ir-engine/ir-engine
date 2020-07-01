import Axis2D from "./Axis2D"
import Axis1D from "./Axis1D"
import Axis3D from "./Axis3D"
import AxisType from "../types/AxisType"

export default interface AxisValue {
  axis: AxisType
  value: Axis1D | Axis2D | Axis3D
}
