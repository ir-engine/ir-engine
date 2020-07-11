import Behavior from "../../common/interfaces/Behavior"
import { Entity } from "ecsy"
import { Scalar, Vector3, Vector2 } from "../../common/types/NumericalTypes"
import Blendspace2D from "../../state/components/Blendspace2D"
import AxisType from "../types/AxisType"
import InputAxisHandler2D from "../components/InputAxisHandler2D"
import AxisValue from "../interfaces/AxisValue"
import { vec2 } from "gl-matrix"
import isScalar from "../../common/utils/isScalar"
// TODO: Replace queue with map so we can read continuous more performantly
// TODO: Type evaluations here are messy, could be cleaner
let axisValue: Vector2
let axisValueOut: Vector2
export const mapAxisToBlendspace: Behavior = (
  entityIn: Entity,
  args: { axisType: AxisType; dimensions: Scalar | Vector2 | Vector3; multiplier?: number }
): void => {
  if (isScalar(args.dimensions)) {
    handleScalar
  } else if ((args.dimensions as Vector2).length == 2) {
    handleVector2(entityIn, args)
  } else if ((args.dimensions as Vector3).length == 3) {
    handleVector3(entityIn, args)
  } else {
    console.error("Could not handle mapping properly")
  }

  return console.log("mapAxisToBlendstate: " + entityIn.id)
}

function handleScalar(entityIn: Entity, args: { axisType: AxisType; dimensions: Scalar | Vector2 | Vector3; multiplier?: number }): void {
  // TODO:
  console.log("Scalars are not handled yet")
}

function handleVector2(entityIn: Entity, args: { axisType: AxisType; dimensions: Scalar | Vector2 | Vector3; multiplier?: number }): void {
  // get axis component and set local reference
  axisValue = entityIn
    .getComponent(InputAxisHandler2D)
    .values.toArray()
    .filter((value: AxisValue<Vector2>) => {
      value.axis === args.axisType
    })[0].value
  // get blendspace and set with axis
  vec2.scale(axisValueOut, axisValue, args.multiplier ? args.multiplier : 1)
  entityIn
    .getMutableComponent(Blendspace2D)
    .values.toArray()
    .filter(value => {
      value.type === args.dimensions
    })[0].value = axisValueOut
}

function handleVector3(entityIn: Entity, args: { axisType: AxisType; dimensions: Scalar | Vector2 | Vector3; multiplier?: number }): void {
  // get axis component and set local reference
  // axisValue = entityIn
  //   .getComponent(InputAxisHandler3D)
  //   .values.toArray()
  //   .filter((value: AxisValue<Vector2>) => {
  //     value.axis === args.axisType
  //   })[0].value
  // // get blendspace and set with axis
  // vec2.scale(axisValueOut, axisValue, args.multiplier ? args.multiplier : 1)
  // entityIn
  //   .getMutableComponent(Blendspace3D)
  //   .values.toArray()
  //   .filter(value => {
  //     value.type === args.dimensions
  //   })[0].value = axisValueOut
}
