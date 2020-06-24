import { Component } from "ecsy"

export class GamepadInputState extends Component {
  axis_threshold: number
  connected: boolean

  constructor() {
    super()
    this.axis_threshold = 0.4
    this.connected = false
  }
}
