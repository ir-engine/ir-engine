import { Entity } from "ecsy"
import Binary from "../../common/enums/Binary"
import Input from "../components/Input"
import Axis from "../../axis/components/Axis"
import Behavior from "../../common/interfaces/Behavior"
import { AxisType } from "../../axis/enums/AxisType"

let input: Input
export const handleMouseMovement: Behavior = (entityIn: Entity, args: { e: MouseEvent }, entityOut: Entity): void => {
  input = entityIn.getComponent(Input)
  if (!input || input.inputMap.mouseAxisMap === undefined) return
  entityOut.getMutableComponent(Axis).data.set(input.inputMap.mouseAxisMap.axes.mousePosition, {
    type: AxisType.TWOD,
    value: [(args.e.clientX / window.innerWidth) * 2 - 1, (args.e.clientY / window.innerHeight) * -2 + 1]
  })
}

export const handleMouseButton: Behavior = (entityIn: Entity, args: { e: MouseEvent; value: Binary }, entityOut: Entity): void => {
  input = entityIn.getComponent(Input)
  if (!input || input.inputMap.mouseAxisMap.buttons[args.e.button] === undefined) return
  entityOut.getMutableComponent(Axis).data.set(input.inputMap.mouseAxisMap.buttons[args.e.button], {
    type: AxisType.BUTTON,
    value: args.value
  })
}
