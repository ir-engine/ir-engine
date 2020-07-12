import { Entity } from "ecsy";
import { Scalar, Vector3, Vector2 } from "../../common/types/NumericalTypes";
import AxisAlias from "../types/AxisAlias";
export function handleScalar(entityIn: Entity, args: { axisType: AxisAlias; dimensions: Scalar | Vector2 | Vector3; multiplier?: number; }): void {
  // TODO:
  console.log("Scalars are not handled yet");
}
