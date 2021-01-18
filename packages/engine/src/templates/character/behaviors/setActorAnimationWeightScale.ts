import { AnimationClip } from 'three';
import { Behavior } from '../../../common/interfaces/Behavior';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { CharacterComponent } from '../components/CharacterComponent';
import { defaultAvatarAnimations, CharacterAvatars } from "../CharacterAvatars";
import { CharacterAvatarComponent } from "../components/CharacterAvatarComponent";
import { CharacterAnimationsIds } from "../CharacterAnimationsIds";



export const setActorAnimationWeightScale: Behavior = (entity, args: { animationId: number; weight?: number; scale?: number, replaceCurrent?: boolean, transitionDuration?: number }) => {
  const actor = getComponent(entity, CharacterComponent);
  // console.log('setActorAnimationWS [', CharacterAnimationsIds[args.animationId], '](',args.animationId,') W:', args.weight, ' S:', args.scale);

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

  if (args.replaceCurrent && actor.currentAnimationAction && avatarAnimationName == actor.currentAnimationAction.getClip().name) {
    console.log('setActorAnimation', avatarAnimationName, ', same animation already playing');
    return;
  }

  const animationRoot = actor.modelContainer.children[0];
  if (!animationRoot) {
    console.error('Animation root/model is undefined', animationRoot);
    return;
  }

  const clip = AnimationClip.findByName(actor.animations, avatarAnimationName );
  let action = actor.mixer.existingAction(clip, animationRoot);
  if (!action) {
    // get new action
    action = actor.mixer.clipAction(clip, animationRoot);
  }

  if (action === null) {
    console.warn('setActorAnimation [', avatarAnimationName, '], not found');
    return;
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
