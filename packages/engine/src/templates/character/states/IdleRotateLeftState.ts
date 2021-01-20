import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { setFallingState } from "../behaviors/setFallingState";
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { onAnimationEnded } from '../behaviors/onAnimationEnded';
import { setActorAnimationById } from "../behaviors/setActorAnimation";
import { setArcadeVelocityTarget } from '../behaviors/setArcadeVelocityTarget';
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent } from '../components/CharacterComponent';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { findVehicle } from '../functions/findVehicle';
import { trySwitchToJump } from "../behaviors/trySwitchToJump";
import { trySwitchToMovingState } from "../behaviors/trySwitchToMovingState";
import { CharacterAnimationsIds } from "../CharacterAnimationsIds";
import { Entity } from "../../../ecs/classes/Entity";

// Idle Behavior
export const IdleRotateLeftState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: [{
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
      behavior: initializeCharacterState
    },
    {
      behavior: setArcadeVelocityTarget,
      args: { x: 0, y: 0, z: 0 }
    },
      {
        behavior: setActorAnimationById,
        args: {
          animationId: CharacterAnimationsIds.IDLE_ROTATE_LEFT,
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


