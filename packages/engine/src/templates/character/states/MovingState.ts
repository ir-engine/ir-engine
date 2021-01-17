import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { CharacterComponent, RUN_SPEED, WALK_SPEED } from '../components/CharacterComponent';
import { setFallingState } from "../behaviors/setFallingState";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateGroups } from '../CharacterStateGroups';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { Input } from '../../../input/components/Input';
import { isMoving } from '../functions/isMoving';
import { addState } from "../../../state/behaviors/addState";
import { CharacterStateTypes } from '../CharacterStateTypes';
import { DefaultInput } from '../../shared/DefaultInput';
import { Entity } from "../../../ecs/classes/Entity";
import { LifecycleValue } from "../../../common/enums/LifecycleValue";
import { getMovingAnimationsByVelocity } from "../functions/getMovingAnimationsByVelocity";
import { defaultAvatarAnimations } from "../CharacterAvatars";
import { setActorAnimationWeightScale } from "../behaviors/setActorAnimationWeightScale";
import { initializeCharacterState } from "../behaviors/initializeCharacterState";

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
    // {
    //   behavior: setActorAnimation,
    //   args: {
    //     name: 'walking',
    //     transitionDuration: 0.4
    //   }
    // }
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
          const isSprinting = (input.data.get(DefaultInput.SPRINT)?.lifecycleState) !== LifecycleValue.ENDED;
          const neededMovementSpeed = isSprinting? RUN_SPEED : WALK_SPEED;
          if (actor.moveSpeed !== neededMovementSpeed) {
            const writableActor = getMutableComponent(entity, CharacterComponent);
            writableActor.moveSpeed = neededMovementSpeed;
          }

          // actor.velocity.clone().multiplyScalar(actor.moveSpeed);


          // Check if we're trying to jump
          if (input.data.has(DefaultInput.JUMP))
            return addState(entity, { state: CharacterStateTypes.JUMP_RUNNING });
        }
      }
    },
    {
      behavior: entity => {
        const actor = getComponent(entity, CharacterComponent);
        const animations = getMovingAnimationsByVelocity(actor.localMovementDirection);
        animations.forEach((value, animationId) => {
          setActorAnimationWeightScale(entity, {
            animationId: animationId,
            weight: value.weight,
            scale: value.timeScale
          });
        });
        // TODO: sync run/walk animation pairs? (run_forward with walk_forward, run_left with walk_left)

        // Check if we stopped moving
        console.log('update moving', isMoving(entity), actor.velocity.length());
        if (!isMoving(entity) && actor.velocity.length() < 0.001) {
          addState(entity, { state: CharacterStateTypes.IDLE });
        }
      }
    },
    {
      behavior: setFallingState
    }
  ]
};
