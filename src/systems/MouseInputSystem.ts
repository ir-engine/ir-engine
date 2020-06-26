import { System } from "ecsy"
import { Input } from "../components/Input"
import { MouseInput, BUTTONS } from "../components/MouseInput"

// TODO: Add middle and right mouse button support
export class MouseInputSystem extends System {
  debug: boolean
  mouse: MouseInput
  inp: Input
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(delta: number, time: number): void {
    this.queries.mouse.added.forEach(ent => {
      if (window && (window as any).DEBUG_INPUT) {
        this.debug = (window as any).DEBUG_INPUT
      } else this.debug = false
      this.mouse = ent.getMutableComponent(MouseInput)
      this.inp = ent.getMutableComponent(Input)

      document.addEventListener(
        "mousemove",
        e => this.moveHandler(e, this.mouse),
        false
      )
      document.addEventListener(
        "mousedown",
        e => this.downHandler(e, this.mouse),
        false
      )
      document.addEventListener(
        "mouseup",
        e => this.upHandler(e, this.mouse),
        false
      )
    })
    this.queries.mouse.results.forEach(() => {
      const name = BUTTONS.LEFT
      const state = this.getMouseState(name, this.mouse)
      // just pressed down
      if (
        state.current === BUTTONS.PRESSED &&
        state.prev === BUTTONS.RELEASED
      ) {
        this.inp.states[name] = state.current === BUTTONS.PRESSED
        this.inp.changed = true
      }
      // just released up
      if (
        state.current === BUTTONS.RELEASED &&
        state.prev === BUTTONS.PRESSED
      ) {
        this.inp.states[name] = state.current === BUTTONS.PRESSED
        this.inp.changed = true
        this.inp.released = true
      }
      if (state.current !== state.prev && this.debug) state.prev = state.current
    })
    this.queries.mouse.removed.forEach(ent => {
      const mouse = ent.getMutableComponent(MouseInput)
      if (mouse) document.removeEventListener("mousemove", mouse.moveHandler)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  downHandler = (e: any, mouse: MouseInput): void => {
    this.setMouseState(BUTTONS.LEFT, BUTTONS.PRESSED, mouse)
  }
  moveHandler = (
    e: { clientX: number; clientY: number; timeStamp: any },
    mouse: MouseInput
  ): void => {
    mouse.clientX = e.clientX
    mouse.clientY = e.clientY
    mouse.lastTimestamp = e.timeStamp
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  upHandler = (e: any, mouse: MouseInput): void => {
    this.setMouseState(BUTTONS.LEFT, BUTTONS.RELEASED, mouse)
  }
  setMouseState(key: string, value: string, mouse: MouseInput): void {
    const state = this.getMouseState(key, mouse)
    state.prev = state.current
    state.current = value
    if (this.debug)
      console.log(
        `Mouse button ${key} is ${value} at ${mouse.clientX} / ${mouse.clientY}`
      )
  }
  getMouseState(key: string, mouse: MouseInput): any {
    if (!mouse.states[key]) {
      mouse.states[key] = {
        prev: BUTTONS.RELEASED,
        current: BUTTONS.RELEASED
      }
    }
    return mouse.states[key]
  }
}

MouseInputSystem.queries = {
  mouse: {
    components: [MouseInput, Input],
    listen: {
      added: true,
      removed: true
    }
  }
}
