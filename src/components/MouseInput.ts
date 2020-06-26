import { Component } from "ecsy"

export default class MouseInput extends Component {
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
