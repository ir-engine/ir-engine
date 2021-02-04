import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../components/CharacterComponent';
import { setActorAnimationById } from "../behaviors/setActorAnimation";
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { setTargetVelocityIfMoving } from '../behaviors/setTargetVelocityIfMoving';
import { setDropState } from '../behaviors/setDropState';
import { setArcadeVelocityTarget } from '../behaviors/setArcadeVelocityTarget';
import { CharacterAnimationsIds } from "../CharacterAnimationsIds";

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
      behavior: initializeCharacterState
    },
    {
      behavior: setArcadeVelocityTarget,
      args: { x: 0, y: 0, z: 0.05 }
    },
      {
        behavior: setActorAnimationById,
        args: {
          animationId: CharacterAnimationsIds.FALLING,
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
