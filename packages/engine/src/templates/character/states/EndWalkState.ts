import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { setFallingState } from "../behaviors/setFallingState";
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { onAnimationEnded } from '../behaviors/onAnimationEnded';
import { setActorAnimation } from "../behaviors/setActorAnimation";
import { setArcadeVelocityTarget } from '../behaviors/setArcadeVelocityTarget';
import { CharacterStateGroups } from '../CharacterStateGroups';
import { CharacterStateTypes } from '../CharacterStateTypes';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Input } from '../../../input/components/Input';
import { findVehicle } from '../functions/findVehicle';
import { DefaultInput } from '../../shared/DefaultInput';
import { addState } from '../../../state/behaviors/StateBehaviors';
import { isMoving } from '../functions/isMoving';
import { setAppropriateStartWalkState } from '../behaviors/setStartWalkState';
import { CharacterComponent } from '../components/CharacterComponent';
import { updateCharacterState } from "../behaviors/updateCharacterState";

export const EndWalkState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
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
        transitionToState: CharacterStateTypes.IDLE
      }
    },
    {
      behavior: triggerActionIfMovementHasChanged,
      args: {
        action: (entity) => {
          const input = getComponent(entity, Input)
          // Default behavior for all states
          findVehicle(entity);

          // Check if we're trying to jump
          if (input.data.has(DefaultInput.JUMP))
            return addState(entity, { state: CharacterStateTypes.JUMP_IDLE })

          // If we're not moving, don't worry about the rest of this action
          if (!isMoving(entity)) return

          if (input.data.has(DefaultInput.SPRINT))
            return addState(entity, { state: CharacterStateTypes.SPRINT })

          if (getComponent(entity, CharacterComponent).velocity.length() > 0.5)
            return addState(entity, { state: CharacterStateTypes.WALK })

          setAppropriateStartWalkState(entity);

        }
      }
    },
    {
      behavior: setFallingState
    }
  ]
};
