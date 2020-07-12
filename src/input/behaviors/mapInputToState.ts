import { InputType } from "../enums/InputType"

// TODO: Replace queue with map so we can read continuous more performantly
// TODO: Type evaluations here are messy, could be cleaner
let inputValue: InputValue<any>
let inputValueOut: Vector2
let input: Input
let state: State
export const mapInputToState: Behavior = (entityIn: Entity, args: { input: InputAlias; inputType: InputType; multiplier?: number }): void => {
  state = entityIn.getComponent(State)
  input = entityIn.getComponent(Input)
  if (args.inputType === InputType.TWOD) {
    inputValue = input.data.get(args.input).value

    // get state and set with input
    vec2.scale(inputValueOut, inputValue, args.multiplier ? args.multiplier : 1)
    state = entityIn.getMutableComponent(State)
    state.data.get(state.behaviorMap.states[])...1
  // TODO: Fix states this fix this!

      .values.toArray()
      .filter(value => {
        value.type === args.inputType
      })[0].value = inputValueOut
  }

  return console.log("mapInputToBlendstate: " + entityIn.id)
}





import { Entity } from "ecsy"
import { Scalar, Vector3, Vector2 } from "../../common/types/NumericalTypes"
import State from "../../state/components/State"
import InputAlias from "../types/InputAlias"
import Input from "../components/Input"
import { vec2 } from "gl-matrix"
import Behavior from "../../common/interfaces/Behavior"

let stateValueOut: any

// TODO: Fix (but after changing map over)
export const handleInput: Behavior = (
  entityIn: Entity,
  args: { input: InputAlias; dimensions: Scalar | Vector2 | Vector3; multiplier?: number }
): void => {
  // get input component and set local reference
  inputValue = entityIn.getComponent(Input).data.get(args.input).value

  // get state and set with input
  vec2.scale(stateValueOut, inputValue, args.multiplier ? args.multiplier : 1)
  entityIn
    .getMutableComponent(State)
    .values.toArray()
    .filter(value => {
      value.type === args.dimensions
    })[0].value = stateValueOut
}

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
