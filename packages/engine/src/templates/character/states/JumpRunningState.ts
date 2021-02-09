import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { jumpRunning } from "../behaviors/jumpRunning";
import { onAnimationEnded } from "../behaviors/onAnimationEnded";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from '../components/CharacterComponent';

export const JumpRunningState: StateSchemaValue = {componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.mass']: 100,
      ['alreadyJumped']: false
    }
  }],
  onEntry:  [
      {
        behavior: initializeCharacterState,
        args: {
          animationId: CharacterStateTypes.JUMP_RUNNING,
          transitionDuration: 0.3
        }
      }
  ],
  onUpdate: [
    {
      behavior: updateCharacterState,
      args: {
        setCameraRelativeOrientationTarget: true
      }
    },
    { behavior: jumpRunning },
    {
      behavior: onAnimationEnded,
      args: { transitionToState: CharacterStateTypes.FALLING }
    }
  ]
};
