import { Component } from "ecsy"

export class KeyboardInputState extends Component {
  states: any
  mapping: any
  on_keydown: any
  on_keyup: any

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
    this.on_keydown = (e: any) => {
      this.setKeyState(e.key, "down")
    }
    this.on_keyup = (e: any) => {
      this.setKeyState(e.key, "up")
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
        prev: "up",
        current: "up"
      }
    }
    return this.states[key]
  }
  isPressed(name: string): boolean {
    return this.getKeyState(name).current === "down"
  }
}
