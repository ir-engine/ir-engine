import { createType, copyCopyable, cloneClonable } from "ecsy"
import ButtonState from "../enums/ButtonState"
const defaultValue = {
  w: { current: ButtonState.RELEASED, prev: ButtonState.RELEASED },
  a: { current: ButtonState.RELEASED, prev: ButtonState.RELEASED },
  s: { current: ButtonState.RELEASED, prev: ButtonState.RELEASED },
  d: { current: ButtonState.RELEASED, prev: ButtonState.RELEASED }
}
export const KeyState = createType({
  name: "KeyState",
  default: defaultValue,
  copy: copyCopyable,
  clone: cloneClonable
})
