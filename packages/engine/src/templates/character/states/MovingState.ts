import { BinaryValue } from "@xr3ngine/engine/src/common/enums/BinaryValue";
import { BaseInput } from '@xr3ngine/engine/src/input/enums/BaseInput';
import { AnimationClip, MathUtils } from "three";
import { Entity } from "../../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { Input } from '../../../input/components/Input';
import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { trySwitchToJump } from "../behaviors/trySwitchToJump";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { AnimationConfigInterface, CharacterAvatars, defaultAvatarAnimations } from "../CharacterAvatars";
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent, RUN_SPEED, START_SPEED, WALK_SPEED } from '../components/CharacterComponent';

const {
  IDLE,
  WALK_FORWARD, WALK_BACKWARD, WALK_STRAFE_LEFT, WALK_STRAFE_RIGHT,
  RUN_FORWARD, RUN_BACKWARD, RUN_STRAFE_LEFT, RUN_STRAFE_RIGHT
} = CharacterStateTypes;

interface AnimationWeightScaleInterface {
  weight: number
}

// speed - what speed is represented by walk animation
// TODO: move speed into animation config
const animationAxisSpeed = [
  { positiveAnimationId: WALK_FORWARD, negativeAnimationId: WALK_BACKWARD, axis: 'z', speed: 1, range: [0, 1], run: false },
  { positiveAnimationId: WALK_STRAFE_LEFT, negativeAnimationId: WALK_STRAFE_RIGHT, axis: 'x', speed: 1, range: [0, 1], run: false },
  { positiveAnimationId: RUN_FORWARD, negativeAnimationId: RUN_BACKWARD, axis: 'z', speed: 2, range: [0, 1], run: true },
  { positiveAnimationId: RUN_STRAFE_LEFT, negativeAnimationId: RUN_STRAFE_RIGHT, axis: 'x', speed: 2, range: [0, 1], run: true },
];

const movementAnimations: {[key:number]: AnimationConfigInterface} = {
  [IDLE]: { name: 'idle' },
  [WALK_FORWARD]: { name: 'walking' },
  [WALK_BACKWARD]: { name: 'walking_backward' },
  [WALK_STRAFE_RIGHT]: { name: 'walk_right' },
  [WALK_STRAFE_LEFT]: { name: 'walk_left' },
  [RUN_FORWARD]: { name: 'run_forward' },
  [RUN_BACKWARD]: { name: 'run_backward' },
  [RUN_STRAFE_RIGHT]: { name: 'run_right' },
  [RUN_STRAFE_LEFT]: { name: 'run_left' }
};

export const MovingState: StateSchemaValue = {
  componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['canEnterVehicles']: true,
    }
  }],
  onEntry: [
    {
      behavior: initializeCharacterState,
      args: {
        animationId: IDLE,
        transitionDuration: 0.3
      }
    },
    {
    behavior: (entity: Entity): void => {
      const actor = getMutableComponent(entity, CharacterComponent);

// Walking animation names
// If animation is not in this array, remove

      // Actor isn't initialized yet, so skip the animation
      if (!actor || !actor.initialized || !actor.mixer) return;

      const avatarAnimations = CharacterAvatars.find(a => a.id === actor.avatarId)?.animations ?? defaultAvatarAnimations;

      const movementAnimationNames = Object.values(movementAnimations).map(val => val.name);

        // Clear existing animations
        actor.currentAnimationAction.forEach(currentAnimationAction => {
          if(movementAnimationNames.filter(movAnim => movAnim === currentAnimationAction.getClip().name).length > 0)
            return;
          currentAnimationAction.fadeOut(.3);
          currentAnimationAction.setEffectiveWeight(0);
        } )
    }
    }
  ],
  onUpdate: [
    {
      behavior: updateCharacterState
    },
    {
      behavior: triggerActionIfMovementHasChanged,
      args: {
        action: (entity: Entity): void => {
          // Check if we're trying to jump
          if (trySwitchToJump(entity)) {
            return;
          }
        }
      }
    },
    {
      behavior: (entity: Entity): void => {
        const actor = getMutableComponent(entity, CharacterComponent);
        // Actor isn't initialized yet, so skip the animation
        if (!actor || !actor.initialized || !actor.mixer)
          return;
        const input = getComponent(entity, Input);
        const isWalking = (input.data.get(BaseInput.WALK)?.value) === BinaryValue.ON;
        actor.moveSpeed = isWalking ? WALK_SPEED : RUN_SPEED;

        const actorVelocity = actor.velocity.clone();
        const animations = new Map<number, AnimationWeightScaleInterface>();
        // Normalize direction for XZ movement
        const direction = actorVelocity.clone().setY(0).normalize();
        const avatarId = actor.avatarId;
        const avatarAnimations = CharacterAvatars.find(a => a.id === avatarId)?.animations ?? defaultAvatarAnimations;
        const animationRoot = actor.modelContainer.children[0];

        // Initialize state weights with idle
        const stateWeights = {
          idle: 1,
          walk: 0,
          run: 0
        };

        // Get the magnitude of current velocity
        const absSpeed = actorVelocity.setY(0).length();

        // If we're not standing still...
        if (absSpeed > 0.01) {
          if (isWalking) {
            if (absSpeed <= START_SPEED) {
              stateWeights.walk = MathUtils.smoothstep(absSpeed, 0, START_SPEED);
              stateWeights.idle = 1 - stateWeights.walk;
            } else {
              stateWeights.idle = 0;
              stateWeights.walk = 1;
            }
          }
          else if (absSpeed <= START_SPEED) {
            stateWeights.run = MathUtils.smoothstep(absSpeed, 0, START_SPEED);
            stateWeights.idle = 1 - stateWeights.run;
          } else {
            stateWeights.idle = 0;
            stateWeights.run = 1;
          }
        } else {
          stateWeights.idle = 1;
        }

        // For each axis
        animationAxisSpeed.forEach(animationWeightsConfig => {
          const { positiveAnimationId, negativeAnimationId, axis, speed, run: isRun } = animationWeightsConfig;

          // If the value is more than 0, play position animation, otherwise play negative animation
          const animationId = direction[axis] > 0 ? positiveAnimationId : negativeAnimationId;
          const offAnimationId = direction[axis] > 0 ? negativeAnimationId : positiveAnimationId;

          // Solve for X
          
          // Solve for z
          let weight = MathUtils.clamp(Math.abs(direction[axis]), 0, 1);
          if (weight) {
            weight *= isRun ? stateWeights.run : stateWeights.walk;
          }
          animations.set(animationId, { weight });
          animations.set(offAnimationId, { weight: 0 });
        });

        animations.set(IDLE, { weight: stateWeights.idle });

        animations.forEach((value, positiveAnimationId) => {
          // console.log('setActorAnimationWS [', CharacterStateTypes[positiveAnimationId], '](', positiveAnimationId, ') W:', value.weight);
          const avatarAnimation: AnimationConfigInterface = avatarAnimations[positiveAnimationId];

          const clip = AnimationClip.findByName(actor.animations, avatarAnimation.name);
          let action = actor.mixer.existingAction(clip, animationRoot);
          
          if (!action) {
            // get new action
            action = actor.mixer.clipAction(clip, animationRoot);
            if (action === null) {
              console.warn('setActorAnimation [', avatarAnimation.name, '], not found');
              return;
            }
          }
          if (typeof avatarAnimation.loop !== "undefined") {
            action.setLoop(avatarAnimation.loop, Infinity);
          }
          // Push the action to our queue so we can handle it later if necessary
          if(!actor.currentAnimationAction.includes(action))
            actor.currentAnimationAction.push(action);

          // console.log(`
          // avatarAnimation.name: ${avatarAnimation.name} |
          // args.weight: ${value.weight}
          // `)

          const weight = value.weight ?? 1;

          // just set weight and scale
          action.setEffectiveWeight(weight);
          if (weight > 0 && !action.isRunning()) {
            action.play();
          } else if (weight === 0 && action.isRunning()) {
            action.stop();
          }
        });
      }
    },
    // {
    //   behavior: setFallingState
    // }
  ]
};
