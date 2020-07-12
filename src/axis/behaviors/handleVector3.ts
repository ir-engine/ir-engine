import { Entity } from "ecsy";
import { Scalar, Vector3, Vector2 } from "../../common/types/NumericalTypes";
import AxisAlias from "../types/AxisAlias";
export function handleVector3(entityIn: Entity, args: { axisType: AxisAlias; dimensions: Scalar | Vector2 | Vector3; multiplier?: number; }): void {
  // get axis component and set local reference
  // axisValue = entityIn
  //   .getComponent(InputAxisHandler3D)
  //   .values.toArray()
  //   .filter((value: AxisValue<Vector2>) => {
  //     value.axis === args.axisType
  //   })[0].value
  // // get state and set with axis
  // vec2.scale(axisValueOut, axisValue, args.multiplier ? args.multiplier : 1)
  // entityIn
  //   .getMutableComponent(State3D)
  //   .values.toArray()
  //   .filter(value => {
  //     value.type === args.dimensions
  //   })[0].value = axisValueOut
}
