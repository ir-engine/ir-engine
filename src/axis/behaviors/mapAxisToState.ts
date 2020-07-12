import Behavior from "../../common/interfaces/Behavior";
import { Entity } from "ecsy";
import { Scalar, Vector3, Vector2 } from "../../common/types/NumericalTypes";
import AxisAlias from "../types/AxisAlias";
import isScalar from "../../common/utils/isScalar";
import { handleVector3 } from "./handleVector3";
import { handleVector2 } from "./handleVector2";
import { handleScalar } from "./handleScalar";
// TODO: Replace queue with map so we can read continuous more performantly
// TODO: Type evaluations here are messy, could be cleaner
let axisValue: Vector2;
let axisValueOut: Vector2;
export const mapAxisToState: Behavior = (
  entityIn: Entity,
  args: { axisType: AxisAlias; dimensions: Scalar | Vector2 | Vector3; multiplier?: number; }
): void => {
  if (isScalar(args.dimensions)) {
    handleScalar;
  }
  else if ((args.dimensions as Vector2).length == 2) {
    handleVector2(entityIn, args);
  }
  else if ((args.dimensions as Vector3).length == 3) {
    handleVector3(entityIn, args);
  }
  else {
    console.error("Could not handle mapping properly");
  }

  return console.log("mapAxisToBlendstate: " + entityIn.id);
};
