import { ActorComponent } from '../components/ActorComponent';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { addState } from '../../../state/behaviors/StateBehaviors';
import { Behavior } from '../../../common/interfaces/Behavior';

export const checkMoving: Behavior = (entity, args: { transitionToState: any; }, deltaTime) => {
  const actor = getComponent<ActorComponent>(entity, ActorComponent as any);
  // TODO: Arbitrary 
  if (actor.velocity.length() > (0.1 * deltaTime)) {
    console.log("Change state to walking forward");
    addState(entity, { state: args.transitionToState });
  }
};
