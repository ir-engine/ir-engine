import { Entity } from "../../../ecs/classes/Entity";
import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { onAnimationEnded } from '../behaviors/onAnimationEnded';
import { setFallingState } from "../behaviors/setFallingState";
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { trySwitchToJump } from "../behaviors/trySwitchToJump";
import { trySwitchToMovingState } from "../behaviors/trySwitchToMovingState";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from '../components/CharacterComponent';
import { findVehicle } from '../functions/findVehicle';

// Idle Behavior
export const IdleRotateLeftState: StateSchemaValue = {componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.mass']: 10,
      ['velocitySimulator.damping']: 0.6,
      ['rotationSimulator.mass']: 30,
      ['rotationSimulator.damping']: 0.6
    }
  }],
  onEntry:  [
    {
      behavior: initializeCharacterState,
      args: {
        animationId: CharacterStateTypes.IDLE_ROTATE_LEFT,
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
        action: (entity: Entity): void => {
          // Default behavior for all states
          findVehicle(entity);
          // Check if we're trying to jump
          if (trySwitchToJump(entity)) {
            return;
          }

          trySwitchToMovingState(entity);
        }
      }
    },
    {
      behavior: onAnimationEnded,
      args: {
        transitionToState: CharacterStateTypes.IDLE
      }
    },
    {
      behavior: setFallingState
    }
  ]
};


