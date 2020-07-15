import { System } from "ecsy"
import Input from "../components/Input"
import { handleInput } from "../behaviors/handleInput"
import { DefaultInputMap } from "../defaults/DefaultInputData"
export default class InputSystem extends System {
  private _inputComponent: Input
  public execute(delta: number): void {
    this.queries.inputs.added.forEach(entity => {
      this._inputComponent = entity.getComponent(Input)
      // TODO: Map is not defined
      if (this._inputComponent.map === undefined) this._inputComponent.map = DefaultInputMap

      // Call all behaviors in "onAdded" of input map
      this._inputComponent.map.onAdded.forEach(behavior => {
        behavior.behavior(entity, { ...behavior.args })
      })

      Object.keys(this._inputComponent.map.eventBindings)?.forEach((key: string) => {
        document.addEventListener(key, e => {
          this._inputComponent.map.eventBindings[key].behavior(entity, { event: e, ...this._inputComponent.map.eventBindings[key].args })
        })
      })
    })

    // Call all behaviors in "onRemoved" of input map
    this.queries.inputs.removed.forEach(entity => {
      this._inputComponent = entity.getComponent(Input)
      this._inputComponent.map.onRemoved.forEach(behavior => {
        behavior.behavior(entity, { ...behavior.args })
      })
      // Unbind events from DOM
      if (!this._inputComponent.map.eventBindings) return
      Object.keys(this._inputComponent.map.eventBindings).forEach((key: string) => {
        document.addEventListener(key, e => {
          this._inputComponent.map.eventBindings[key].behavior(entity, { event: e, ...this._inputComponent.map.eventBindings[key].args })
        })
      })
    })

    this.queries.inputs.results.forEach(entity => {
      this._inputComponent = entity.getComponent(Input)
      handleInput(entity, delta)
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
