import { Entity } from "ecsy"
import Binary from "../../common/enums/Binary"
import Input from "../components/Input"
import Axis from "../../axis/components/Axis"
import { AxisType } from "../../axis/enums/AxisType"
let input: Input
export function handleKey(entity: Entity, key: string, value: Binary): any {
  input = entity.getComponent(Input)
  if (input.inputMap.keyboardAxisMap.axes[key] === undefined) return
  entity.getMutableComponent(Axis).data.set(input.inputMap.keyboardAxisMap.axes[key], {
    type: AxisType.BUTTON,
    value: value
  })
}
