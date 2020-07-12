import { Entity } from "ecsy"
import Axis from "../components/Axis"
import AxisValue from "../interfaces/AxisValue"
import { Vector2 } from "../../common/types/NumericalTypes"
export function handleContinuousAxes(entity: Entity, delta: number) {
  this._inputAxisHandler = entity.getComponent(Axis)
  this._actionStateData = entity.getComponent(Axis).data
  this._inputAxisHandler.values.toArray().forEach((axisValue: AxisValue<Vector2>) => {
    console.log("Axis: ")
    console.log(this._actionStateData.axes[axisValue.axis])
    if (this._actionStateData.axes[axisValue.axis] !== undefined) {
      this._args = { entityIn: entity, delta, ...{ args: this._actionStateData.axes[axisValue.axis].args ?? {} } }
      console.log(this._args)
      this._actionStateData.axes[axisValue.axis].behavior.call(this._args)
    }
  })
}
