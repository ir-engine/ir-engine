// TODO: Consolidate into one function
import { Entity } from "ecsy"
import Binary from "../../common/enums/Binary"
import UserInput from "../components/Input"
import Axis from "../../axis/components/Axis"
import Behavior from "../../common/interfaces/Behavior"

export const handleMouseMovement: Behavior = (entityIn: Entity, args: { e: MouseEvent }): void => {
  entityIn.getComponent(Axis).values.add({
    axis: this._mouse.getComponent(UserInput).inputMap.mouse.axes.mousePosition,
    value: [(args.e.clientX / window.innerWidth) * 2 - 1, (args.e.clientY / window.innerHeight) * -2 + 1]
  })
}
export const handleMouseButton = (e: MouseEvent, entity: Entity, value: Binary): void => {
  if (!this._mouse || this._mouse.getComponent(UserInput).inputMap.mouse.axes[e.button] === undefined) return
  entity.getMutableComponent(Axis).values.add({
    axis: this._mouse.getComponent(UserInput).inputMap.mouse.axes[e.button],
    value: value
  })
}
