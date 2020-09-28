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
import { addState } from '../../../state/behaviors/StateBehaviors';
import { isMoving } from '../functions/isMoving';
import { setIdleState } from '../behaviors/setIdleState';

export const StartWalkBackLeftState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['canEnterVehicles']: true,
      ['rotationSimulator.mass']: 20,
      ['rotationSimulator.damping']: 0.7,
      ['arcadeVelocityTarget']: { x: 0.0, y: 0.0, z: 0.8 },
    }
  }],
  onEntry: [
    {
      behavior: initializeCharacterState
    },
     {
       behavior: setActorAnimation,
       args: {
         name: 'sb_start_back_left',
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
          const input = getComponent(entity, Input)
          // Check if we're trying to jump
          if (input.data.has(DefaultInput.JUMP))
            return addState(entity, { state: CharacterStateTypes.JUMP_RUNNING })
          // Check if we stopped moving
          if (!isMoving(entity)) {
            setIdleState(entity)
          }
          if (input.data.has(DefaultInput.SPRINT))
            return addState(entity, { state: CharacterStateTypes.SPRINT })
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
