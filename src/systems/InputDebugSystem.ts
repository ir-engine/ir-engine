import { System } from "ecsy"
import InputActionHandler from "../components/InputActionHandler"
import UserInput from "../components/UserInput"
import InputAxisHandler from "../components/InputAxisHandler"
import InputReceiver from "../components/InputReceiver"

export default class InputDebugSystem extends System {
  _userInputActionQueue: InputActionHandler
  public execute(): void {
    this.queries.actionReceivers.changed.forEach(entity => {
      console.log("Action: ")
      console.log(entity.getComponent(InputActionHandler).queue.toArray[0])
    })
    this.queries.axisReceivers.changed.forEach(entity => {
      console.log("Axis: ")
      console.log(entity.getComponent(InputAxisHandler).queue.toArray[0])
    })
  }
}

InputDebugSystem.queries = {
  actionReceivers: {
    components: [UserInput, InputActionHandler],
    listen: { changed: true }
  },
  axisReceivers: {
    components: [InputReceiver, InputAxisHandler],
    listen: { changed: true }
  }
}
