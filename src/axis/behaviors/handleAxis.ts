import { Entity } from "ecsy"
import { Scalar, Vector3, Vector2 } from "../../common/types/NumericalTypes"
import State from "../../state/components/State"
import AxisAlias from "../types/AxisAlias"
import Axis from "../components/Axis"
import AxisValue from "../interfaces/AxisValue"
import { vec2 } from "gl-matrix"
import Behavior from "../../common/interfaces/Behavior"
import Input from "../../input/components/Input"
import StateAlias from "../../state/types/StateAlias"

let axisValue: any
let stateValueOut: any
let axis: Axis
// TODO: Fix (but after changing map over)
export const handleAxis: Behavior = (entityIn: Entity, args: { state: StateAlias; value: Scalar | Vector2 | Vector3; multiplier?: number }): void => {
  // get axis component and set local reference
  axis = entityIn.getComponent(Axis)

  // get state and set with axis
  vec2.scale(stateValueOut, axisValue, args.multiplier ? args.multiplier : 1)
  entityIn.getMutableComponent(Input).behaviorMap.buttonAxes[args.axis]


    .values.toArray()
    .filter(value => {
      value.type === args.dimensions
    })[0].value = stateValueOut
}

//  Behavior = (entityIn: Entity, args: { state: StateAlias; value: Scalar | Vector2 | Vector3; multiplier?: number }): void => {
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
