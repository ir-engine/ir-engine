import { Component } from "ecsy"

export class GamepadInput extends Component {
  axis_threshold: number
  connected: boolean

  constructor() {
    super()
    this.axis_threshold = 0.4
    this.connected = false
  }
}
