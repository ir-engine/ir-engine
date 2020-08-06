import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"

import Input from "../../../input/components/Input"
import { DefaultInput } from "../../../input/defaults/DefaultInput"

import { DefaultStateTypes } from "../../../state/defaults/DefaultStateTypes"
import { addState } from "../../../state/behaviors/StateBehaviors"

import BinaryValue from "../../enums/BinaryValue"
let input: Input
let moving: boolean
const movementInputs = [
  DefaultInput.FORWARD,
  DefaultInput.BACKWARD,
  // DefaultInput.UP,
  // DefaultInput.DOWN,
  DefaultInput.LEFT,
  DefaultInput.RIGHT
]
export const updateMovementState: Behavior = (entity: Entity): void => {
  input = entity.getComponent(Input)
  moving = false
  movementInputs.forEach(direction => {
    if (input.data.get(direction)?.value == BinaryValue.ON) moving = true
  })
  addState(entity, { state: moving ? DefaultStateTypes.MOVING : DefaultStateTypes.IDLE })
}
