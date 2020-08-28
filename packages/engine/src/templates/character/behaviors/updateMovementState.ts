import { Entity } from "../../../ecs/classes/Entity"
import { Input } from "../../../input/components/Input"
import { addState } from "../../../state/behaviors/StateBehaviors"
import { getComponent } from "../../../ecs/functions/EntityFunctions"
import { DefaultInput } from "../../shared/DefaultInput"
import { Behavior } from "../../../common/interfaces/Behavior"
import { BinaryValue } from "../../../common/enums/BinaryValue"

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
  input = getComponent(entity, Input)
  moving = false
  movementInputs.forEach(direction => {
    if (input.data.get(direction)?.value == BinaryValue.ON) moving = true
  })
  addState(entity, { state: moving ? CharacterStateTypes.MOVING : CharacterStateTypes.IDLE })
}