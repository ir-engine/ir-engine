import { Entity } from "ecsy"
import BinaryValue from "../../common/enums/BinaryValue"
import Input from "../components/Input"
import Behavior from "../../common/interfaces/Behavior"
import { InputType } from "../../input/enums/InputType"

let input: Input
export const handleMouseMovement: Behavior = (entityIn: Entity, args: { e: MouseEvent }, entityOut: Entity): void => {
  input = entityIn.getComponent(Input)
  if (!input || input.inputMap.mouseInputMap === undefined) return
  entityOut.getMutableComponent(Input).data.set(input.inputMap.mouseInputMap.input.mousePosition, {
    type: InputType.TWOD,
    value: [(args.e.clientX / window.innerWidth) * 2 - 1, (args.e.clientY / window.innerHeight) * -2 + 1]
  })
}

export const handleMouseButton: Behavior = (entityIn: Entity, args: { e: MouseEvent; value: BinaryValue }, entityOut: Entity): void => {
  input = entityIn.getComponent(Input)
  if (!input || input.inputMap.mouseInputMap.buttons[args.e.button] === undefined) return
  entityOut.getMutableComponent(Input).data.set(input.inputMap.mouseInputMap.buttons[args.e.button], {
    type: InputType.BUTTON,
    value: args.value
  })
}

export function handleKey(entity: Entity, key: string, value: BinaryValue): any {
  input = entity.getComponent(Input)
  if (input.inputMap.keyboardInputMap.input[key] === undefined) return
  entity.getMutableComponent(Input).data.set(input.inputMap.keyboardInputMap.input[key], {
    type: InputType.BUTTON,
    value: value
  })
}
