import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../components/CharacterComponent';
import { setActorAnimation } from "../behaviors/setActorAnimation";
import { setFallingState } from "../behaviors/setFallingState";
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { onAnimationEnded } from '../behaviors/onAnimationEnded';
import { WalkState } from './WalkState';
import { CharacterStateTypes } from '../CharacterStateTypes';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { findVehicle } from '../functions/findVehicle';
import { Input } from '../../../input/components/Input';
import { DefaultInput } from '../../shared/DefaultInput';
import { addState } from "../../../state/behaviors/addState";
import { isMoving } from '../functions/isMoving';
import { setIdleState } from '../behaviors/setIdleState';

export const StartSprintLeftState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['canEnterVehicles']: true,
      ['rotationSimulator.mass']: 20,
      ['rotationSimulator.damping']: 0.7,
      ['moveSpeed']: 6
    }
  }],
  onEntry: [
    {
      behavior: initializeCharacterState
    },
     {
       behavior: setActorAnimation,
       args: {
         name: 'run_left',
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

          // Check if we're trying to jump
          if (input.data.has(DefaultInput.JUMP))
            return addState(entity, { state: CharacterStateTypes.JUMP_RUNNING });

          if (input.data.has(DefaultInput.SPRINT)) {

            if (input.data.has(DefaultInput.FORWARD)) {
              return addState(entity, { state: CharacterStateTypes.SPRINT });
            } else if (input.data.has(DefaultInput.RIGHT)) {
              return addState(entity, { state: CharacterStateTypes.SPRINT_RIGHT });
            } else if (input.data.has(DefaultInput.BACKWARD)) {
              return addState(entity, { state: CharacterStateTypes.SPRINT_BACKWARD });
            }

          } else {

            if (input.data.has(DefaultInput.FORWARD)) {
              return addState(entity, { state: CharacterStateTypes.WALK_START_FORWARD});
            } else if (input.data.has(DefaultInput.LEFT)) {
              return addState(entity, { state: CharacterStateTypes.WALK_START_LEFT });
            } else if (input.data.has(DefaultInput.RIGHT)) {
              return addState(entity, { state: CharacterStateTypes.WALK_START_RIGHT});
            } else if (input.data.has(DefaultInput.BACKWARD)) {
              return addState(entity, { state: CharacterStateTypes.WALK_START_BACKWARD });
            }

          }



          // If we're not moving, don't worry about the rest of this action
          if (!isMoving(entity))
            return addState(entity, { state: CharacterStateTypes.WALK_END });
        }
      }
    },
    {
      behavior: setFallingState
    }
    /*
    ,{
      behavior: addState,
      args: {
        state: CharacterStateTypes.WALK_START_BACK_LEFT
      }
    }
    */
    // {
    //   behavior: onAnimationEnded,
    //   args: {
    //     transitionToState: CharacterStateTypes.WALK
    //   }
    // }
  ]
};
