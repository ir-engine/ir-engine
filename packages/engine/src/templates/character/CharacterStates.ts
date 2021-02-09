import { CharacterStateTypes } from './CharacterStateTypes';
import { MovingState } from "./states/DefaultState";
import { DrivingState } from './states/DrivingState';
import { DropRunningState } from './states/DropState';
import { EnterVehicleState } from './states/EnterVehicleState';
import { ExitVehicleState } from './states/ExitVehicleState';
import { FallingState } from './states/FallingState';
import { SprintState } from './states/SprintState';
import { JumpState } from './states/JumpState';

export const CharacterStates = {
  [CharacterStateTypes.DROP]: DropRunningState,
  [CharacterStateTypes.FALLING]: FallingState,
  [CharacterStateTypes.DEFAULT]: MovingState,
  [CharacterStateTypes.JUMP_RUNNING]: JumpState,
  [CharacterStateTypes.SPRINT]: SprintState,
  [CharacterStateTypes.DRIVING]: DrivingState,
  [CharacterStateTypes.ENTERING_CAR]: EnterVehicleState,
  [CharacterStateTypes.EXITING_CAR]: ExitVehicleState
};
