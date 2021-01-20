import { Behavior } from '../../../common/interfaces/Behavior';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { addState } from "../../../state/behaviors/addState";
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent } from '../components/CharacterComponent';
import { isMovingByInputs } from '../functions/isMovingByInputs';
import { trySwitchToMovingState } from "./trySwitchToMovingState";

export const setDropState: Behavior = (entity, args = null, deltaTime) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if(!actor.initialized) return;
  const hitGroundOrStopped = actor.rayHasHit || actor.groundImpactVelocity.y > -1;
  if (!hitGroundOrStopped) return;
  // console.log("Setting drop state");

  if (actor.groundImpactVelocity.y < -6)
  {
    addState(entity, { state: CharacterStateTypes.DROP_ROLLING });
  } else if(isMovingByInputs(entity)) {
    if (actor.groundImpactVelocity.y < -2) {
      trySwitchToMovingState(entity);
    }
  }
  else
  {
    if (actor.groundImpactVelocity.y < -1) {
      addState(entity, { state: CharacterStateTypes.DROP_IDLE });
    } else {
      addState(entity, { state: CharacterStateTypes.IDLE });
    }
  }
};
