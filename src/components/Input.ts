import { Component } from "ecsy"
import InputStates from "../interfaces/InputStates"

interface p {
}

export default class Input extends Component<p> {
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

Input.schema = {

}
