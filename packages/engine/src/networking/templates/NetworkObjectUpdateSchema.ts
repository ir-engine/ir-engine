import { handleObjectEquipped } from "../../interaction/functions/handleObjectEquipped";
import { handleVehicleStateChange } from "../../vehicle/behaviors/handleVehicleStateChange";

export enum NetworkObjectUpdateType {
  VehicleStateChange,
  ObjectEquipped
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
};
