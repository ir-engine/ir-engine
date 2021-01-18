import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent } from '../components/CharacterComponent';
import { setActorAnimation, setActorAnimationById } from "../behaviors/setActorAnimation";
import { setFallingState } from "../behaviors/setFallingState";
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { onAnimationEnded } from '../behaviors/onAnimationEnded';
import { IdleState } from './IdleState';
import { CharacterStateTypes } from '../CharacterStateTypes';
import { setArcadeVelocityTarget } from '../behaviors/setArcadeVelocityTarget';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { findVehicle } from '../functions/findVehicle';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Input } from '../../../input/components/Input';
import { DefaultInput } from '../../shared/DefaultInput';
import { addState } from "../../../state/behaviors/addState";
import { isMovingByInputs } from '../functions/isMovingByInputs';
import { trySwitchToJump } from "../behaviors/trySwitchToJump";
import { trySwitchToMovingState } from "../behaviors/trySwitchToMovingState";
import { CharacterAnimationsIds } from "../CharacterAnimationsIds";

export const IdleRotateRightState: StateSchemaValue = {
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
      behavior: setArcadeVelocityTarget,
      args: { x: 0, y: 0, z: 0 }
    },
      {
        behavior: initializeCharacterState
      },
      {
        behavior: setActorAnimationById,
        args: {
          animationId: CharacterAnimationsIds.IDLE_ROTATE_RIGHT,
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


