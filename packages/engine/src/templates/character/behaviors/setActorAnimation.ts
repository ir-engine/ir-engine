import { CharacterComponent } from '../components/CharacterComponent';
import { Behavior } from '../../../common/interfaces/Behavior';
import { getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { AnimationClip } from 'three';

export const setActorAnimation: Behavior = (entity, args: { name: string; transitionDuration: number; }) => {
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  console.log("args")
  console.log(args)
  console.log("Actor animations")
  console.log(actor.animations)
  console.log("Animation name: " + args.name)
  if(!actor.initialized) return console.log("Not setting actor animation because not initialized")
  let clip = AnimationClip.findByName(actor.animations, args.name);

  let action = actor.mixer.clipAction(clip);
  if (action === null) {
    console.error(`Animation ${args.name} not found!`);
    return 0;
  }

  console.log("action")
  console.log(action)

  actor.mixer.stopAllAction();
  action.fadeIn(args.transitionDuration);
  action.play();

  actor.currentAnimationLength = action.getClip().duration;
  console.log("current animation length: ", action.getClip().duration)
};
