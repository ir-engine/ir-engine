import { System } from "ecsy"
import Axis from "../components/Axis"

export default class InputDebugSystem extends System {
  _actionDataUIElement: any
  _axisDataUIElement: any
  public execute(): void {
    // TODO: buttons, axes, need to switch these receivers
    const values = entity.getComponent(Axis).values
    this.queries.actionReceivers.changed.forEach(entity => {
      if (values.getBufferLength() > 0) {
        this._actionDataUIElement = document.getElementById("actionData")
        if (this._actionDataUIElement) {
          this._actionDataUIElement.innerHTML = values
            .toArray()
            .map((element, index) => {
              return index + ": " + element.axis + " | " + element.value
            })
            .join("<br/>")
        }
      }
    })
    this.queries.axisReceivers.changed.forEach(entity => {
      const inputHandler = entity.getComponent(Axis)
      if (inputHandler.values.getBufferLength() > 0) {
        console.log("Axes: " + inputHandler.values.getBufferLength())
      }

      this._axisDataUIElement = document.getElementById("axisData")
      if (this._axisDataUIElement) {
        this._axisDataUIElement.innerHTML = inputHandler.values
          .toArray()
          .map((element, index) => {
            return `${index}:  ${element.axis} | x: ${element.value[0]} | y: ${element.value[1]}`
          })
          .join("<br />")
      }
    })
  }
}

InputDebugSystem.queries = {
  axisReceivers: {
    components: [Axis],
    listen: { changed: true }
  }
}
