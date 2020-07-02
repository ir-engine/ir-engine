import AxisValue from "./DefaultAxisValue"
import IAxisMap from "../interfaces/AxisMap"
import AxisType from "./DefaultAxisType"

const AxisMap: IAxisMap = {
  [AxisType.SCREENXY]: AxisValue,
  [AxisType.DPADONE]: AxisValue,
  [AxisType.DPADTWO]: AxisValue
}

export default AxisMap
