import { System, Not } from "ecsy"
import InputActionHandler from "../components/InputActionHandler"
import InputAxisHandler2D from "../components/InputAxisHandler2D"
import InputReceiver from "../components/InputReceiver"
import UserInput from "../components/UserInput"

export default class InputDebugSystem extends System {
  public execute(): void {
    this.queries.actionReceivers.changed.forEach(entity => {
      if (entity.getComponent(InputActionHandler).queue.getBufferLength() > 0) {
        entity
          .getComponent(InputActionHandler)
          .queue.toArray()
          .forEach(element => {
            console.log(element)
          })
      }
    })
    this.queries.axisReceivers.changed.forEach(entity => {
      if (entity.getComponent(InputAxisHandler2D).queue.getBufferLength() > 0)
        console.log("Axes: " + entity.getComponent(InputAxisHandler2D).queue.getBufferLength())
    })
  }
}

InputDebugSystem.queries = {
  actionReceivers: {
    components: [InputReceiver, InputActionHandler, Not(UserInput)],
    listen: { changed: true }
  },
  axisReceivers: {
    components: [InputReceiver, InputAxisHandler2D, Not(UserInput)],
    listen: { changed: true }
  }
}
