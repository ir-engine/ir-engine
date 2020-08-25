import { CharacterComponent } from '../../../character/components/CharacterComponent';
import { Behavior } from '../../../common/interfaces/Behavior';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { FallingState } from '../states/FallingState';
import { addState } from '../../../state/behaviors/StateBehaviors';

export const checkFalling: Behavior = (entity) => {
  const character = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if (!character.rayHasHit)
    addState(entity, { state: FallingState });
};
