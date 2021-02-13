import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { setState } from "../../../state/behaviors/setState";
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent } from '../components/CharacterComponent';

export const setDropState: Behavior = (entity, args = null, deltaTime) => {
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  if(!actor.initialized) return;
  const hitGroundOrStopped = actor.rayHasHit || actor.groundImpactVelocity.y > -1;
  if (!hitGroundOrStopped) return;

  if (actor.groundImpactVelocity.y < -6)
  {
    setState(entity, { state: CharacterStateTypes.DROP });
  } else {
      setState(entity, { state: CharacterStateTypes.DEFAULT });
  }
};
