import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { onAnimationEnded } from '../behaviors/onAnimationEnded';
import { setActorAnimationById } from "../behaviors/setActorAnimation";
import { setArcadeVelocityTarget } from '../behaviors/setArcadeVelocityTarget';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent } from '../components/CharacterComponent';
import { findVehicle } from '../functions/findVehicle';
import { trySwitchToJump } from "../behaviors/trySwitchToJump";
import { trySwitchToMovingState } from "../behaviors/trySwitchToMovingState";
import { CharacterAnimationsIds } from "../CharacterAnimationsIds";
import { Entity } from "../../../ecs/classes/Entity";

export const DropIdleState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['velocitySimulator.damping']: 0.5,
      ['velocitySimulator.mass']: 7
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
        behavior: setActorAnimationById,
        args: {
          animationId: CharacterAnimationsIds.DROP,
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
