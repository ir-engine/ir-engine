import { Component } from "ecsy"
// TODO: Replace button mapping with enums
export const BUTTONS = {
  LEFT: "left-button",
  PRESSED: "down",
  RELEASED: "up"
}

export class MouseInputState extends Component {
  clientX: number
  clientY: number
  states: any
  downHandler: any
  moveHandler: any
  upHandler: any
  lastTimestamp: any

  constructor() {
    super()
    this.clientX = 0
    this.clientY = 0
    this.states = {}
  }
}
