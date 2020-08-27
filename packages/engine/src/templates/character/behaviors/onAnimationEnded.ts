import { CharacterComponent } from '../components/CharacterComponent';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { addState } from '../../../state/behaviors/StateBehaviors';

export const onAnimationEnded: Behavior = (entity: Entity, args: { transitionToState: any; }, deltaTime) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if(!actor.initialized) return;
  console.log("onAnimationEnded...")
  if (actor.timer > actor.currentAnimationLength - deltaTime) {
    console.log("******** onAnimationEnded !!!")
    addState(entity, { state: args.transitionToState });
  }
};
