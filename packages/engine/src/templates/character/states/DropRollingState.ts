import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { setMovingStateOnAnimationEnd } from '../behaviors/setMovingStateOnAnimationEnd';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { setActorAnimation, setActorAnimationById } from "../behaviors/setActorAnimation";
import { setArcadeVelocityTarget } from '../behaviors/setArcadeVelocityTarget';
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent } from '../components/CharacterComponent';
import { CharacterAnimationsIds } from "../CharacterAnimationsIds";
import { onAnimationEnded } from "../behaviors/onAnimationEnded";

export const DropRollingState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.damping']: 0.6,
      ['velocitySimulator.mass']: 1
    }
  }],
  onEntry: [
      {
        behavior: initializeCharacterState
      },
      {
        behavior: setArcadeVelocityTarget,
        args: { x: 0, y: 0, z: 0.8 }
      },
      {
        behavior: setActorAnimationById,
        args: {
          name: CharacterAnimationsIds.DROP_ROLLING,
          transitionDuration: 0.5
        }
      }
    ],
  onUpdate: [
    { behavior: updateCharacterState,
      args: {
        setCameraRelativeOrientationTarget: true
      }
    },
    {
      behavior: onAnimationEnded,
      args: {
        transitionToState: CharacterStateTypes.IDLE
      }
    },
    // {
    //   behavior: setMovingStateOnAnimationEnd,
    //   args: {
    //     transitionToStateIfMoving: CharacterStateTypes.MOVING,
    //     transitionToStateIfNotMoving: CharacterStateTypes.IDLE
    //   }
    // }
  ]
};
