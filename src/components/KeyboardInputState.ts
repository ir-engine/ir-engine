// TODO: Replace mappings with enums
import { Component } from "ecsy"

export class KeyboardInputState extends Component {
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
