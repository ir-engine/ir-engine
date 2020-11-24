import { StateSchema } from '../../state/interfaces/StateSchema';
import { CharacterStateTypes } from './CharacterStateTypes';
import { CharacterStateGroups } from './CharacterStateGroups';
import { CharacterStates } from './CharacterStates';

export const CharacterStateSchema: StateSchema = {
  groups: {
    // We explicitly list all states in the group so they can override each other
    [CharacterStateGroups.MOVEMENT]: {
      exclusive: true,
      default: CharacterStateTypes.IDLE,
      states: Object.keys(CharacterStates)
    }
  },
  states: CharacterStates
};
