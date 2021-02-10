import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Input } from '../../../input/components/Input';
import { setState } from "../../../state/behaviors/setState";
import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { BaseInput } from '@xr3ngine/engine/src/input/enums/BaseInput';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { setFallingState } from "../behaviors/setFallingState";
import { setIdleState } from '../behaviors/setIdleState';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from '../components/CharacterComponent';
import { findVehicle } from '../functions/findVehicle';

/** @deprecated */

export const SprintState: StateSchemaValue = {componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.mass']: 10,
      ['rotationSimulator.damping']: 0.8,
      ['rotationSimulator.mass']: 50,
      ['moveSpeed']: 6,
    }
  }],
  onEntry:  [
    {
      behavior: initializeCharacterState,
      args: {
        name: CharacterStateTypes.RUN_FORWARD,
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

        if (input.data.has(BaseInput.SPRINT)) {

          if (input.data.has(BaseInput.FORWARD)) {
            setState(entity, { state: CharacterStateTypes.DEFAULT });
          } else if (input.data.has(BaseInput.LEFT)) {
            setState(entity, { state: CharacterStateTypes.RUN_STRAFE_LEFT });
          } else if (input.data.has(BaseInput.RIGHT)) {
            setState(entity, { state: CharacterStateTypes.RUN_STRAFE_RIGHT });
          } else if (input.data.has(BaseInput.BACKWARD)) {
            setState(entity, { state: CharacterStateTypes.RUN_BACKWARD });
          } else {
            setIdleState(entity);
          }

        } else {

          if (input.data.has(BaseInput.FORWARD)) {
            setState(entity, { state: CharacterStateTypes.WALK_FORWARD});
          } else if (input.data.has(BaseInput.LEFT)) {
            setState(entity, { state: CharacterStateTypes.WALK_STRAFE_LEFT });
          } else if (input.data.has(BaseInput.RIGHT)) {
            setState(entity, { state: CharacterStateTypes.WALK_STRAFE_RIGHT});
          } else if (input.data.has(BaseInput.BACKWARD)) {
            setState(entity, { state: CharacterStateTypes.WALK_BACKWARD });
          }

        }

        // Check if we're trying to jump
        if (input.data.has(BaseInput.JUMP))
          return setState(entity, { state: CharacterStateTypes.JUMP_RUNNING });

        // If we're not moving, don't worry about the rest of this action
        if (getComponent(entity, CharacterComponent).localMovementDirection.length() === 0)
          return setState(entity, { state: CharacterStateTypes.DEFAULT });
      }
    }
  },
    { behavior: setFallingState }
  ]
};
