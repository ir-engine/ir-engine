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
  // console.log("Setting drop state");


  if (actor.groundImpactVelocity.y < -6)
  {
    console.log("TRYING TO SET DROP STATE")
    setState(entity, { state: CharacterStateTypes.DROP });
  } else {
      console.log("TRYING TO SET DROP STATE: DEFAULT")
      setState(entity, { state: CharacterStateTypes.DEFAULT });
  }
};
