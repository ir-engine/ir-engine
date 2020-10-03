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
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { findVehicle } from '../functions/findVehicle';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Input } from '../../../input/components/Input';
import { DefaultInput } from '../../shared/DefaultInput';
import { addState } from '../../../state/behaviors/StateBehaviors';
import { isMoving } from '../functions/isMoving';
import { setIdleState } from '../behaviors/setIdleState';

export const StartWalkBackwardState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['canEnterVehicles']: true,
      ['rotationSimulator.mass']: 20,
      ['rotationSimulator.damping']: 0.7,
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
         name: 'walk_backward',
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

          if (input.data.has(DefaultInput.RIGHT)) {
            addState(entity, { state: CharacterStateTypes.WALK_START_RIGHT });
          } else if (input.data.has(DefaultInput.LEFT)) {
            addState(entity, { state: CharacterStateTypes.WALK_START_LEFT });
          } else if (input.data.has(DefaultInput.FORWARD)) {
            addState(entity, { state: CharacterStateTypes.WALK_START_FORWARD});
          }
          // Check if we're trying to jump
          if (input.data.has(DefaultInput.JUMP))
            return addState(entity, { state: CharacterStateTypes.JUMP_RUNNING });
          // Check if we stopped moving
          if (!isMoving(entity)) {
            setIdleState(entity);
          }
          if (input.data.has(DefaultInput.SPRINT))
            return addState(entity, { state: CharacterStateTypes.SPRINT_BACKWARD });

          if (!isMoving(entity)) {
            setIdleState(entity);
          }
        }
      }
    },
    {
      behavior: setFallingState
    },
    // {
    //   behavior: onAnimationEnded,
    //   args: {
    //     transitionToState: CharacterStateTypes.WALK
    //   }
    // },
    /*
    {
      behavior: addState,
      args: {
        state: CharacterStateTypes.WALK
      }
    }
    */
  ]
};
