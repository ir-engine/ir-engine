import { System } from "ecsy"
import Input from "../components/Input"

export default class InputDebugSystem extends System {
  _actionDataUIElement: any
  _inputDataUIElement: any
  public execute(): void {
    // TODO: buttons, input, need to switch these receivers
    this.queries.actionReceivers.changed.forEach(entity => {
      const values = entity.getComponent(Input).map.to
      if (values.getBufferLength() > 0) {
        this._actionDataUIElement = document.getElementById("actionData")
        if (this._actionDataUIElement) {
          this._actionDataUIElement.innerHTML = values
            .toArray()
            .map((element, index) => {
              return index + ": " + element.input + " | " + element.value
            })
            .join("<br/>")
        }
      }
    })
    this.queries.inputReceivers.changed.forEach(entity => {
      const inputHandler = entity.getComponent(Input)
      if (inputHandler.values.getBufferLength() > 0) {
        console.log("Input: " + inputHandler.values.getBufferLength())
      }

      this._inputDataUIElement = document.getElementById("inputData")
      if (this._inputDataUIElement) {
        this._inputDataUIElement.innerHTML = inputHandler.values
          .toArray()
          .map((element, index) => {
            return `${index}:  ${element.input} | x: ${element.value[0]} | y: ${element.value[1]}`
          })
          .join("<br />")
      }
    })
  }
}

InputDebugSystem.queries = {
  inputReceivers: {
    components: [Input],
    listen: { changed: true }
  }
}
