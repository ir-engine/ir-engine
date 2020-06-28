import { System, Entity } from "ecsy"
import KeyboardInput from "../components/KeyboardInput"
import ActionState from "../enums/ActionState"
import UserActionQueue from "../components/Action"

export default class KeyboardInputSystem extends System {
  kb: KeyboardInput

  execute(): void {
    // Query for user action queue
    this.queries.keyboard.added.forEach(entity => {
      document.addEventListener("keydown", (e: KeyboardEvent) => {
        this.mapKeyToAction(entity, e.key, ActionState.START)
      })
      document.addEventListener("keyup", (e: KeyboardEvent) => {
        this.mapKeyToAction(entity, e.key, ActionState.END)
      })
    })
    this.queries.keyboard.removed.forEach(entity => {
      document.removeEventListener("keydown", (e: KeyboardEvent) => {
        this.mapKeyToAction(entity, e.key, ActionState.START)
      })
      document.removeEventListener("keyup", (e: KeyboardEvent) => {
        this.mapKeyToAction(entity, e.key, ActionState.END)
      })
    })
  }

  mapKeyToAction(entity: Entity, key: string, value: ActionState): any {
    this.kb = entity.getComponent(KeyboardInput)
    if (this.kb.keyboardInputActionMap[key] === undefined) return

    // Add to action queue
    entity.getComponent(UserActionQueue).actions.add({
      action: this.kb.keyboardInputActionMap[key],
      state: value
    })
  }
}

KeyboardInputSystem.queries = {
  keyboard: {
    components: [KeyboardInput, UserActionQueue],
    listen: { added: true, removed: true }
  }
}
