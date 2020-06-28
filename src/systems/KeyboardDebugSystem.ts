import { System } from "ecsy"
import KeyboardInput from "../components/KeyboardInput"
import ActionQueue from "../components/ActionQueue"

export default class KeyboardDebugSystem extends System {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(): void {
    this.queries.keyboard.changed.forEach(entity => {
      const kb = entity.getComponent(KeyboardInput)
      console.log(kb.keyboardInputActionMap)
      const queue = entity.getComponent(ActionQueue)
      console.log(queue.actions.toArray())
    })
  }
}

KeyboardDebugSystem.queries = {
  keyboard: {
    components: [KeyboardInput, ActionQueue],
    listen: { changed: true }
  }
}
