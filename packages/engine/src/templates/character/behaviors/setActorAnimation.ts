import { AnimationActionLoopStyles, AnimationClip } from 'three';
import { Behavior } from '../../../common/interfaces/Behavior';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { CharacterComponent } from '../components/CharacterComponent';
import { CharacterAvatarComponent } from "../components/CharacterAvatarComponent";
import { AnimationConfigInterface, CharacterAvatars, defaultAvatarAnimations } from "../CharacterAvatars";
import { getActorAnimationConfig } from "./getActorAnimationConfig";
import { CharacterAnimationsIds } from "../CharacterAnimationsIds";

export const setActorAnimationById: Behavior = (entity, args: { animationId: number; transitionDuration: number }) => {
  const actor = getComponent(entity, CharacterComponent);
  // Actor isn't initialized yet, so skip the animation
  if(!actor?.initialized) return;
  // if actor model is not yet loaded mixer could be empty
  if (!actor.mixer) return;

  const avatarAnimation: AnimationConfigInterface = getActorAnimationConfig(entity, args.animationId);
  if (!avatarAnimation) {
    console.error(`setActorAnimation - animation not found for:[${CharacterAnimationsIds[args.animationId]}](${args.animationId})`, args.transitionDuration);
    return;
  }
  return setActorAnimation(entity, { name: avatarAnimation.name, transitionDuration: args.transitionDuration, loop: avatarAnimation.loop });
};

export const setActorAnimation: Behavior = (entity, args: { name: string; transitionDuration: number, loop: AnimationActionLoopStyles }) => {
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  // console.log('setActorAnimation', args.name, args.transitionDuration, args.loop);

  // Actor isn't initialized yet, so skip the animation
  if(!actor.initialized) return;
  // if actor model is not yet loaded mixer could be empty
  if (!actor.mixer) return;

  if (actor.currentAnimationAction && args.name == actor.currentAnimationAction.getClip().name) {
    console.warn('setActorAnimation', args.name, ', same animation already playing');
    return;
  }

  const animationRoot = actor.modelContainer.children[0];
  if (!animationRoot) {
    console.error('Animation root/model is undefined', animationRoot);
    return;
  }

  const clip = AnimationClip.findByName(actor.animations, args.name );
  let newAction = actor.mixer.existingAction(clip, animationRoot);
  if (!newAction) {
    // get new action
    newAction = actor.mixer.clipAction(clip, animationRoot);
    if (!newAction) {
      console.warn('setActorAnimation', args.name, ', not found');
      return;
    }
  }
  if (typeof args.loop !== "undefined") {
    newAction.setLoop(args.loop, Infinity);
  }

  if (actor.currentAnimationAction) {
    actor.currentAnimationAction.fadeOut(args.transitionDuration);
  }

  newAction
    .reset()
    .setEffectiveTimeScale( 1 )
    .setEffectiveWeight( 1 )
    .fadeIn( args.transitionDuration )
    .play();

  actor.currentAnimationAction = newAction;
  actor.currentAnimationLength = newAction.getClip().duration;
};
