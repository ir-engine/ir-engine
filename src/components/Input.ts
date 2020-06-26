import { Component } from "ecsy"

interface InputStates {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

export class Input extends Component {
  states: InputStates
  changed: boolean
  released: boolean

  constructor() {
    super()
    this.states = {
      up: false,
      down: false,
      left: false,
      right: false
    }
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
