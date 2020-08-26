import { ActorComponent } from '../components/ActorComponent';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { addState } from '../../../state/behaviors/StateBehaviors';
/// On Animation ended

export const onAnimationEnded: Behavior = (entity: Entity, args: { transitionToState: any; }, deltaTime) => {
  const actor = getComponent<ActorComponent>(entity, ActorComponent as any);
  if (actor.timer > actor.currentAnimationLength - deltaTime) {
    addState(entity, { state: args.transitionToState });
  }
};
