import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../components/CharacterComponent';
import { setActorAnimation } from "../behaviors/setActorAnimation";
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { setFallingState } from "../behaviors/setFallingState";
import { setArcadeVelocityTarget } from '../behaviors/setArcadeVelocityTarget';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { findVehicle } from '../functions/findVehicle';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Input } from '../../../input/components/Input';
import { isMoving } from '../functions/isMoving';
import { addState } from '../../../state/behaviors/StateBehaviors';
import { CharacterStateTypes } from '../CharacterStateTypes';
import { setAppropriateStartWalkState } from '../behaviors/setStartWalkState';
import { Entity } from '../../../ecs/classes/Entity';
import { DefaultInput } from "../../shared/DefaultInput";
import { BinaryValue } from "../../../common/enums/BinaryValue";

// Idle Behavior
export const DrivingIdleState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.damping']: 0.6,
      ['velocitySimulator.mass']: 10
    }
  }],
  onEntry: [
    {
      behavior: setArcadeVelocityTarget,
      args: { x: 0, y: 0, z: 0 }
    },
    {
      behavior: initializeCharacterState
    },
    {
      behavior: setActorAnimation,
      args: {
        name: 'driving',
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
    /*
    {
      behavior: triggerActionIfMovementHasChanged,
      args: {
        action: (entity:Entity): void => {
          // Default behavior for all states
          findVehicle(entity);
          const input = getComponent(entity, Input)

          // Check if we're trying to jump
          if (input.data.has(DefaultInput.JUMP) && input.data.get(DefaultInput.JUMP).value === BinaryValue.ON) {
            return addState(entity, {state: CharacterStateTypes.JUMP_IDLE})
          }

          // If we're not moving, don't worry about the rest of this action
          if (!isMoving(entity)) return

          // If our character is moving or being moved, go to walk state
          if (getComponent(entity, CharacterComponent).velocity.length() > 0.5)
            return addState(entity, { state: CharacterStateTypes.WALK })

          // Otherwise set the appropriate walk state
          setAppropriateStartWalkState(entity);
        }
      }
    },
    {
      behavior: setFallingState
    }
    */
  ]
};
