import { createType, copyCopyable, cloneClonable } from "ecsy"
import ActionState from "../enums/ActionState"

class TemporalButtonState {
  current: ActionState
  prev: ActionState
  changed: boolean

  constructor() {
    this.current = ActionState.END
    this.prev = ActionState.END
    this.changed = false
  }

  set(current?, prev?, changed?) {
    if (current) this.current = current
    if (prev) this.prev = prev
    if (changed) this.changed = changed
    return this
  }

  copy(source) {
    this.current = source.current ?? ActionState.END
    this.prev = ActionState.END
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
