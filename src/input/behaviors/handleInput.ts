import { Entity } from "ecsy"
import { Scalar, Vector3, Vector2 } from "../../common/types/NumericalTypes"
import State from "../../state/components/State"
import InputAlias from "../types/InputAlias"
import Input from "../components/Input"
import InputValue from "../interfaces/InputValue"
import { vec2 } from "gl-matrix"
import Behavior from "../../common/interfaces/Behavior"
import Input from "../components/Input"
import StateAlias from "../../state/types/StateAlias"

let inputValue: any
let stateValueOut: any
let input: Input
// TODO: Fix (but after changing map over)
export const handleInput: Behavior = (
  entityIn: Entity,
  args: { state: StateAlias; value: Scalar | Vector2 | Vector3; multiplier?: number }
): void => {
  // get input component and set local reference
  input = entityIn.getComponent(Input)

  // get state and set with input
  vec2.scale(stateValueOut, inputValue, args.multiplier ? args.multiplier : 1)
  entityIn
    .getMutableComponent(Input)
    .behaviorMap.inputButtonsToState[args.input].values.toArray()
    .filter(value => {
      value.type === args.dimensions
    })[0].value = stateValueOut
}

//  Behavior = (entityIn: Entity, args: { state: StateAlias; value: Scalar | Vector2 | Vector3; multiplier?: number }): void => {
function handleContinuousInput(entity: Entity, delta: number) {
  this._inputInputHandler = entity.getComponent(Input)
  this._actionStateData = entity.getComponent(Input).data
  this._inputInputHandler.values.toArray().forEach((inputValue: InputValue<Vector2>) => {
    console.log("Input: ")
    console.log(this._actionStateData.input[inputValue.input])
    if (this._actionStateData.input[inputValue.input] !== undefined) {
      this._args = { entityIn: entity, delta, ...{ args: this._actionStateData.input[inputValue.input].args ?? {} } }
      console.log(this._args)
      this._actionStateData.input[inputValue.input].behavior.call(this._args)
    }
  })
}
