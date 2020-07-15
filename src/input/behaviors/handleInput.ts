import { Entity } from "ecsy"
import { NumericalType } from "../../common/types/NumericalTypes"
import Input from "../components/Input"
import Behavior from "../../common/interfaces/Behavior"
import InputValue from "../interfaces/AxisValue"
import InputAlias from "../types/InputAlias"
import { InputType } from "../enums/InputType"

let input: Input
let outputArgs: { entity: Entity; args: any }
export const handleInput: Behavior = (entity: Entity, delta: number): void => {
  input = entity.getComponent(Input)

  input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
    if (value.type === InputType.BUTTON) {
      if (input.map.inputButtonBehaviors[key] && input.map.inputButtonBehaviors[key][value.value as number]) {
        console.log("key is: " + key)
        console.log(input.map.inputButtonBehaviors[key])
        input.map.inputButtonBehaviors[key][value.value as number].behavior(
          entity,
          input.map.inputButtonBehaviors[key][value.value as number].args,
          delta
        )
      }
    } else if (value.type === InputType.ONED || value.type === InputType.TWOD || value.type === InputType.THREED) {
      if (input.map.inputAxisBehaviors[key]) {
        outputArgs = { entity: entity, args: input.map.inputAxisBehaviors[key].args }
        input.map.inputButtonBehaviors[key][value.value as number].behavior(entity, input.map.inputAxisBehaviors[key].args, delta)
      }
    } else {
      console.error("handleInput called with an invalid input type")
    }
  })
}
