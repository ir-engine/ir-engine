import { System } from "ecsy"
import Input from "../components/Input"
import MouseInput from "../components/MouseInput"
import MouseButtonMappings from "../mappings/MouseButtonMappings"
import ButtonState from "../enums/ButtonState"

// TODO: Add middle and right buttons

export default class MouseInputSystem extends System {
  mouse: MouseInput
  execute(): void {
    this.queries.mouse.added.forEach(ent => {
      this.mouse = ent.getMutableComponent(MouseInput)
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
    this.queries.mouse.results.forEach(entity => {
      this.mouse = entity.getMutableComponent(MouseInput)

      let state: any

      // Left mouse button
      state = this.getMouseState(MouseButtonMappings.LEFT.name, this.mouse)
      // just pressed down
      if (
        state.current === ButtonState.PRESSED &&
        state.prev === ButtonState.RELEASED
      ) {
        this.mouse.mouseButtonLeft = ButtonState.PRESSED
      }
      // just released up
      else if (
        state.current === ButtonState.RELEASED &&
        state.prev === ButtonState.PRESSED
      ) {
        this.mouse.mouseButtonLeft = ButtonState.RELEASED
      }

      // Right mouse button
      state = this.getMouseState(MouseButtonMappings.RIGHT.name, this.mouse)
      // just pressed down
      if (
        state.current === ButtonState.PRESSED &&
        state.prev === ButtonState.RELEASED
      ) {
        this.mouse.mouseButtonRight = ButtonState.PRESSED
      }
      // just released up
      else if (
        state.current === ButtonState.RELEASED &&
        state.prev === ButtonState.PRESSED
      ) {
        this.mouse.mouseButtonRight = ButtonState.RELEASED
      }

      // Middle mouse button
      state = this.getMouseState(MouseButtonMappings.MIDDLE.name, this.mouse)
      // just pressed down
      if (
        state.current === ButtonState.PRESSED &&
        state.prev === ButtonState.RELEASED
      ) {
        this.mouse.mouseButtonMiddle = ButtonState.PRESSED
      }
      // just released up
      else if (
        state.current === ButtonState.RELEASED &&
        state.prev === ButtonState.PRESSED
      ) {
        this.mouse.mouseButtonMiddle = ButtonState.RELEASED
      }


    })
    this.queries.mouse.removed.forEach(ent => {
      const mouse = ent.getMutableComponent(MouseInput)
      if (mouse) document.removeEventListener("mousemove", mouse.moveHandler)
    })
  }

  moveHandler = (e: MouseEvent, mouse: MouseInput): void => {
    const { clientX, clientY, timeStamp } = e
    mouse.lastMousePosition = mouse.mousePosition
    mouse.mousePosition = { x: clientX, y: clientY }
    mouse.lastTimestamp = timeStamp
  }

  buttonHandler = (
    e: MouseEvent,
    mouse: MouseInput,
    direction: ButtonState
  ): void => {
    let button = MouseButtonMappings.LEFT
    if (e.button === MouseButtonMappings.RIGHT.value)
      button = MouseButtonMappings.RIGHT
    else if (e.button !== MouseButtonMappings.LEFT.value)
      button = MouseButtonMappings.MIDDLE

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
