import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../components/CharacterComponent';
import { setActorAnimation } from "../behaviors/setActorAnimation";
import { setFallingState } from "../behaviors/setFallingState";
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { setArcadeVelocityTarget } from '../behaviors/setArcadeVelocityTarget';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { findVehicle } from '../functions/findVehicle';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Input } from '../../../input/components/Input';
import { DefaultInput } from '../../shared/DefaultInput';
import { addState } from '../../../state/behaviors/StateBehaviors';
import { CharacterStateTypes } from '../CharacterStateTypes';
import { isMoving } from '../functions/isMoving';

export const SprintState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.mass']: 10,
      ['rotationSimulator.damping']: 0.8,
      ['rotationSimulator.mass']: 50
    }
  }],
  onEntry:  [
    {
      behavior: setArcadeVelocityTarget,
      args: { x: 0, y: 0, z: 1.4 }
    },
      {
        behavior: initializeCharacterState
      },
      {
        behavior: setActorAnimation,
        args: {
          name: 'sb_sprint',
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
        const input = getComponent(entity, Input)

        // Check if we're trying to sprint
        if (input.data.has(DefaultInput.SPRINT))
          return addState(entity, { state: CharacterStateTypes.SPRINT })

        // Check if we're trying to jump
        if (input.data.has(DefaultInput.JUMP))
          return addState(entity, { state: CharacterStateTypes.JUMP_RUNNING })
          
        // If we're not moving, don't worry about the rest of this action
        if (!isMoving(entity))
          return addState(entity, { state: CharacterStateTypes.WALK_END })
      }
    }
  },
    { behavior: setFallingState }
  ]
};
