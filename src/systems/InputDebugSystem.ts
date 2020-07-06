import { System } from "ecsy"
import InputActionHandler from "../components/InputActionHandler"
import InputAxisHandler2D from "../components/InputAxisHandler2D"
import InputReceiver from "../components/InputReceiver"

export default class InputDebugSystem extends System {
  _actionDataUIElement: any
  _axisDataUIElement: any
  public execute(): void {
    this.queries.actionReceivers.changed.forEach(entity => {
      if (entity.getComponent(InputActionHandler).values.getBufferLength() > 0) {
        entity
          .getComponent(InputActionHandler)
          .values.toArray()
          .forEach(element => {
            console.log(element)
            this._actionDataUIElement = document.getElementById("actionData")
            if (this._actionDataUIElement) {
              this._actionDataUIElement.innerHTML =
                entity.getComponent(InputActionHandler).values.toArray()[0].action +
                " | " +
                entity.getComponent(InputActionHandler).values.toArray()[0].value
            }
          })
      }
    })
    this.queries.axisReceivers.changed.forEach(entity => {
      if (entity.getComponent(InputAxisHandler2D).values.getBufferLength() > 0)
        console.log("Axes: " + entity.getComponent(InputAxisHandler2D).values.getBufferLength())
      this._axisDataUIElement = document.getElementById("axisData")
      if (this._axisDataUIElement) {
        this._axisDataUIElement.innerHTML =
          entity.getComponent(InputAxisHandler2D).values.toArray()[0].axis +
          " | x: " +
          entity.getComponent(InputAxisHandler2D).values.toArray()[0].value.x +
          " | y: " +
          entity.getComponent(InputAxisHandler2D).values.toArray()[0].value.y
      }
    })
  }
}

InputDebugSystem.queries = {
  actionReceivers: {
    components: [InputReceiver, InputActionHandler],
    listen: { changed: true }
  },
  axisReceivers: {
    components: [InputReceiver, InputAxisHandler2D],
    listen: { changed: true }
  }
}
