import { Component } from "ecsy"

export default class GamepadInput extends Component {
  axis_threshold: number
  connected: boolean

  constructor() {
    super()
    this.axis_threshold = 0.1
    this.connected = false
  }
}
