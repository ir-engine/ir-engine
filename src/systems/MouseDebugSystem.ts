import { System } from "ecsy"
import MouseInput from "../components/MouseInput"
import ActionValues from "../enums/ActionValues"
import ButtonState from "../interfaces/ButtonState"
import ActionQueue from "../components/ActionQueue"

export default class MouseInputSystem extends System {
  mouse: MouseInput
  execute(): void {
    this.queries.mouse.changed.forEach(entity => {
      const queue = entity.getComponent(ActionQueue)
      console.log(queue.actions.toArray())
    })
  }

  handleButton(button: ButtonState, buttonName: string): void {
    // Left Mouse button
    // just pressed down
    if (button.current === ActionValues.START && button.prev === ActionValues.END) {
      console.log(`${buttonName} pressed`)
    }
    // just released up
    else if (button.current === ActionValues.END && button.prev === ActionValues.START) {
      console.log(`${buttonName} released`)
    }
  }
}

MouseInputSystem.queries = {
  mouse: {
    components: [MouseInput, ActionQueue],
    listen: {
      changed: true
    }
  }
}
