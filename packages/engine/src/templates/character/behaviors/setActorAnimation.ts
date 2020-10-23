import { CharacterComponent } from '../components/CharacterComponent';
import { Behavior } from '../../../common/interfaces/Behavior';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { Object3DComponent } from "../../../common/components/Object3DComponent";
import { AnimationClip, AnimationAction, LoopOnce } from 'three';
import { now } from '../../../common/functions/now';
import { State } from "@xr3ngine/engine/src/state/components/State";
import { CharacterStateTypes } from "@xr3ngine/engine/src/templates/character/CharacterStateTypes";



export const setActorAnimation: Behavior = (entity, args: { name: string; transitionDuration: number }) => {
  //console.log('set anim: ', args.name, args.transitionDuration, 'now', now());
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  // const actorObject3D: Object3DComponent = getMutableComponent<Object3DComponent>(entity, Object3DComponent);
  const stateComponent = getComponent<State>(entity, State);

  if(!actor.initialized) return console.log("Not setting actor animation because not initialized");

  const clip = AnimationClip.findByName(actor.animations, args.name );
  const newAction = actor.mixer.clipAction(clip, actor.modelContainer.children[0]);

  if (newAction === null) {
    console.warn('setActorAnimation', args.name, ', not found');
    return;
  }

  if (actor.currentAnimationAction === null) {
    actor.currentAnimationAction = newAction;
    newAction.play();
    return;
  }


  if (args.name == actor.currentAnimationAction.getClip().name) {
    console.warn('setActorAnimation', args.name, ', same animation already playing');
    return;
  }
/*
  console.warn('///////////////////////////////');
  console.warn(args.name);
  console.warn(actor.currentAnimationAction.getClip().name);
  console.warn('//////////////////////////////');
*/

  actor.mixer.stopAllAction();

	actor.currentAnimationAction.setEffectiveTimeScale( 1 );
  actor.currentAnimationAction.setEffectiveWeight( 1 );

	newAction.setEffectiveTimeScale( 1 );
	newAction.setEffectiveWeight( 1 );

	//action.time = 0;

// Crossfade with warping - you can also try without warping by setting the third parameter to false

  actor.currentAnimationAction.crossFadeTo(newAction, args.transitionDuration, true);
  newAction.play();
  actor.currentAnimationAction.play();
  actor.currentAnimationAction = newAction;
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

  actor.currentAnimationLength = newAction.getClip().duration;
};
