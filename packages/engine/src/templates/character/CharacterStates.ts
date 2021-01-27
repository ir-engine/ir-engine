import { CharacterStateTypes } from './CharacterStateTypes';
import { IdleState } from './states/IdleState';
import { DropIdleState } from './states/DropIdleState';
import { DropRollingState } from './states/DropRollingState';
import { DropRunningState } from './states/DropRunningState';
import { FallingState } from './states/FallingState';
import { IdleRotateLeftState } from './states/IdleRotateLeftState';
import { IdleRotateRightState } from './states/IdleRotateRightState';
import { JumpIdleState } from './states/JumpIdleState';
import { JumpRunningState } from './states/JumpRunningState';
import { SprintState } from './states/SprintState';
import { DrivingIdleState } from './states/DrivingIdleState';
import { EnterVehicleState } from './states/EnterVehicleState';
import { ExitVehicleState } from './states/ExitVehicleState';
import { MovingState } from "./states/MovingState";

export const CharacterStates = {
  [CharacterStateTypes.DROP_IDLE]: DropIdleState,
  [CharacterStateTypes.DROP_ROLLING]: DropRollingState,
  [CharacterStateTypes.DROP_RUNNING]: DropRunningState,
  [CharacterStateTypes.FALLING]: FallingState,
  [CharacterStateTypes.IDLE]: IdleState,
  [CharacterStateTypes.IDLE_ROTATE_LEFT]: IdleRotateLeftState,
  [CharacterStateTypes.IDLE_ROTATE_RIGHT]: IdleRotateRightState,
  [CharacterStateTypes.MOVING]: MovingState,
  [CharacterStateTypes.JUMP_IDLE]: JumpIdleState,
  [CharacterStateTypes.JUMP_RUNNING]: JumpRunningState,
  [CharacterStateTypes.SPRINT]: SprintState,
  [CharacterStateTypes.DRIVING_IDLE]: DrivingIdleState,
  [CharacterStateTypes.ENTER_VEHICLE]: EnterVehicleState,
  [CharacterStateTypes.EXIT_VEHICLE]: ExitVehicleState
};
