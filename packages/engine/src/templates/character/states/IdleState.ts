import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent, RUN_SPEED, WALK_SPEED } from '../components/CharacterComponent';
import { setActorAnimationById } from "../behaviors/setActorAnimation";
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { setFallingState } from "../behaviors/setFallingState";
import { setArcadeVelocityTarget } from '../behaviors/setArcadeVelocityTarget';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { findVehicle } from '../functions/findVehicle';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { Input } from '../../../input/components/Input';
import { trySwitchToMovingState } from '../behaviors/trySwitchToMovingState';
import { Entity } from '../../../ecs/classes/Entity';
import { DefaultInput } from "../../shared/DefaultInput";
import { BinaryValue } from "../../../common/enums/BinaryValue";
import { getPlayerMovementVelocity } from "../functions/getPlayerMovementVelocity";
import { getMovingAnimationsByVelocity } from "../functions/getMovingAnimationsByVelocity";
import { setActorAnimationWeightScale } from "../behaviors/setActorAnimationWeightScale";
import { Vector3 } from "three";
import { trySwitchToJump } from "../behaviors/trySwitchToJump";
import { CharacterAnimationsIds } from "../CharacterAnimationsIds";

const localSpaceMovementVelocity = new Vector3();

// Idle Behavior
export const IdleState: StateSchemaValue = {
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
      behavior: setActorAnimationById,
      args: {
        animationId: CharacterAnimationsIds.IDLE,
        transitionDuration: 0.2
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

          const input = getComponent(entity, Input);
          const actor = getComponent(entity, CharacterComponent);
          const isSprinting = (input.data.get(DefaultInput.SPRINT)?.value) === BinaryValue.ON;
          const neededMovementSpeed = isSprinting ? RUN_SPEED : WALK_SPEED;
          if (actor.moveSpeed !== neededMovementSpeed) {
            const writableActor = getMutableComponent(entity, CharacterComponent);
            writableActor.moveSpeed = neededMovementSpeed;
          }

          // Check if we're trying to jump
          if (trySwitchToJump(entity)) {
            return;
          }

          trySwitchToMovingState(entity);
        }
      }
    },
    {
      behavior: (entity: Entity): void => {
        getPlayerMovementVelocity(entity, localSpaceMovementVelocity);

        const animations = getMovingAnimationsByVelocity(localSpaceMovementVelocity);
        animations.forEach((value, animationId) => {
          setActorAnimationWeightScale(entity, {
            animationId,
            weight: value.weight,
            scale: value.timeScale,
          });
        });
      }
    },
    {
      behavior: setFallingState
    }
  ]
};
