import { System, Entity } from "ecsy"
import KeyboardInput from "../components/KeyboardInput"
import LifecycleValue from "../enums/LifecycleValue"
import InputActionHandler from "../components/InputActionHandler"
import UserInput from "../components/UserInput"

export default class KeyboardInputSystem extends System {
  // Temp variables
  private _userInput: UserInput

  execute(): void {
    // Query for user action queue
    this.queries.keyboard.added.forEach(entity => {
      this._userInput = entity.getComponent(UserInput)
      document.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.repeat) return
        this.mapKeyToAction(entity, e.key, LifecycleValue.STARTED)
      })
      document.addEventListener("keyup", (e: KeyboardEvent) => {
        this.mapKeyToAction(entity, e.key, LifecycleValue.ENDED)
      })
    })
    this.queries.keyboard.removed.forEach(entity => {
      document.removeEventListener("keydown", (e: KeyboardEvent) => {
        this.mapKeyToAction(entity, e.key, LifecycleValue.STARTED)
      })
      document.removeEventListener("keyup", (e: KeyboardEvent) => {
        this.mapKeyToAction(entity, e.key, LifecycleValue.ENDED)
      })
    })
  }

  mapKeyToAction(entity: Entity, key: string, value: LifecycleValue): any {
    if (this._userInput.inputMap.keyboard.actions[key] === undefined) return
    // Add to action queue
    entity.getMutableComponent(InputActionHandler).values.add({
      action: this._userInput.inputMap[key],
      value: value
    })
  }
}

KeyboardInputSystem.queries = {
  keyboard: {
    components: [KeyboardInput, InputActionHandler, UserInput],
    listen: { added: true, removed: true }
  }
}
