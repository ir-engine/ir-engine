import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../components/CharacterComponent';
import { setActorAnimation } from "../behaviors/setActorAnimation";
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { onAnimationEnded } from '../behaviors/onAnimationEnded';
import { setTargetVelocityIfMoving } from '../behaviors/setTargetVelocityIfMoving';
import { setDropState } from '../behaviors/setDropState';
import { IdleState } from './IdleState';
import { CharacterStateTypes } from '../CharacterStateTypes';
import { setArcadeVelocityTarget } from '../behaviors/setArcadeVelocityTarget';

export const FallingState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.mass']: 100,
      ['rotationSimulator.damping']: 0.3
    }
  }],
  onEntry: [
    {
      behavior: setArcadeVelocityTarget,
      args: { x: 0, y: 0, z: 0.05 }
    },
      {
        behavior: initializeCharacterState
      },
      {
        behavior: setActorAnimation,
        args: {
          name: 'falling', //falling_idle
          transitionDuration: 0.5
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
      behavior: setDropState
    }
  ]
};
