import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { onAnimationEnded } from "../behaviors/onAnimationEnded";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from '../components/CharacterComponent';

export const DropRollingState: StateSchemaValue = {componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.damping']: 0.6,
      ['velocitySimulator.mass']: 1
    }
  }],
  onEntry: [
    {
      behavior: initializeCharacterState,
      args: {
        animationId: CharacterStateTypes.DROP_ROLLING,
        transitionDuration: 0.5
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
    {
      behavior: onAnimationEnded,
      args: {
        transitionToState: CharacterStateTypes.IDLE
      }
    }
  ]
};
