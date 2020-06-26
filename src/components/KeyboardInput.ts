// TODO: Replace mappings with enums
import { Component } from "ecsy"

export class KeyboardInput extends Component {
  states: any
  mapping: any

  constructor() {
    super()
    this.states = {}
    this.mapping = {
      " ": "jump",
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down"
    }
  }
}
