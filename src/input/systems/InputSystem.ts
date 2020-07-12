import { System } from "ecsy"
import Input from "../components/Input"

export default class InputSystem extends System {
  private _inputEntity: Input
  public execute(): void {
    this.queries.inputs.added.forEach(entity => {
      this._inputEntity = entity.getComponent(Input)

      // Call all behaviors in "onAdded" of input map
      this._inputEntity.inputMap.onAdded.forEach(behavior => {
        behavior.behavior.call({
          entityIn: entity.getComponent(Input),
          args: behavior.args
        })
      })

      // Bind events to DOM
      if (!this._inputEntity.inputMap.eventBindings) return
      Object.keys(this._inputEntity.inputMap.eventBindings).forEach((key: string) => {
        document.addEventListener(key, e => {
          this._inputEntity.inputMap.eventBindings[key].behavior.call({
            event: e,
            entityIn: this._inputEntity,
            args: this._inputEntity.inputMap.eventBindings[key].args
          })
        })
      })
    })

    // Call all behaviors in "onRemoved" of input map
    this.queries.inputs.removed.forEach(entity => {
      this._inputEntity.inputMap.onRemoved.forEach(behavior => {
        behavior.behavior.call({
          entityIn: entity.getComponent(Input),
          args: behavior.args
        })
      })
      // Unbind events from DOM
      if (!this._inputEntity.inputMap.eventBindings) return
      Object.keys(this._inputEntity.inputMap.eventBindings).forEach((key: string) => {
        document.addEventListener(key, e => {
          this._inputEntity.inputMap.eventBindings[key].behavior.call({
            event: e,
            entityIn: this._inputEntity,
            args: this._inputEntity.inputMap.eventBindings[key].args
          })
        })
      })
    })
  }
}

InputSystem.queries = {
  inputs: {
    components: [Input],
    listen: {
      added: true,
      removed: true
    }
  }
}
