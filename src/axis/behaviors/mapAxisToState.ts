import Behavior from "../../common/interfaces/Behavior"
import { Entity } from "ecsy"
import { Vector2 } from "../../common/types/NumericalTypes"
import AxisAlias from "../types/AxisAlias"
import Axis from "../components/Axis"
import { vec2 } from "gl-matrix"
import State from "../../state/components/State"
import { AxisValue } from "../../interfaces"
import { AxisType } from "../enums/AxisType"

// TODO: Replace queue with map so we can read continuous more performantly
// TODO: Type evaluations here are messy, could be cleaner
let axisValue: Vector2
let axisValueOut: Vector2
export const mapAxisToState: Behavior = (entityIn: Entity, args: { axis: AxisAlias; axisType: AxisType; multiplier?: number }): void => {
  if (args.axisType === AxisType.TWOD) {
    axisValue = entityIn
      .getComponent(Axis)
      .values.toArray()
      .filter((value: AxisValue<Vector2>) => {
        value.type === args.axis
      })[0].value

    // get state and set with axis
    vec2.scale(axisValueOut, axisValue, args.multiplier ? args.multiplier : 1)
    entityIn
      .getMutableComponent(State)
      .values.toArray()
      .filter(value => {
        value.type === args.axisType
      })[0].value = axisValueOut
  }

  return console.log("mapAxisToBlendstate: " + entityIn.id)
}
