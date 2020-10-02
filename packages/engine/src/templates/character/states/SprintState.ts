import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../components/CharacterComponent';
import { setActorAnimation } from "../behaviors/setActorAnimation";
import { setFallingState } from "../behaviors/setFallingState";
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { setArcadeVelocityTarget } from '../behaviors/setArcadeVelocityTarget';
import { setArcadeVelocityInfluence } from '../behaviors/setArcadeVelocityInfluence';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { findVehicle } from '../functions/findVehicle';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Input } from '../../../input/components/Input';
import { DefaultInput } from '../../shared/DefaultInput';
import { addState } from '../../../state/behaviors/StateBehaviors';
import { CharacterStateTypes } from '../CharacterStateTypes';
import { isMoving } from '../functions/isMoving';
import { setIdleState } from '../behaviors/setIdleState';

export const SprintState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: [{
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
      behavior: initializeCharacterState
    },
    {
      behavior: setActorAnimation,
      args: {
        name: 'run_forward',
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

        if (input.data.has(DefaultInput.SPRINT)) {

          if (input.data.has(DefaultInput.LEFT)) {
            addState(entity, { state: CharacterStateTypes.SPRINT_LEFT })
          } else if (input.data.has(DefaultInput.RIGHT)) {
            addState(entity, { state: CharacterStateTypes.SPRINT_RIGHT })
          } else if (input.data.has(DefaultInput.BACKWARD)) {
            addState(entity, { state: CharacterStateTypes.SPRINT_BACKWARD })
          } else {
            setIdleState(entity)
          }

        } else {

          if (input.data.has(DefaultInput.FORWARD)) {
            addState(entity, { state: CharacterStateTypes.WALK_START_FORWARD})
          } else if (input.data.has(DefaultInput.LEFT)) {
            addState(entity, { state: CharacterStateTypes.WALK_START_LEFT })
          } else if (input.data.has(DefaultInput.RIGHT)) {
            addState(entity, { state: CharacterStateTypes.WALK_START_RIGHT})
          } else if (input.data.has(DefaultInput.BACKWARD)) {
            addState(entity, { state: CharacterStateTypes.WALK_START_BACKWARD })
          }

        }

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
