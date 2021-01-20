import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent, RUN_SPEED, WALK_SPEED } from '../components/CharacterComponent';
import { setFallingState } from "../behaviors/setFallingState";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { Input } from '../../../input/components/Input';
import { isMovingByInputs } from '../functions/isMovingByInputs';
import { addState } from "../../../state/behaviors/addState";
import { CharacterStateTypes } from '../CharacterStateTypes';
import { DefaultInput } from '../../shared/DefaultInput';
import { Entity } from "../../../ecs/classes/Entity";
import { LifecycleValue } from "../../../common/enums/LifecycleValue";
import { getMovingAnimationsByVelocity } from "../functions/getMovingAnimationsByVelocity";
import { defaultAvatarAnimations } from "../CharacterAvatars";
import { setActorAnimationWeightScale } from "../behaviors/setActorAnimationWeightScale";
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { Vector3 } from "three";
import { getPlayerMovementVelocity } from "../functions/getPlayerMovementVelocity";
import { BinaryValue } from "../../../common/enums/BinaryValue";
import { trySwitchToJump } from "../behaviors/trySwitchToJump";
import { trySwitchToMovingState } from "../behaviors/trySwitchToMovingState";

const localSpaceMovementVelocity = new Vector3();

// TODO: delete?

export const MovingState: StateSchemaValue = {
  group: CharacterStateGroups.MOVEMENT,
  componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['canEnterVehicles']: true,
    }
  }],
  onEntry: [
    {
      behavior: initializeCharacterState
    },
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
          // findVehicle(entity);
          const input = getComponent(entity, Input);
          const actor = getComponent(entity, CharacterComponent);
          const isSprinting = (input.data.get(DefaultInput.SPRINT)?.value) === BinaryValue.ON;
          const neededMovementSpeed = isSprinting? RUN_SPEED : WALK_SPEED;
          if (actor.moveSpeed !== neededMovementSpeed) {
            const writableActor = getMutableComponent(entity, CharacterComponent);
            writableActor.moveSpeed = neededMovementSpeed;
          }

          // Check if we're trying to jump
          if (trySwitchToJump(entity)) {
            return;
          }
        }
      }
    },
    {
      behavior: (entity:Entity): void => {
        // TODO: change it to speed relative to the ground?
        // real speed made by inputs.
        getPlayerMovementVelocity(entity, localSpaceMovementVelocity);
        console.log('update moving', isMovingByInputs(entity), localSpaceMovementVelocity.length().toFixed(5));

        const animations = getMovingAnimationsByVelocity(localSpaceMovementVelocity);
        animations.forEach((value, animationId) => {
          setActorAnimationWeightScale(entity, {
            animationId,
            weight: value.weight,
            scale: value.timeScale
          });
        });
        // TODO: sync run/walk animation pairs? (run_forward with walk_forward, run_left with walk_left)

        // Check if we stopped moving
        if (!isMovingByInputs(entity) && localSpaceMovementVelocity.length() < 0.01) {
          addState(entity, { state: CharacterStateTypes.IDLE });
        }
      }
    },
    {
      behavior: setFallingState
    }
  ]
};
