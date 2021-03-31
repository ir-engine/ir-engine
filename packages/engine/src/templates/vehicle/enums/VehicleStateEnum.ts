export enum VehicleState {
  onAddedEnding,
  onAddEnding,
  onStartRemove,
  onUpdate
}

type NetworkDriverId = number;
type NetworkCarId = number;
type CurrentFocusedPart = number;

export type VehicleStateUpdateSchema = [VehicleState, NetworkCarId?, CurrentFocusedPart?]