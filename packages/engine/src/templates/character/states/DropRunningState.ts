import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Input } from '../../../input/components/Input';
import { addState } from "../../../state/behaviors/addState";
import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { DefaultInput } from '../../shared/DefaultInput';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { onAnimationEnded } from '../behaviors/onAnimationEnded';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from '../components/CharacterComponent';
import { findVehicle } from '../functions/findVehicle';

export const DropRunningState: StateSchemaValue = {onEntry: [
    {
      behavior: initializeCharacterState,
      args: {
        name: CharacterStateTypes.DROP_ROLLING,
        transitionDuration: 0.1
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
          // Check if we stopped moving
          if (getComponent(entity, CharacterComponent).localMovementDirection.length() === 0)
            return addState(entity, { state: CharacterStateTypes.IDLE });
          // Check if we're trying to sprint
          if (input.data.has(DefaultInput.SPRINT))
            return addState(entity, { state: CharacterStateTypes.SPRINT });
          // Check if we're trying to jump
          if (input.data.has(DefaultInput.JUMP))
            return addState(entity, { state: CharacterStateTypes.JUMP_RUNNING });
        }
      }
    },
    {
      behavior: onAnimationEnded,
      args: {
        transitionToState: CharacterStateTypes.WALK
      }
    }
  ]
};
