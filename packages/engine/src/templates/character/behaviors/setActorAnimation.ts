import { AnimationClip } from 'three';
import { Behavior } from '../../../common/interfaces/Behavior';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { CharacterComponent } from '../components/CharacterComponent';
import { CharacterAvatarComponent } from "../components/CharacterAvatarComponent";
import { CharacterAvatars, defaultAvatarAnimations } from "../CharacterAvatars";



export const setActorAnimationById: Behavior = (entity, args: { animationId: string; transitionDuration: number }) => {
  const actor = getComponent(entity, CharacterComponent);
  // Actor isn't initialized yet, so skip the animation
  if(!actor?.initialized) return;
  // if actor model is not yet loaded mixer could be empty
  if (!actor.mixer) return;

  // TODO: get animation name from current avatar
  const avatarId = getComponent(entity, CharacterAvatarComponent)?.avatarId;
  const avatarAnimations = CharacterAvatars.find(a => a.id === avatarId)?.animations ?? defaultAvatarAnimations;
  const avatarAnimationName = avatarAnimations[args.animationId];
  if (!avatarAnimationName) {
    return;
  }
  return setActorAnimation(entity, { name: avatarAnimationName, transitionDuration: args.transitionDuration })
}

export const setActorAnimation: Behavior = (entity, args: { name: string; transitionDuration: number }) => {
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

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
  }

  if (newAction === null) {
    console.warn('setActorAnimation', args.name, ', not found');
    return;
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
