import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { setFallingState } from "../behaviors/setFallingState";
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { onAnimationEnded } from '../behaviors/onAnimationEnded';
import { setActorAnimation } from "../behaviors/setActorAnimation";
import { setArcadeVelocityTarget } from '../behaviors/setArcadeVelocityTarget';
import { CharacterStateGroups } from '../CharacterStateGroups';
import { CharacterStateTypes } from '../CharacterStateTypes';

export const EndWalkState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  onEntry: [
    {
      behavior: setArcadeVelocityTarget,
      args: { x: 0, y: 0, z: 0 }
    },
      {
        behavior: initializeCharacterState
      },
      {
        behavior: setActorAnimation,
        args: {
          name: 'stop',
          transitionDuration: 0.1
        }
      }
    ],
  onUpdate: [
    {
      behavior: onAnimationEnded,
      args: {
        transitionToState: CharacterStateTypes.IDLE
      }
    },
    {
      behavior: setFallingState
    }
  ]
};
