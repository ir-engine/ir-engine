import { Entity } from "ecsy"
import { NumericalType } from "../../common/types/NumericalTypes"
import Input from "../components/Input"
import Behavior from "../../common/interfaces/Behavior"
import InputValue from "../interfaces/AxisValue"
import InputAlias from "../types/InputAlias"
import { InputType } from "../enums/InputType"

let input: Input
let outputArgs: { entityIn: Entity; args: any }
export const handleInput: Behavior = (entityIn: Entity, delta: number): void => {
  input = entityIn.getComponent(Input)

  input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
    if (value.type === InputType.BUTTON) {
      if (input.map.inputButtonBehaviors[key] && input.map.inputButtonBehaviors[key][value.value as number]) {
        outputArgs = { entityIn: entityIn, args: input.map.inputButtonBehaviors[key][value.value as number].args }
        Function.call(input.map.inputButtonBehaviors[key][value.value as number].behavior, outputArgs, delta)
      }
    } else if (value.type === InputType.ONED || value.type === InputType.TWOD || value.type === InputType.THREED) {
      if (input.map.inputAxisBehaviors[key]) {
        outputArgs = { entityIn: entityIn, args: input.map.inputAxisBehaviors[key].args }
        Function.call(input.map.inputAxisBehaviors[key].behavior, outputArgs, delta)
      }
    } else {
      console.error("handleInput called with an invalid input type")
    }
  })
}
