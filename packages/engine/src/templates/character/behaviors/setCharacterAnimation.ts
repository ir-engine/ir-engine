import { CharacterComponent } from '../../character/components/CharacterComponent';
import { Behavior } from '../../common/interfaces/Behavior';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { AnimationClip } from 'three';

export const setCharacterAnimation: Behavior = (entity, args: { name: string; transitionDuration: number; }) => {
  const character = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

  let clip = AnimationClip.findByName(character.animations, args.name);

  let action = character.mixer.clipAction(clip);
  if (action === null) {
    console.error(`Animation ${args.name} not found!`);
    return 0;
  }

  character.mixer.stopAllAction();
  action.fadeIn(args.transitionDuration);
  action.play();

  character.currentAnimationLength = action.getClip().duration;
};
