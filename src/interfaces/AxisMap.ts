import AxisValue from "./AxisValue"
import Axis1D from "./Axis1D"
import Axis2D from "./Axis2D"
import Axis3D from "./Axis3D"

const key: unique symbol = Symbol()

interface AxisMap {
  [key]?: AxisValue<Axis1D | Axis2D | Axis3D>
}

export default AxisMap
