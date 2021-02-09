import { Entity } from "../../../ecs/classes/Entity";
import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { onAnimationEnded } from '../behaviors/onAnimationEnded';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { trySwitchToJump } from "../behaviors/trySwitchToJump";
import { trySwitchToMovingState } from "../behaviors/trySwitchToMovingState";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateTypes } from "../CharacterStateTypes";
import { CharacterComponent } from '../components/CharacterComponent';
import { findVehicle } from '../functions/findVehicle';

export const DropIdleState: StateSchemaValue = {componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.damping']: 0.5,
      ['velocitySimulator.mass']: 7
    }
  }],
  onEntry: [
      {
        behavior: initializeCharacterState,
        args: {
          animationId: CharacterStateTypes.DROP,
          transitionDuration: 0.5
        }
      }
  ],
  onUpdate: [
    { behavior: updateCharacterState,
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
        // Check if we're trying to jump now
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
  }]
};
