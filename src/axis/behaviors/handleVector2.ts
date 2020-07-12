import { Entity } from "ecsy"
import { Scalar, Vector3, Vector2 } from "../../common/types/NumericalTypes"
import State2D from "../../state/components/State2D"
import AxisAlias from "../types/AxisAlias"
import Axis from "../components/Axis"
import AxisValue from "../interfaces/AxisValue"
import { vec2 } from "gl-matrix"
import { axisValue, axisValueOut } from "./AxisBehaviors"
export function handleVector2(entityIn: Entity, args: { axisType: AxisAlias; dimensions: Scalar | Vector2 | Vector3; multiplier?: number }): void {
  // get axis component and set local reference
  axisValue = entityIn
    .getComponent(Axis)
    .values.toArray()
    .filter((value: AxisValue<Vector2>) => {
      value.axis === args.axisType
    })[0].value
  // get state and set with axis
  vec2.scale(axisValueOut, axisValue, args.multiplier ? args.multiplier : 1)
  entityIn
    .getMutableComponent(State2D)
    .values.toArray()
    .filter(value => {
      value.type === args.dimensions
    })[0].value = axisValueOut
}
