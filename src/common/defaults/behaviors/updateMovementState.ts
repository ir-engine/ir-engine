import { Entity } from "../../../ecs/Entity"
import { Input } from "../../../input/components/Input"
import { DefaultInput } from "../../../input/defaults/DefaultInput"
import { addState } from "../../../state/behaviors/StateBehaviors"
import { DefaultStateTypes } from "../../../state/defaults/DefaultStateTypes"
import { BinaryValue } from "../../enums/BinaryValue"
import { Behavior } from "../../interfaces/Behavior"

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
