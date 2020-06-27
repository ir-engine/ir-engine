import { System } from "ecsy"
import MouseInput from "../components/MouseInput"
import KeyboardInput from "../components/KeyboardInput"

export default class KeyboardDebugSystem extends System {
  mouse: MouseInput
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(): void {
    this.queries.keyboard.changed.forEach(entity => {
      const kb = entity.getComponent(KeyboardInput)
      console.log(kb.keys)
    })
  }
}

KeyboardDebugSystem.queries = {
  keyboard: {
    components: [KeyboardInput],
    listen: { changed: true }
  }
}
