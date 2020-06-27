import { Component } from "ecsy"
import TemporalButtonStateMappingType from "../types/TemporalButtonStateMapping"
import TemporalButtonStateList from "../interfaces/ButtonStateList"

export default class KeyboardInput extends Component<any> {
  keys: TemporalButtonStateList
  kb: any
  constructor() {
    super()
    this.keys = {}
  }
}

KeyboardInput.schema = {
  keys: { type: TemporalButtonStateMappingType }
}
