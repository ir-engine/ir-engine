import { handleVehicleStateChange } from "../vehicle/behaviors/handleVehicleStateChange";

export enum NetworkObjectUpdateType {
  VehicleStateChange,
}

export const NetworkObjectUpdateSchema = {
  [NetworkObjectUpdateType.VehicleStateChange]: [
    {
      behavior: handleVehicleStateChange,
    },
  ],
};