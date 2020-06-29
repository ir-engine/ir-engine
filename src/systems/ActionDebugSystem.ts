import { System, Not } from "ecsy"
import ActionQueue from "../components/ActionQueue"
import Input from "../components/Input"
import InputReceiver from "../components/InputReceiver"

export default class ActionDebugSystem extends System {
  _userInputActionQueue: ActionQueue
  public execute(): void {
    this.queries.actionReceivers.changed.forEach(entity => {
      console.log("ActionDebugSystem: ")
      console.log(entity.getComponent(ActionQueue).actions.toArray())
    })
  }
}

ActionDebugSystem.queries = {
  actionReceivers: {
    components: [ActionQueue, InputReceiver, Not(Input)],
    listen: { changed: true }
  }
}
