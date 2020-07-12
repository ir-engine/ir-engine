import { Entity } from "ecsy"
import Input from "../components/Input"
import InputValue from "../interfaces/InputValue"
import { Scalar, Vector2, Vector3 } from "../../common/types/NumericalTypes"
import BinaryValue from "../../common/enums/BinaryValue"
// TODO: Delete and generalize me!!!
// TODO: Consolidate input and input
// TODO: We should just map generally!
export function handleButtonInput(entity: Entity, delta: number) {
  this._inputActionHandler = entity.getComponent(Input)
  this._actionStateData = entity.getComponent(Input).data

  this._inputActionHandler.values.toArray().forEach((inputValue: InputValue<BinaryValue | Scalar | Vector2 | Vector3>) => {
    console.log("input value: ")
    console.log(inputValue)
    if (this._actionStateData.input[inputValue.type] !== undefined && this._actionStateData.input[inputValue.type][inputValue.value] !== undefined) {
      this._args = { entityIn: entity, ...this._actionStateData.input[inputValue.type][inputValue.value].args }
      Function.call(this._actionStateData.input[inputValue.type][inputValue.value].behavior, this._args, delta)
    }
  })
}

function handleButtonInput(entity: Entity, delta: number) {
  this._inputActionHandler = entity.getComponent(Input)
  this._actionStateData = entity.getComponent(Input).data

  this._inputActionHandler.values.toArray().forEach((inputValue: InputValue<BinaryValue | Scalar | Vector2 | Vector3>) => {
    console.log("input value: ")
    console.log(inputValue)
    if (this._actionStateData.input[inputValue.input] !== undefined && this._actionStateData.input[inputValue.input][inputValue.value] !== undefined) {
      this._args = { entityIn: entity, ...this._actionStateData.input[inputValue.input][inputValue.value].args }
      Function.call(this._actionStateData.input[inputValue.input][inputValue.value].behavior, this._args, delta)
    }
  })
}