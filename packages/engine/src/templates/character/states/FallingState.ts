import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../../../character/components/CharacterComponent';
import { setCharacterAnimation, checkFalling } from '../CharacterStateSchema';
import { initializeCharacterState, updateCharacterState } from '../behaviors/CharacterBaseBehaviors';
import { CharacterStateGroups } from '../CharacterStateGroups';
import { onAnimationEnded } from '../behaviors/onAnimationEnded';
import { IdleState } from './IdleState';
import { setTargetVelocityIfMoving } from '../behaviors/setTargetVelocityIfMoving';
import { checkIfDropped } from '../behaviors/checkIfDropped';

export const FallingState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: {
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.mass']: 100,
      ['rotationSimulator.damping']: 0.3,
      ['velocityTarget']: { x: 0, y: 0, z: 0.05 },
    }
  },
  onEntry: [
      {
        behavior: initializeCharacterState
      },
      {
        behavior: setCharacterAnimation,
        args: {
          name: 'falling',
          transitionDuration: 0.3
        }
      }
    ],
  onUpdate: [
    {
      behavior: updateCharacterState,
      args:
      {
        setCameraRelativeOrientationTarget: true
      }
    },
    {
      behavior: onAnimationEnded,
      args: {
        transitionToState: IdleState
      }
    },
    {
      behavior: checkFalling
    },
    // Set Velocity Target If Moving
    {
      behavior: setTargetVelocityIfMoving,
      args: {
        ifTrue: { x: 0.8, y: 0.8, z: 0.8},
        ifFalse: { x: 0, y: 0, z: 0 }
      }
    },
    // Set drop state
    {
      behavior: checkIfDropped
    }
  ]
};
