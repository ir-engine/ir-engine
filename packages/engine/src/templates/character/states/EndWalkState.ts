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
import { addState } from "../../../state/behaviors/addState";
import { isMoving } from '../functions/isMoving';
import { setAppropriateStartWalkState } from '../behaviors/setStartWalkState';
import { CharacterComponent } from '../components/CharacterComponent';
import { updateCharacterState } from "../behaviors/updateCharacterState";

export const EndWalkState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  onEntry: [
    {
      behavior: initializeCharacterState
    },
    {
      behavior: setArcadeVelocityTarget,
      args: { x: 0, y: 0, z: 0 }
    },
    {
      behavior: setActorAnimation,
      args: {
        name: 'idle',
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
          const input = getComponent(entity, Input);
          // Default behavior for all states
          findVehicle(entity);

          // Check if we're trying to jump
          if (input.data.has(DefaultInput.JUMP))
            return addState(entity, { state: CharacterStateTypes.JUMP_IDLE });


          if (input.data.has(DefaultInput.SPRINT)) {

            if (input.data.has(DefaultInput.FORWARD)) {
              return addState(entity, { state: CharacterStateTypes.SPRINT });
            } else if (input.data.has(DefaultInput.LEFT)) {
              return addState(entity, { state: CharacterStateTypes.SPRINT_LEFT });
            } else if (input.data.has(DefaultInput.RIGHT)) {
              return addState(entity, { state: CharacterStateTypes.SPRINT_RIGHT });
            } else if (input.data.has(DefaultInput.BACKWARD)) {
              return addState(entity, { state: CharacterStateTypes.SPRINT_BACKWARD });
            }
          }

          // If we're not moving, don't worry about the rest of this action
          //  if (!isMoving(entity)) return;

          setAppropriateStartWalkState(entity);

        }
      }
    },
    {
      behavior: setFallingState
    }
  ]
};
