import { CharacterComponent } from '../components/CharacterComponent';
import { Behavior } from '../../../common/interfaces/Behavior';
import { getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { AnimationClip } from 'three';
import { now } from '../../../common/functions/now';

export const setActorAnimation: Behavior = (entity, args: { name: string; transitionDuration: number; }) => {
  console.log('set anim: ', args.name, args.transitionDuration, 'now', now());
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  if(!actor.initialized) return console.log("Not setting actor animation because not initialized")
  const clip = AnimationClip.findByName(actor.animations, args.name);

  const action = actor.mixer.clipAction(clip);
  if (action === null) {
    console.error(`Animation ${args.name} not found!`);
    return 0;
  }
  actor.mixer.stopAllAction();
  action.fadeIn(args.transitionDuration);
  action.play();

  /*
    if (actor.currentAnimationAction) {
    if (actor.currentAnimationAction === action) {
      return 1;
    }

    // const currentClip = AnimationClip.findByName(actor.animations, actor.currentAnimationName);
    // const currentAction = actor.mixer.clipAction(currentClip);
    // currentAction.fadeOut(args.transitionDuration);
    action.fadeIn(args.transitionDuration);
    action.play();

    actor.currentAnimationAction.fadeOut(args.transitionDuration).stop();
    setTimeout(() => {

    }, args.transitionDuration);

    actor.currentAnimationAction = action;
  } else {
    action.fadeIn(args.transitionDuration);
    action.play();

    actor.currentAnimationAction = action;
  }
   */

  actor.currentAnimationLength = action.getClip().duration;
};
