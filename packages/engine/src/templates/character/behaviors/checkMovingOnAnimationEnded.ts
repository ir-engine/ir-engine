import { ActorComponent } from '../components/ActorComponent';
import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { addState } from '../../../state/behaviors/StateBehaviors';

export const checkMovingOnAnimationEnded: Behavior = (entity: Entity, args: { transitionToStateIfMoving: any; transitionToStateIfNotMoving: any; }, deltaTime) => {
  const actor = getComponent<ActorComponent>(entity, ActorComponent as any);
  if (actor.timer > actor.currentAnimationLength - deltaTime) {
    if (actor.velocity.length() > (0.1 * deltaTime)) {
      console.log("Transitioning to movement state");
      addState(entity, { state: args.transitionToStateIfMoving });
    }
    else {
      console.log("Transitioning to idle state");
      addState(entity, { state: args.transitionToStateIfNotMoving });
    }
  }
};
