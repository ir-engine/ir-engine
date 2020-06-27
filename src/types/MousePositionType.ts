import { createType, copyCopyable, cloneClonable } from "ecsy"
import MousePosition from "../classes/MousePosition"

export const MousePositionType = createType<MousePosition>({
  name: "MousePosition",
  default: new MousePosition(),
  copy: copyCopyable,
  clone: cloneClonable
})

export default MousePositionType
