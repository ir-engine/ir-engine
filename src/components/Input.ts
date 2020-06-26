import { Component } from "ecsy"
import InputStates from "../interfaces/InputStates"

export default class Input extends Component {
  states: InputStates
  changed: boolean
  released: boolean

  constructor() {
    super()
    // this.states = {}
    this.changed = true
    this.released = false
  }

  anyChanged(): boolean {
    return this.changed
  }

  anyReleased(): boolean {
    return this.released
  }
}
