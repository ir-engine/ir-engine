import Axis1D from "./Axis1D"
import AxisType from "../types/AxisType"

export default interface AxisValue<T extends Axis1D> {
  axis: AxisType
  value: T
}
