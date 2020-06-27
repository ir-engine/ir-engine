import { createType, copyCopyable, cloneClonable } from "ecsy"
import Vector2 from "../interfaces/Vector2"
const defaultValue: Vector2 = {
  x: 0,
  y: 0
}
export const MousePositionType = createType({
  name: "MousePosition",
  default: defaultValue,
  copy: copyCopyable,
  clone: cloneClonable
})
