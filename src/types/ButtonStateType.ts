import ButtonState from "../enums/ButtonState"
import { createType, copyCopyable, cloneClonable } from "ecsy"

export const ButtonStateType = createType({
  name: "ButtonState",
  default: ButtonState.RELEASED,
  copy: copyCopyable,
  clone: cloneClonable
})
