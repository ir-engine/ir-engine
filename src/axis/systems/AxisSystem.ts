import { System } from "ecsy"
import Axis from "../components/Axis"
import { handleButtonAxes } from "../behaviors/handleButtonAxes"
import { handleContinuousAxes } from "../behaviors/handleContinuousAxes"

export default class AxisSystem extends System {
  public execute(delta: number, time: number): void {
    this.queries.actionStateComponents.results.forEach(entity => {
      handleButtonAxes(entity, delta)
    })

    this.queries.axisStateComponents.results.forEach(entity => {
      handleContinuousAxes(entity, delta)
    })
  }
}
AxisSystem.queries = {
  actionStateComponents: {
    components: [Axis]
  }
}

function handleContinuousAxes(entity: Entity, delta: number) {
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

import { Entity } from "ecsy"
import { Scalar, Vector2, Vector3 } from "../../common/types/NumericalTypes"
import Binary from "../../common/enums/Binary"
// TODO: Delete and generalize me!!!
// TODO: Consolidate axis and axis
// TODO: We should just map generally!
export function handleButtonAxes(entity: Entity, delta: number) {
  this._inputActionHandler = entity.getComponent(Axis)
  this._actionStateData = entity.getComponent(Axis).data

  this._inputActionHandler.values.toArray().forEach((axisValue: AxisValue<Binary | Scalar | Vector2 | Vector3>) => {
    console.log("axis value: ")
    console.log(axisValue)
    if (this._actionStateData.axes[axisValue.axis] !== undefined && this._actionStateData.axes[axisValue.axis][axisValue.value] !== undefined) {
      this._args = { entityIn: entity, ...this._actionStateData.axes[axisValue.axis][axisValue.value].args }
      Function.call(this._actionStateData.axes[axisValue.axis][axisValue.value].behavior, this._args, delta)
    }
  })
}

