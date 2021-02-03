import { AnimationClip } from 'three';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { CharacterComponent } from '../components/CharacterComponent';
import { defaultAvatarAnimations, CharacterAvatars, AnimationConfigInterface } from "../CharacterAvatars";
import { CharacterAvatarComponent } from "../components/CharacterAvatarComponent";
import { CharacterAnimationsIds } from "../CharacterAnimationsIds";
import { getActorAnimationConfig } from "./getActorAnimationConfig";



export const setActorAnimationWeightScale: Behavior = (entity, args: { animationId: number; weight?: number; scale?: number, replaceCurrent?: boolean, transitionDuration?: number }) => {
  const actor = getComponent(entity, CharacterComponent);
  // console.log('setActorAnimationWS [', CharacterAnimationsIds[args.animationId], '](',args.animationId,') W:', args.weight, ' S:', args.scale);

  // Actor isn't initialized yet, so skip the animation
  if(!actor?.initialized) return;
  // if actor model is not yet loaded mixer could be empty
  if (!actor.mixer) return;

  const avatarAnimation: AnimationConfigInterface = getActorAnimationConfig(entity, args.animationId);
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
