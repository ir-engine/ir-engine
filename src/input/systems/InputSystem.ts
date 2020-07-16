import { System } from "ecsy"
import Input from "../components/Input"
import { DefaultInputMap } from "../defaults/DefaultInputData"
import { Entity } from "ecsy"
import { NumericalType } from "../../common/types/NumericalTypes"
import Behavior from "../../common/interfaces/Behavior"
import InputValue from "../interfaces/InputValue"
import InputAlias from "../types/InputAlias"
import { InputType } from "../enums/InputType"
import LifecycleValue from "../../common/enums/LifecycleValue"
import BinaryValue from "../../common/enums/BinaryValue"

export default class InputSystem extends System {
  // Temp/ref variables
  private _inputComponent: Input

  public execute(delta: number): void {
    // Called when input component is added to entity
    this.queries.inputs.added.forEach(entity => {
      // Get component reference
      this._inputComponent = entity.getComponent(Input)
      // If input doesn't have a map, set the default
      if (this._inputComponent.map === undefined) this._inputComponent.map = DefaultInputMap
      // Call all behaviors in "onAdded" of input map
      this._inputComponent.map.onAdded.forEach(behavior => {
        behavior.behavior(entity, { ...behavior.args })
      })
      // Bind DOM events to event behavior
      Object.keys(this._inputComponent.map.eventBindings)?.forEach((key: string) => {
        document.addEventListener(key, e => {
          this._inputComponent.map.eventBindings[key].behavior(entity, { event: e, ...this._inputComponent.map.eventBindings[key].args })
        })
      })
    })

    // Called when input component is removed from entity
    this.queries.inputs.removed.forEach(entity => {
      // Get component reference
      this._inputComponent = entity.getComponent(Input)
      // Call all behaviors in "onRemoved" of input map
      this._inputComponent.map.onRemoved.forEach(behavior => {
        behavior.behavior(entity, behavior.args)
      })
      // Unbind events from DOM
      Object.keys(this._inputComponent.map.eventBindings).forEach((key: string) => {
        document.addEventListener(key, e => {
          this._inputComponent.map.eventBindings[key].behavior(entity, { event: e, ...this._inputComponent.map.eventBindings[key].args })
        })
      })
    })

    // Called every frame on all input components
    this.queries.inputs.results.forEach(entity => handleInput(entity, delta))
  }
}

let input: Input
export const handleInput: Behavior = (entity: Entity, delta: number): void => {
  input = entity.getComponent(Input)

  input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
    if (value.type === InputType.BUTTON) {
      if (input.map.inputButtonBehaviors[key] && input.map.inputButtonBehaviors[key][value.value as number]) {
        if (value.lifecycleState === undefined || value.lifecycleState === LifecycleValue.STARTED) {
          input.data.set(key, {
            type: value.type,
            value: value.value as BinaryValue,
            lifecycleState: LifecycleValue.CONTINUED
          })
          input.map.inputButtonBehaviors[key][value.value as number].behavior(
            entity,
            input.map.inputButtonBehaviors[key][value.value as number].args,
            delta
          )
        }
      }
    } else if (value.type === InputType.ONED || value.type === InputType.TWOD || value.type === InputType.THREED) {
      if (input.map.inputAxisBehaviors[key]) {
        if (value.lifecycleState === undefined || value.lifecycleState === LifecycleValue.STARTED) {
          input.data.set(key, {
            type: value.type,
            value: value.value as BinaryValue,
            lifecycleState: LifecycleValue.CONTINUED
          })
          input.map.inputButtonBehaviors[key][value.value as number].behavior(entity, input.map.inputAxisBehaviors[key].args, delta)
        }
      }
    } else {
      console.error("handleInput called with an invalid input type")
    }
  })
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
