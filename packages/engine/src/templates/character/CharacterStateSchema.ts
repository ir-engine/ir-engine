import { StateSchema } from '../../state/interfaces/StateSchema';
import { CharacterStates } from './CharacterStates';
import { CharacterStateTypes } from './CharacterStateTypes';

export const CharacterStateSchema: StateSchema = {
  default: CharacterStateTypes.DEFAULT,
  states: CharacterStates
};
