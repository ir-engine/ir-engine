import { createType, copyCopyable, cloneClonable } from "ecsy"
import ButtonAction from "../enums/ButtonAction"

class TemporalButtonState {
  current: ButtonAction
  prev: ButtonAction
  changed: boolean

  constructor() {
    this.current = ButtonAction.RELEASED
    this.prev = ButtonAction.RELEASED
    this.changed = false
  }

  set(current?, prev?, changed?) {
    if (current) this.current = current
    if (prev) this.prev = prev
    if (changed) this.changed = changed
    return this
  }

  copy(source) {
    this.current = source.current ?? ButtonAction.RELEASED
    this.prev = ButtonAction.RELEASED
    this.changed = false
  }

  clone() {
    return new TemporalButtonState()
  }
}

export const TemporalButtonStateType = createType<TemporalButtonState>({
  name: "TemporalButtonState",
  default: new TemporalButtonState(),
  copy: copyCopyable,
  clone: cloneClonable
})

export default TemporalButtonStateType
