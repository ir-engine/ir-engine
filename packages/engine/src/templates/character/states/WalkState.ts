import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../components/CharacterComponent';
import { setActorAnimation } from "../behaviors/setActorAnimation";
import { setFallingState } from "../behaviors/setFallingState";
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { findVehicle } from '../functions/findVehicle';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Input } from '../../../input/components/Input';
import { isMoving } from '../functions/isMoving';
import { addState } from "../../../state/behaviors/addState";
import { CharacterStateTypes } from '../CharacterStateTypes';
import { DefaultInput } from '../../shared/DefaultInput';

export const WalkState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['canEnterVehicles']: true,
      ['moveSpeed']: 4
    }
  }],
  onEntry: [
    {
      behavior: initializeCharacterState
    },
    {
      behavior: setActorAnimation,
      args: {
        name: 'walking',
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
      behavior: triggerActionIfMovementHasChanged,
      args: {
        action: (entity) => {
          // Default behavior for all states
          findVehicle(entity);
          const input = getComponent(entity, Input);

          if (input.data.has(DefaultInput.BACKWARD)) {
            addState(entity, { state: CharacterStateTypes.WALK_START_BACKWARD });
          } else if (input.data.has(DefaultInput.LEFT)) {
            addState(entity, { state: CharacterStateTypes.WALK_START_LEFT });
          } else if (input.data.has(DefaultInput.RIGHT)) {
            addState(entity, { state: CharacterStateTypes.WALK_START_RIGHT});
          }

          // Check if we stopped moving
          if (!isMoving(entity)) {
            // If we still have some velocity, go to walk end state
            if (getComponent(entity, CharacterComponent).velocity.length() > 0.5)
              return addState(entity, { state: CharacterStateTypes.WALK_END });
            // Otherwise go directly to idle state
            else return addState(entity, { state: CharacterStateTypes.IDLE });
          }
          // Check if we're sprinting
          if (input.data.has(DefaultInput.SPRINT))
            return addState(entity, { state: CharacterStateTypes.SPRINT });
          // Check if we're trying to jump
          if (input.data.has(DefaultInput.JUMP))
            return addState(entity, { state: CharacterStateTypes.JUMP_RUNNING });
        }
      }
    },
    {
      behavior: setFallingState
    }
  ]
};
