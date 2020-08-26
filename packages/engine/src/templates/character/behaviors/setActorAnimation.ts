import { CharacterComponent } from '../components/CharacterComponent';
import { Behavior } from '../../../common/interfaces/Behavior';
import { getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { AnimationClip } from 'three';

export const setActorAnimation: Behavior = (entity, args: { name: string; transitionDuration: number; }) => {
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

  let clip = AnimationClip.findByName(actor.animations, args.name);

  let action = actor.mixer.clipAction(clip);
  if (action === null) {
    console.error(`Animation ${args.name} not found!`);
    return 0;
  }

  actor.mixer.stopAllAction();
  action.fadeIn(args.transitionDuration);
  action.play();

  actor.currentAnimationLength = action.getClip().duration;
};
