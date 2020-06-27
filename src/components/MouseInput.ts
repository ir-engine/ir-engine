import { Component } from "ecsy"

export class MouseInput extends Component<any> {
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
