import { createType, copyCopyable, cloneClonable } from "ecsy"
import TemporalButtonStateList from "../interfaces/ButtonStateList"

class TemporalButtonStateMapping {
  states: TemporalButtonStateList

  constructor() {
    this.states = {}
  }

  set(states: TemporalButtonStateList) {
    this.states = {
      ...this.states,
      ...states
    }
  }

  copy(source) {
    this.states = source.states
    return this
  }

  clone() {
    return new TemporalButtonStateMapping().set(this.states)
  }
}

export const TemporalButtonStateMappingType = createType<
  TemporalButtonStateMapping
>({
  name: "KeyState",
  default: new TemporalButtonStateMapping(),
  copy: copyCopyable,
  clone: cloneClonable
})

export default TemporalButtonStateMappingType
