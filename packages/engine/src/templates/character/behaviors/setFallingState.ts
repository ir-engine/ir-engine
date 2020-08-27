import { Behavior } from '../../../common/interfaces/Behavior';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { addState } from '../../../state/behaviors/StateBehaviors';
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent } from '../components/CharacterComponent';

export const setFallingState: Behavior = (entity) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if(!actor.initialized) return;
   if (actor.rayHasHit) return
    addState(entity, { state: CharacterStateTypes.FALLING });
};
