import { System, Not } from "ecsy"
import ActionQueue from "../components/ActionQueue"
import Input from "../components/Input"
import UserInputReceiver from "../components/UserInputReceiver"

export default class ActionDebugSystem extends System {
  _userInputActionQueue: ActionQueue
  public execute(): void {
    this.queries.actionReceivers.changed.forEach(entity => {
      console.log(entity.getComponent(ActionQueue).actions.toArray())
    })
  }
}

ActionDebugSystem.queries = {
  actionReceivers: {
    components: [ActionQueue, UserInputReceiver, Not(Input)],
    listen: { changed: true }
  }
}
