import { System } from "ecsy"
import Input from "../components/Input"
import { Entity } from "ecsy"
import { Scalar, Vector2, Vector3 } from "../../common/types/NumericalTypes"
import BinaryValue from "../../common/enums/BinaryValue"

export default class InputSystem extends System {
  public execute(delta: number, time: number): void {
    this.queries.actionStateComponents.results.forEach(entity => {
      handleButtonInput(entity)
    })

    this.queries.inputStateComponents.results.forEach(entity => {
      handleContinuousInput(entity, delta)
    })
  }
}
InputSystem.queries = {
  actionStateComponents: {
    components: [Input]
  }
}

let inputValue: any
let stateValueOut: any
let input: Input
// TODO: Fix (but after changing map over)
export const handleButtonInput: Behavior = (entityIn: Entity, args: { state: StateAlias; value: Scalar | Vector2 | Vector3; multiplier?: number }): void => {
  // get input component and set local reference
  input = entityIn.getComponent(Input)

  // get state and set with input
  vec2.scale(stateValueOut, inputValue, args.multiplier ? args.multiplier : 1)
  entityIn.getMutableComponent(Input).map.inputButtonBehaviors[args.input]


    .values.toArray()
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
      this._actionStateData.input[inputValue.input].behavior.call(this._args)
    }
  })
}
