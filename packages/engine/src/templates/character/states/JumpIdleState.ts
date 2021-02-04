import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../components/CharacterComponent';
import { setActorAnimationById } from "../behaviors/setActorAnimation";
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { jumpIdle } from "../behaviors/jumpIdle";
import { setArcadeVelocityTarget } from '../behaviors/setArcadeVelocityTarget';
import { CharacterAnimationsIds } from "../CharacterAnimationsIds";
import { onAnimationEnded } from "../behaviors/onAnimationEnded";
import { CharacterStateTypes } from "../CharacterStateTypes";

export const JumpIdleState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.mass']: 50,
      ['alreadyJumped']: false
    }
  }],
  onEntry: [
    {
      behavior: setArcadeVelocityTarget,
      args: { x: 0, y: 0, z: 0 }
    },
    {
      behavior: initializeCharacterState
    },
    {
      behavior: setActorAnimationById,
      args: {
        animationId: CharacterAnimationsIds.JUMP,
        transitionDuration: 1
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
        transitionToState: CharacterStateTypes.FALLING
      }
    },
    {
      behavior: jumpIdle,
    }
  ]
};
