import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { setMovingStateOnAnimationEnd } from '../behaviors/setMovingStateOnAnimationEnd';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { setActorAnimation } from "../behaviors/setActorAnimation";
import { setArcadeVelocityTarget } from '../behaviors/setArcadeVelocityTarget';
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent } from '../components/CharacterComponent';

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
        behavior: setActorAnimation,
        args: {
          name: 'sb_drop_running_roll',
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
    { behavior: setMovingStateOnAnimationEnd,
      args: {
        transitionToStateIfMoving: CharacterStateTypes.WALK,
        transitionToStateIfNotMoving: CharacterStateTypes.WALK_END
      }
  }]
};
