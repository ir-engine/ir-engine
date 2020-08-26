import { CharacterComponent } from '../components/CharacterComponent';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { addState } from '../../../state/behaviors/StateBehaviors';
import { Behavior } from '../../../common/interfaces/Behavior';

export const checkMoving: Behavior = (entity, args: { transitionToState: any; }, deltaTime) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if(!actor.initialized) return;

  // TODO: Arbitrary 
  if (actor.velocity.length() > (0.001 * deltaTime)) {
    console.log("Change state to walking forward");
    addState(entity, { state: args.transitionToState });
  }
  console.log("Replace me with good logic!")
};
