import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from '../components/CharacterComponent';

// Idle Behavior
export const DrivingState: StateSchemaValue = {componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.damping']: 0.6,
      ['velocitySimulator.mass']: 10
    }
  }],
  onEntry: [
    {
      behavior: initializeCharacterState,
      args: {
        animationId: CharacterStateTypes.DRIVING,
        transitionDuration: 0.1
      }
    },
  ],
  onUpdate: [
    {
      behavior: updateCharacterState,
      args: {
        setCameraRelativeOrientationTarget: true
      }
    }
  ]
};
