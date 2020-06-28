import { createType, copyCopyable, cloneClonable } from "ecsy"
import Axis2DState from "../classes/Axis2DState"

export const Axis2DStateType = createType<Axis2DState>({
  name: "MousePosition",
  default: new Axis2DState(),
  copy: copyCopyable,
  clone: cloneClonable
})

export default Axis2DStateType
