import { AxisType } from "../enums/AxisType"

// TODO: Replace queue with map so we can read continuous more performantly
// TODO: Type evaluations here are messy, could be cleaner
let axisValue: AxisValue<any>
let axisValueOut: Vector2
let axis: Axis
let state: State
export const mapAxisToState: Behavior = (entityIn: Entity, args: { axis: AxisAlias; axisType: AxisType; multiplier?: number }): void => {
  state = entityIn.getComponent(State)
  axis = entityIn.getComponent(Axis)
  if (args.axisType === AxisType.TWOD) {
    axisValue = axis.data.get(args.axis).value

    // get state and set with axis
    vec2.scale(axisValueOut, axisValue, args.multiplier ? args.multiplier : 1)
    state = entityIn.getMutableComponent(State)
    state.data.get(state.behaviorMap.states[])...1
  // TODO: Fix states this fix this!

      .values.toArray()
      .filter(value => {
        value.type === args.axisType
      })[0].value = axisValueOut
  }

  return console.log("mapAxisToBlendstate: " + entityIn.id)
}





import { Entity } from "ecsy"
import { Scalar, Vector3, Vector2 } from "../../common/types/NumericalTypes"
import State from "../../state/components/State"
import AxisAlias from "../types/AxisAlias"
import Axis from "../components/Axis"
import { vec2 } from "gl-matrix"
import Behavior from "../../common/interfaces/Behavior"

let stateValueOut: any

// TODO: Fix (but after changing map over)
export const handleAxis: Behavior = (
  entityIn: Entity,
  args: { axis: AxisAlias; dimensions: Scalar | Vector2 | Vector3; multiplier?: number }
): void => {
  // get axis component and set local reference
  axisValue = entityIn.getComponent(Axis).data.get(args.axis).value

  // get state and set with axis
  vec2.scale(stateValueOut, axisValue, args.multiplier ? args.multiplier : 1)
  entityIn
    .getMutableComponent(State)
    .values.toArray()
    .filter(value => {
      value.type === args.dimensions
    })[0].value = stateValueOut
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
