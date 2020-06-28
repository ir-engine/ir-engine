import { System } from "ecsy"
import MouseInput from "../components/MouseInput"
import MouseInputMap from "../maps/MouseInputMap"
import ActionValues from "../enums/ActionValues"

export default class MouseInputSystem extends System {
  mouse: MouseInput
  execute(): void {
    this.queries.mouse.added.forEach(ent => {
      this.mouse = ent.getMutableComponent(MouseInput)
      document.addEventListener(
        "mousemove",
        e => (this.mouse.moveHandler = this.moveHandler(e, this.mouse)),
        false
      )
      document.addEventListener(
        "mousedown",
        e =>
          (this.mouse.downHandler = this.buttonHandler(
            e,
            this.mouse,
            ActionValues.START
          )),
        false
      )
      document.addEventListener(
        "mouseup",
        e =>
          (this.mouse.upHandler = this.buttonHandler(
            e,
            this.mouse,
            ActionValues.END
          )),
        false
      )
    })
    this.queries.mouse.removed.forEach(ent => {
      const mouse = ent.getComponent(MouseInput)
      if (mouse) document.removeEventListener("mousemove", mouse.upHandler)
      if (mouse) document.removeEventListener("mousedown", mouse.downHandler)
      if (mouse) document.removeEventListener("mouseup", mouse.moveHandler)
    })
  }

  moveHandler = (e: MouseEvent, mouse: MouseInput): void => {
    const { clientX, clientY, timeStamp } = e
    mouse.mousePosition = { x: clientX, y: clientY }
    mouse.lastTimestamp = timeStamp
  }

  buttonHandler = (
    e: MouseEvent,
    mouse: MouseInput,
    buttonState: ActionValues
  ): void => {
    if (e.button === MouseInputMap.LEFT.value) {
      if (buttonState !== mouse.mouseButtonLeft.current) {
        mouse.mouseButtonLeft.prev = mouse.mouseButtonLeft.current
        mouse.mouseButtonLeft.current = buttonState
        mouse.mouseButtonLeft.changed = true
      } else {
        mouse.mouseButtonLeft.changed = false
      }
    } else if (e.button === MouseInputMap.RIGHT.value) {
      if (buttonState !== mouse.mouseButtonRight.current) {
        mouse.mouseButtonRight.prev = mouse.mouseButtonRight.current
        mouse.mouseButtonRight.current = buttonState
        mouse.mouseButtonRight.changed = true
      } else {
        mouse.mouseButtonRight.changed = false
      }
    } else {
      if (buttonState !== mouse.mouseButtonMiddle.current) {
        mouse.mouseButtonMiddle.prev = mouse.mouseButtonLeft.current
        mouse.mouseButtonMiddle.current = buttonState
        mouse.mouseButtonMiddle.changed = true
      } else {
        mouse.mouseButtonMiddle.changed = false
      }
    }
  }
}

MouseInputSystem.queries = {
  mouse: {
    components: [MouseInput],
    listen: {
      added: true,
      removed: true
    }
  }
}
