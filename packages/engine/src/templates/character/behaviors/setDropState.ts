import { Behavior } from '../../../common/interfaces/Behavior';
import { getComponent, hasComponent } from '../../../ecs/functions/EntityFunctions';
import { addState } from "../../../state/behaviors/addState";
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent } from '../components/CharacterComponent';
import { Sprinting } from '../components/Sprinting';
import { Input } from "../../../input/components/Input";
import { isMovingByInputs } from '../functions/isMovingByInputs';
import { DefaultInput } from '../../shared/DefaultInput';
import { trySwitchToMovingState } from "./trySwitchToMovingState";

export const setDropState: Behavior = (entity, args = null, deltaTime) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  const input = getComponent<Input>(entity, Input as any);
  if(!actor.initialized) return;
  if (!actor.rayHasHit) return;
  // console.log("Setting drop state");
  // console.log("isMoving: ", isMoving(entity));

  if (actor.groundImpactVelocity.y < -6)
  {
    addState(entity, { state: CharacterStateTypes.DROP_ROLLING });
  } else if(isMovingByInputs(entity))    {
    if (actor.groundImpactVelocity.y < -2) {
      trySwitchToMovingState(entity);
    }
  }
  else
  {
    addState(entity, { state: CharacterStateTypes.DROP_IDLE });
  }
};
