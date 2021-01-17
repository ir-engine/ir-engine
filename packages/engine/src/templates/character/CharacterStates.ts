import { CharacterStateTypes } from './CharacterStateTypes';
import { IdleState } from './states/IdleState';
import { WalkState } from './states/WalkState';
import { DropIdleState } from './states/DropIdleState';
import { DropRollingState } from './states/DropRollingState';
import { DropRunningState } from './states/DropRunningState';
import { FallingState } from './states/FallingState';
import { IdleRotateLeftState } from './states/IdleRotateLeftState';
import { IdleRotateRightState } from './states/IdleRotateRightState';
import { JumpIdleState } from './states/JumpIdleState';
import { JumpRunningState } from './states/JumpRunningState';
import { SprintState } from './states/SprintState';
import { StartSprintLeftState } from './states/StartSprintLeftState';
import { StartSprintRightState } from './states/StartSprintRightState';
import { StartSprintBackwardState } from './states/StartSprintBackwardState';
import { StartWalkForwardState } from './states/StartWalkForwardState';
import { StartWalkLeftState } from './states/StartWalkLeftState';
import { StartWalkRightState } from './states/StartWalkRightState';
import { EndWalkState } from './states/EndWalkState';
import { StartWalkBackwardState } from './states/StartWalkBackwardState';
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
  [CharacterStateTypes.MOVING]: MovingState,
  [CharacterStateTypes.WALK]: WalkState,
  [CharacterStateTypes.IDLE_ROTATE_LEFT]: IdleRotateLeftState,
  [CharacterStateTypes.IDLE_ROTATE_RIGHT]: IdleRotateRightState,
  [CharacterStateTypes.JUMP_IDLE]: JumpIdleState,
  [CharacterStateTypes.JUMP_RUNNING]: JumpRunningState,
  [CharacterStateTypes.SPRINT]: SprintState,
  [CharacterStateTypes.SPRINT_LEFT]: StartSprintLeftState,
  [CharacterStateTypes.SPRINT_RIGHT]: StartSprintRightState,
  [CharacterStateTypes.SPRINT_BACKWARD]: StartSprintBackwardState,
  [CharacterStateTypes.WALK_END]: EndWalkState,
  [CharacterStateTypes.WALK_START_BACKWARD]: StartWalkBackwardState,
  [CharacterStateTypes.WALK_START_FORWARD]: StartWalkForwardState,
  [CharacterStateTypes.WALK_START_LEFT]: StartWalkLeftState,
  [CharacterStateTypes.WALK_START_RIGHT]: StartWalkRightState,
  [CharacterStateTypes.DRIVING_IDLE]: DrivingIdleState,
  [CharacterStateTypes.ENTER_VEHICLE]: EnterVehicleState,
  [CharacterStateTypes.EXIT_VEHICLE]: ExitVehicleState
};
