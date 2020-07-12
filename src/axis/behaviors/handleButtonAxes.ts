import { Entity } from "ecsy"
import Axis from "../components/Axis"
// TODO: Delete and generalize me!!!
// TODO: Consolidate axis and axis
// TODO: We should just map generally!
export function handleButtonAxes(entity: Entity, delta: number) {
  this._inputActionHandler = entity.getComponent(Axis)
  this._actionStateData = entity.getComponent(Axis).data

  this._inputActionHandler.values.toArray().forEach((axisValue: AxisValue) => {
    console.log("axis value: ")
    console.log(axisValue)
    if (this._actionStateData.axes[axisValue.axis] !== undefined && this._actionStateData.axes[axisValue.axis][axisValue.value] !== undefined) {
      this._args = { entityIn: entity, ...this._actionStateData.axes[axisValue.axis][axisValue.value].args }
      Function.call(this._actionStateData.axes[axisValue.axis][axisValue.value].behavior, this._args, delta)
    }
  })
}
