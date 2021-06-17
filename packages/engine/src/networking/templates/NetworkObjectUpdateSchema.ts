import { handleObjectEquipped } from "../../interaction/functions/handleObjectEquipped";
import { handleForceTransform } from "../../physics/behaviors/handleForceTransform";
import { handleVehicleStateChange } from "../../vehicle/behaviors/handleVehicleStateChange";

export enum NetworkObjectUpdateType {
  VehicleStateChange,
  ObjectEquipped,
  ForceTransformUpdate // used for if the player is stuck, falling through the world or NaN'd
}

export const NetworkObjectUpdateSchema = {
  [NetworkObjectUpdateType.VehicleStateChange]: [
    {
      behavior: handleVehicleStateChange,
    },
  ],
  [NetworkObjectUpdateType.ObjectEquipped]: [
    {
      behavior: handleObjectEquipped,
    },
  ],
  [NetworkObjectUpdateType.ForceTransformUpdate]: [
    {
      behavior: handleForceTransform,
    },
  ],
};
