
import { Entity } from "ecsy"
import Behavior from "../../interfaces/Behavior"

import Input from "../../../input/components/Input"
import { DefaultInput } from "../../../input/defaults/DefaultInputData"

import State from "../../../state/components/State"
import { DefaultStateGroups } from "../../../state/defaults/DefaultStateData"
import { DefaultStateTypes } from "../../../state/defaults/DefaultStateTypes"
import { addState } from "../../../state/behaviors/StateBehaviors"

import BinaryValue from "../../enums/BinaryValue"

export const updateMovementState: Behavior = (entity: Entity, args: {}, delta: number): void => {
  let input = entity.getComponent(Input)
  let state = entity.getMutableComponent(State)
  let moving = false
  const movementInputs = [
    DefaultInput.FORWARD,
    DefaultInput.BACKWARD,
    // DefaultInput.UP,
    // DefaultInput.DOWN,
    DefaultInput.LEFT,
    DefaultInput.RIGHT
  ]
  movementInputs.forEach(direction => {
    if (input.data.get(direction)?.value == BinaryValue.ON) moving = true
  })
  const movementState = moving ? DefaultStateTypes.MOVING : DefaultStateTypes.IDLE
  addState(entity, { state: movementState })
}