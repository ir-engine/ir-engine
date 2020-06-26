import { System } from "ecsy"
import Input from "../components/Input"
import MouseInput from "../components/MouseInput"
import MouseButtonMappings from "../mappings/MouseButtonMappings"
import ButtonState from "../enums/ButtonState"

// TODO: Add middle and right buttons

export default class MouseInputSystem extends System {
  mouse: MouseInput
  inp: Input
  execute(): void {
    this.queries.mouse.added.forEach(ent => {
      this.mouse = ent.getMutableComponent(MouseInput)
      this.inp = ent.getMutableComponent(Input)

      document.addEventListener(
        "mousemove",
        e => this.moveHandler(e, this.mouse),
        false
      )
      document.addEventListener(
        "mousedown",
        e => this.buttonHandler(e, this.mouse, ButtonState.PRESSED),
        false
      )
      document.addEventListener(
        "mouseup",
        e => this.buttonHandler(e, this.mouse, ButtonState.RELEASED),
        false
      )
    })
    this.queries.mouse.results.forEach(() => {
      const name = MouseButtonMappings.LEFT.name
      const state = this.getMouseState(name, this.mouse)
      // just pressed down
      if (
        state.current === ButtonState.PRESSED &&
        state.prev === ButtonState.RELEASED
      ) {
        this.inp.states[name] = state.current === ButtonState.PRESSED
        this.inp.changed = true
      }
      // just released up
      if (
        state.current === ButtonState.RELEASED &&
        state.prev === ButtonState.PRESSED
      ) {
        this.inp.states[name] = state.current === ButtonState.PRESSED
        this.inp.changed = true
        this.inp.released = true
      }
      if (state.current !== state.prev) state.prev = state.current
    })
    this.queries.mouse.removed.forEach(ent => {
      const mouse = ent.getMutableComponent(MouseInput)
      if (mouse) document.removeEventListener("mousemove", mouse.moveHandler)
    })
  }

  moveHandler = (
    e: { clientX: number; clientY: number; timeStamp: any },
    mouse: MouseInput
  ): void => {
    mouse.clientX = e.clientX
    mouse.clientY = e.clientY
    mouse.lastTimestamp = e.timeStamp
  }

  buttonHandler = (
    e: MouseEvent,
    mouse: MouseInput,
    direction: ButtonState
  ): void => {
    const button =
      e.button === MouseButtonMappings.LEFT.value
        ? MouseButtonMappings.LEFT
        : e.button === MouseButtonMappings.RIGHT.value
          ? MouseButtonMappings.RIGHT
          : MouseButtonMappings.MIDDLE

    const state = this.getMouseState(button.name, mouse)
    state.prev = state.current
    state.current = direction
  }

  getMouseState(key: string, mouse: MouseInput): any {
    if (!mouse.states[key]) {
      mouse.states[key] = {
        prev: ButtonState.RELEASED,
        current: ButtonState.RELEASED
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
