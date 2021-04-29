import { handleVehicleStateChange } from "../vehicle/behaviors/handleVehicleStateChange";
import { handleObjectEquipped } from "../../interaction/functions/handleObjectEquipped";

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
