import { System, Not } from "ecsy"
import InputActionHandler from "../components/InputActionHandler"
import InputAxisHandler2D from "../components/InputAxisHandler2D"
import InputReceiver from "../components/InputReceiver"
import UserInput from "../components/UserInput"

export default class InputDebugSystem extends System {
  _actionDataUIElement: any
  _axisDataUIElement: any
  public execute(): void {
    this.queries.actionReceivers.changed.forEach(entity => {
      if (entity.getComponent(InputActionHandler).queue.getBufferLength() > 0) {
        entity
          .getComponent(InputActionHandler)
          .queue.toArray()
          .forEach(element => {
            console.log(element)
            this._actionDataUIElement = document.getElementById("axisData")
            if (this._actionDataUIElement !== undefined) {
              this._actionDataUIElement.innerHTML = entity.getComponent(InputAxisHandler2D).queue.toArray()
            }
          })
      }
    })
    this.queries.axisReceivers.changed.forEach(entity => {
      if (entity.getComponent(InputAxisHandler2D).queue.getBufferLength() > 0)
        console.log("Axes: " + entity.getComponent(InputAxisHandler2D).queue.getBufferLength())
      this._axisDataUIElement = document.getElementById("axisData")
      if (this._axisDataUIElement !== undefined) {
        this._axisDataUIElement.innerHTML = entity.getComponent(InputAxisHandler2D).queue.toArray()
      }
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
