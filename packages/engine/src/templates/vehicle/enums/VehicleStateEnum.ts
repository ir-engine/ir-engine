export enum VehicleState {
  onAddedEnding,
  onAddEnding,
  onStartRemove,
  onUpdate
}


type NetworkCarId = number;
type CurrentFocusedPart = number;

export type VehicleStateUpdateSchema = [VehicleState, NetworkCarId?, CurrentFocusedPart?]