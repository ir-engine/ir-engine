// Place this component on any entity which you would like to recieve input
// Inputs are processed from various devices and converted into actions
import { Component } from "ecsy"

export default class ActionReceiver extends Component {
  // TODO: Circular buffer
  actionQueue: any[]

  constructor() {
    super()
    this.reset()
  }

  reset() {}

  set(obj) {}
}
