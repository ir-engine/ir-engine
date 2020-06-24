import { Component } from "ecsy"

interface Inputs {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

export class InputState extends Component {
  states: Inputs
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
