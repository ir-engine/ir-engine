import { BinaryValue } from "@xr3ngine/engine/src/common/enums/BinaryValue";
import { Vector3 } from "three";
import { Entity } from "../../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { Input } from '../../../input/components/Input';
import { addState } from "../../../state/behaviors/addState";
import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { DefaultInput } from '../../shared/DefaultInput';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { setActorAnimationWeightScale } from "../behaviors/setActorAnimationWeightScale";
import { setFallingState } from "../behaviors/setFallingState";
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { trySwitchToJump } from "../behaviors/trySwitchToJump";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent, RUN_SPEED, WALK_SPEED } from '../components/CharacterComponent';
import { getMovingAnimationsByVelocity } from "../functions/getMovingAnimationsByVelocity";

const localSpaceMovementVelocity = new Vector3();

// TODO: delete?

export const MovingState: StateSchemaValue = {componentProperties: [{
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
        console.log('update moving', getComponent(entity, CharacterComponent).localMovementDirection.length() > 0, localSpaceMovementVelocity.length().toFixed(5));

        const animations = getMovingAnimationsByVelocity(localSpaceMovementVelocity);
        animations.forEach((value, animationId) => {
          setActorAnimationWeightScale(entity, {
            animationId,
            weight: value.weight,
            scale: value.timeScale
          });
        });
        if (getComponent(entity, CharacterComponent).localMovementDirection.length() === 0 && localSpaceMovementVelocity.length() < 0.01) {
          addState(entity, { state: CharacterStateTypes.IDLE });
        }
      }
    },
    {
      behavior: setFallingState
    }
  ]
};
