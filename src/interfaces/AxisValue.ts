import Axis2D from "./Axis2D"
import Axis1D from "./Axis1D"
import Axis3D from "./Axis3D"

export default interface AxisQueueItem {
  axis: Axis1D | Axis2D | Axis3D
}
