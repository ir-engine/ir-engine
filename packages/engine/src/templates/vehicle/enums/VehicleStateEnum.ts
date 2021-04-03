export enum VehicleState {
  onAdded,
  onRemoved,
  onAddedEnding,
  onAddEnding,
  onStartRemove,
  onUpdate
}

type NetworkDriverId = number;
type NetworkCarId = number;
type CurrentFocusedPart = number;

export type VehicleStateUpdateSchema = [VehicleState, NetworkCarId?, CurrentFocusedPart?]