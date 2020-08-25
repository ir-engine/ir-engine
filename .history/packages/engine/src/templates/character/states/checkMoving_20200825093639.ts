import { CharacterComponent } from '../../../character/components/CharacterComponent';
import { StartWalkForwardState } from './StartWalkForwardState';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { addState } from '../../../state/behaviors/StateBehaviors';

export const checkMoving: Behavior = (entity, args = null, deltaTime) => {
  const character = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  // TODO: Arbitrary 
  if (character.velocity.length() > (.1 * deltaTime)) {
    console.log("Change state to walking forward");
    addState(entity, { state: StartWalkForwardState });
  }
};
