import { Component } from "ecsy"

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.downHandler = (e: any) => {
      this.setKeyState(BUTTONS.LEFT, BUTTONS.PRESSED)
    }
    this.moveHandler = (e: { clientX: number; timeStamp: any }) => {
      this.clientX = e.clientX
      this.lastTimestamp = e.timeStamp
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.upHandler = (e: any) => {
      this.setKeyState(BUTTONS.LEFT, BUTTONS.RELEASED)
    }
  }
  setKeyState(key: string, value: string): any {
    const state = this.getKeyState(key)
    state.prev = state.current
    state.current = value
  }
  getKeyState(key: string): any {
    if (!this.states[key]) {
      this.states[key] = {
        prev: BUTTONS.RELEASED,
        current: BUTTONS.RELEASED
      }
    }
    return this.states[key]
  }
}
