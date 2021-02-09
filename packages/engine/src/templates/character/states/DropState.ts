import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Input } from '../../../input/components/Input';
import { setState } from "../../../state/behaviors/addState";
import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { BaseInput } from '@xr3ngine/engine/src/input/enums/BaseInput';
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
        name: CharacterStateTypes.DROP,
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
            return setState(entity, { state: CharacterStateTypes.DEFAULT });
          // Check if we're trying to sprint
          if (input.data.has(BaseInput.SPRINT))
            return setState(entity, { state: CharacterStateTypes.SPRINT });
          // Check if we're trying to jump
          if (input.data.has(BaseInput.JUMP))
            return setState(entity, { state: CharacterStateTypes.JUMP_RUNNING });
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
