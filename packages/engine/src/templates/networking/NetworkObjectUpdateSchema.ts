import { handleVehicleStateChange } from "../vehicle/behaviors/handleVehicleStateChange";
import { handleObjectEquipped } from "../../interaction/functions/handleObjectEquipped";
import { handleInteractWithGameObject } from "../../interaction/functions/handleInteractWithGameObject";

export enum NetworkObjectUpdateType {
  VehicleStateChange,
  ObjectEquipped,
  InteractWithGameObject
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
  [NetworkObjectUpdateType.InteractWithGameObject]: [
    {
      behavior: handleInteractWithGameObject,
    },
  ],
};
