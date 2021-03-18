import { CharacterStateTypes } from './CharacterStateTypes';
import { MovingState } from "./states/MovingState";
import { DrivingState } from './states/DrivingState';

export const CharacterStates = {
  [CharacterStateTypes.DEFAULT]: MovingState,
  [CharacterStateTypes.DRIVING]: DrivingState
};
