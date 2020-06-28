import { System } from "ecsy"
import MouseInput from "../components/MouseInput"
import ActionValues from "../enums/ActionValues"
import ButtonState from "../interfaces/ButtonState"

export default class MouseInputSystem extends System {
  mouse: MouseInput
  execute(): void {
    this.queries.mouse.changed.forEach(entity => {
      this.mouse = entity.getComponent(MouseInput)
      this.handleButton(this.mouse.mouseButtonLeft, "Left ")
      this.handleButton(this.mouse.mouseButtonRight, "Right ")
      this.handleButton(this.mouse.mouseButtonMiddle, "Middle ")
    })
  }

  handleButton(button: ButtonState, buttonName: string): void {
    // Left Mouse button
    // just pressed down
    if (
      button.current === ActionValues.START &&
      button.prev === ActionValues.END
    ) {
      console.log(`${buttonName} pressed`)
    }
    // just released up
    else if (
      button.current === ActionValues.END &&
      button.prev === ActionValues.START
    ) {
      console.log(`${buttonName} released`)
    }
  }
}

MouseInputSystem.queries = {
  mouse: {
    components: [MouseInput],
    listen: {
      changed: true
    }
  }
}
