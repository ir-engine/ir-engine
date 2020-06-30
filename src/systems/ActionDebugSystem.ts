import { System, Not } from "ecsy"
import InputActionQueue from "../components/InputActionQueue"
import Input from "../components/Input"
import InputReceiver from "../components/InputReceiver"

export default class ActionDebugSystem extends System {
  _userInputActionQueue: InputActionQueue
  public execute(): void {
    this.queries.actionReceivers.changed.forEach(entity => {
      console.log("ActionDebugSystem: ")
      console.log(entity.getComponent(InputActionQueue).actions.toArray())
    })
  }
}

ActionDebugSystem.queries = {
  actionReceivers: {
    components: [InputActionQueue, InputReceiver, Not(Input)],
    listen: { changed: true }
  }
}
