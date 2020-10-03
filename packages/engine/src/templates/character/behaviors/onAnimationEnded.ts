import { CharacterComponent } from '../components/CharacterComponent';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { addState } from '../../../state/behaviors/StateBehaviors';
import { now } from '../../../common/functions/now';

export const onAnimationEnded: Behavior = (entity: Entity, args: { transitionToState: any; }, deltaTime) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if(!actor.initialized) return;
  if (actor.timer > actor.currentAnimationLength - deltaTime) {
  //  console.log('animation ended! (', actor.currentAnimationLength, ')', now(),', switch to ', args.transitionToState)
    addState(entity, { state: args.transitionToState });
  }

};
