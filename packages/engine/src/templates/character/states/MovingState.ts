import { BinaryValue } from "@xr3ngine/engine/src/common/enums/BinaryValue";
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { BaseInput } from '@xr3ngine/engine/src/input/enums/BaseInput';
import { AnimationClip, MathUtils, Vector3 } from "three";
import { Entity } from "../../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { Input } from '../../../input/components/Input';
import { setState } from "../../../state/behaviors/setState";
import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { initializeCharacterState } from "../behaviors/initializeCharacterState";
import { setFallingState } from "../behaviors/setFallingState";
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { trySwitchToJump } from "../behaviors/trySwitchToJump";
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { AnimationConfigInterface, CharacterAvatars, defaultAvatarAnimations } from "../CharacterAvatars";
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterAvatarComponent } from "../components/CharacterAvatarComponent";
import { CharacterComponent, RUN_SPEED, RUN_START_SPEED, WALK_SPEED, WALK_START_SPEED } from '../components/CharacterComponent';

const localSpaceMovementVelocity = new Vector3();

const {
    WALK_FORWARD, WALK_BACKWARD, WALK_STRAFE_LEFT, WALK_STRAFE_RIGHT,
    RUN_FORWARD, RUN_BACKWARD, RUN_STRAFE_LEFT, RUN_STRAFE_RIGHT
} = CharacterStateTypes;

interface AnimationWeightScaleInterface {
    weight: number
    timeScale: number
}

// speed - what speed is represented by walk animation
// TODO: move speed into animation config
const animationAxisSpeed = [
    { animationId: WALK_FORWARD, axis: 'z', speed: 2.2, range: [ 0, 1 ], run: false },
    { animationId: WALK_BACKWARD, axis: 'z', speed: 1.5, range: [ -1, 0 ], run: false },
    { animationId: WALK_STRAFE_LEFT, axis: 'x', speed: 2.2, range: [ 0, 1 ], run: false },
    { animationId: WALK_STRAFE_RIGHT, axis: 'x', speed: 2.2, range: [ -1, 0 ], run: false },
    { animationId: RUN_FORWARD, axis: 'z', speed: 6, range: [ 0, 1 ], run: true },
    { animationId: RUN_BACKWARD, axis: 'z', speed: 5, range: [ -1, 0 ], run: true },
    { animationId: RUN_STRAFE_LEFT, axis: 'x', speed: 6, range: [ 0, 1 ], run: true },
    { animationId: RUN_STRAFE_RIGHT, axis: 'x', speed: 6, range: [ -1, 0 ], run: true },
];

function getWeights(absSpeed): { idle: number, walk: number, run: number } {
    const speeds = {
        idle: 1,
        walk: 0,
        run: 0
    };

    if (absSpeed > 0.001) {
        speeds.idle = 0;
        // idle|   idle  +  walk     |    walk      |    walk + run     |   run
        // 0   | > WALK_START_SPEED  | > WALK_SPEED | > RUN_START_SPEED | > RUN_SPEED
        if (absSpeed <= WALK_START_SPEED) {
            speeds.walk = MathUtils.smoothstep(absSpeed, 0, WALK_START_SPEED);
            speeds.idle = 1 - speeds.walk;
        } else if (absSpeed <= WALK_SPEED) {
            speeds.walk = 1;
        } else if (absSpeed <= RUN_START_SPEED) {
            speeds.run = MathUtils.smoothstep(absSpeed, WALK_SPEED, RUN_START_SPEED);
            speeds.walk = 1 - speeds.run;
        } else {
            speeds.run = 1;
        }
    }

    return speeds;
}

const getMovingAnimationsByVelocity = (localSpaceVelocity: Vector3): Map<number, AnimationWeightScaleInterface> => {
    const animations = new Map<number, AnimationWeightScaleInterface>();
    const velocity  = localSpaceVelocity.clone();
    const direction = velocity.clone().normalize();

    const stateWeights = getWeights(velocity.length());

    const invertAnimations = direction.z > -0.001 ? [] : [ WALK_STRAFE_RIGHT, WALK_STRAFE_LEFT, RUN_STRAFE_RIGHT, RUN_STRAFE_LEFT ];

    animationAxisSpeed.forEach(animationWeightsConfig => {
        const { animationId, axis, speed, range, run: isRun } = animationWeightsConfig;

        let timeScale = 1;
        const inverted = invertAnimations.indexOf(animationId) !== -1;
        let weight = Math.abs(MathUtils.clamp(direction[axis] * (inverted? -1 : 1), range[0], range[1]));
        if (weight) {
            /*
             if animation is not playing (weight === 0), there is no need to calculate all this
             */
            // calc influence of each animation by it's weight
            const absSpeed = Math.abs(localSpaceVelocity[axis]);

            weight *= isRun ? stateWeights.run : stateWeights.walk;
            timeScale = absSpeed / speed;

            if (timeScale < 0.001) {
                weight = 0;
                timeScale = 0;
            } else if (inverted) {
                timeScale *= -1;
            }
        }

        animations.set(animationId, { weight, timeScale });
    });

    animations.set(CharacterStateTypes.DEFAULT, { weight: stateWeights.idle, timeScale: 1 });

    // console.log('active anims', Array.from(animations).filter(value => {
    //     const [ animationId, weights ] = value;
    //     return weights.weight > 0.001;
    // }).map(value => CharacterStateTypes[value[0]] + '(' + (value[1].weight.toFixed(3)) + ')').join(','));

    return animations;
};


const setActorAnimationWeightScale: Behavior = (entity, args: { animationId: number; weight?: number; scale?: number, replaceCurrent?: boolean, transitionDuration?: number }) => {
  const actor = getComponent(entity, CharacterComponent);
  // console.log('setActorAnimationWS [', CharacterStateTypes[args.animationId], '](',args.animationId,') W:', args.weight, ' S:', args.scale);

  // Actor isn't initialized yet, so skip the animation
  if(!actor?.initialized) return;
  // if actor model is not yet loaded mixer could be empty
  if (!actor.mixer) return;

  const avatarId = getComponent(entity, CharacterAvatarComponent)?.avatarId;
  const avatarAnimations = CharacterAvatars.find(a => a.id === avatarId)?.animations ?? defaultAvatarAnimations;
  const avatarAnimation: AnimationConfigInterface = avatarAnimations[args.animationId];

  if (!avatarAnimation) {
    return;
  }

  if (args.replaceCurrent && actor.currentAnimationAction && avatarAnimation.name === actor.currentAnimationAction.getClip().name) {
    console.log('setActorAnimation', avatarAnimation.name, ', same animation already playing');
    return;
  }

  const animationRoot = actor.modelContainer.children[0];
  if (!animationRoot) {
    console.error('Animation root/model is undefined', animationRoot);
    return;
  }

  const clip = AnimationClip.findByName(actor.animations, avatarAnimation.name );
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

  const weight = args.weight ?? 1;
  const timeScale = args.scale ?? 1;
  if (!args.replaceCurrent) {
    // just set weight and scale
    action.setEffectiveWeight(weight);
    action.setEffectiveTimeScale(timeScale);
    if (weight > 0 && !action.isRunning()) {
      action.play();
    } else if (weight === 0 && action.isRunning()) {
      action.stop();
    }
    return;
  }


  if (actor.currentAnimationAction) {
    actor.currentAnimationAction.fadeOut(args.transitionDuration);
  }
  action
    .reset()
    .setEffectiveTimeScale( 1 )
    .setEffectiveWeight( 1 )
    .fadeIn( args.transitionDuration )
    .play();

  const writableActor = getMutableComponent(entity, CharacterComponent);
  writableActor.currentAnimationAction = action;
  writableActor.currentAnimationLength = action.getClip().duration;
};



export const MovingState: StateSchemaValue = {componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['canEnterVehicles']: true,
    }
  }],
  onEntry: [
    {
      behavior: initializeCharacterState,
      args: {
        animationId: CharacterStateTypes.IDLE,
        transitionDuration: 0.1
      }
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
          const isSprinting = (input.data.get(BaseInput.SPRINT)?.value) === BinaryValue.ON;
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
          setState(entity, { state: CharacterStateTypes.DEFAULT });
        }
      }
    },
    {
      behavior: setFallingState
    }
  ]
};
