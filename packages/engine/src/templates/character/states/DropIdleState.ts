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
import { addState } from '../../../state/behaviors/StateBehaviors';
import { Input } from '../../../input/components/Input';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { getLocalMovementDirection } from '../functions/getLocalMovementDirection';
import { setJumpingState } from '../behaviors/setJumpingState';

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
          name: 'idle6',
          transitionDuration: 0.1
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
        const input = getComponent(entity, Input)
        if (input.data.has(DefaultInput.JUMP))
          return addState(entity, { state: CharacterStateTypes.JUMP_IDLE })
        // Check if we're trying to move
        setMovingState(entity, {
          transitionToState: CharacterStateTypes.WALK_START_FORWARD
        });
      }
    }
  },
    { behavior: onAnimationEnded,
      args: {
        transitionToState: CharacterStateTypes.IDLE
      }
  }]
};
