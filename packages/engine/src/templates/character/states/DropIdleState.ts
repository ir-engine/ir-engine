import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { setMovingState } from '../behaviors/setMovingState';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { onAnimationEnded } from '../behaviors/onAnimationEnded';
import { setActorAnimation } from "../behaviors/setActorAnimation";
import { setArcadeVelocityTarget } from '../behaviors/setArcadeVelocityTarget';
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent } from '../components/CharacterComponent';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { findVehicle } from '../functions/findVehicle';
import { jumpIdle } from '../behaviors/jumpIdle';
import { DefaultInput } from '../../shared/DefaultInput';
import { addState } from "../../../state/behaviors/addState";
import { Input } from '../../../input/components/Input';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { getLocalMovementDirection } from '../functions/getLocalMovementDirection';
import { setJumpingState } from '../behaviors/setJumpingState';
import { setAppropriateStartWalkState } from '../behaviors/setStartWalkState';

export const DropIdleState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.damping']: 0.5,
      ['velocitySimulator.mass']: 7
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
        behavior: setActorAnimation,
        args: {
          name: 'idle',
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
    behavior: triggerActionIfMovementHasChanged,
    args: {
      action: (entity) => {
        // Default behavior for all states
        findVehicle(entity);
        // Check if we're trying to jump now
        const input = getComponent(entity, Input);
        if (input.data.has(DefaultInput.JUMP))
          return addState(entity, { state: CharacterStateTypes.JUMP_IDLE });
        // Check if we're trying to move
        if (input.data.has(DefaultInput.SPRINT)) {

          if (input.data.has(DefaultInput.FORWARD)) {
            return addState(entity, { state: CharacterStateTypes.SPRINT })
          } else if (input.data.has(DefaultInput.LEFT)) {
            return addState(entity, { state: CharacterStateTypes.SPRINT_LEFT })
          } else if (input.data.has(DefaultInput.RIGHT)) {
            return addState(entity, { state: CharacterStateTypes.SPRINT_RIGHT })
          } else if (input.data.has(DefaultInput.BACKWARD)) {
            return addState(entity, { state: CharacterStateTypes.SPRINT_BACKWARD })
          }
        }

        setAppropriateStartWalkState(entity);
      }
    }
  },
    { behavior: onAnimationEnded,
      args: {
        transitionToState: CharacterStateTypes.IDLE
      }
  }]
};
