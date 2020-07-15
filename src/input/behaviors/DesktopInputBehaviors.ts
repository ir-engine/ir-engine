import { Entity } from "ecsy"
import BinaryValue from "../../common/enums/BinaryValue"
import Input from "../components/Input"
import Behavior from "../../common/interfaces/Behavior"
import { InputType } from "../../input/enums/InputType"

let input: Input
export const handleMouseMovement: Behavior = (entity: Entity, args: { event: MouseEvent }): void => {
  input = entity.getComponent(Input)
  if (!input || input.map.mouseInputMap === undefined) return
  entity.getMutableComponent(Input).data.set(input.map.mouseInputMap["mousePosition"], {
    type: InputType.TWOD,
    value: [(args.event.clientX / window.innerWidth) * 2 - 1, (args.event.clientY / window.innerHeight) * -2 + 1]
  })
}

export const handleMouseButton: Behavior = (entity: Entity, args: { event: MouseEvent; value: BinaryValue }, delta: number): void => {
  input = entity.getComponent(Input)
  if (!input || input.map.mouseInputMap.buttons[args.event.button] === undefined) return
  entity.getMutableComponent(Input).data.set(input.map.mouseInputMap.buttons[args.event.button], {
    type: InputType.BUTTON,
    value: args.value
  })
}

export function handleKey(entity: Entity, args: { event: KeyboardEvent; value: BinaryValue }): any {
  input = entity.getComponent(Input)
  if (input.map.keyboardInputMap[args.event.key] === undefined) return
  entity.getMutableComponent(Input).data.set(input.map.keyboardInputMap[args.event.key], {
    type: InputType.BUTTON,
    value: args.value
  })
}
