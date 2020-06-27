import { System } from "ecsy"
import MouseInput from "../components/MouseInput"
import ButtonAction from "../enums/ButtonAction"
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
      button.current === ButtonAction.PRESSED &&
      button.prev === ButtonAction.RELEASED
    ) {
      console.log(`${buttonName} pressed`)
    }
    // just released up
    else if (
      button.current === ButtonAction.RELEASED &&
      button.prev === ButtonAction.PRESSED
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
