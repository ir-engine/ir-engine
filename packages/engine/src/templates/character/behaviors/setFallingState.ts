import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { setState } from "../../../state/behaviors/setState";
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent } from '../components/CharacterComponent';

const FALLING_SPEED = -1;

export const setFallingState: Behavior = (entity) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if (!actor.initialized) return;
  if (actor.rayHasHit) return;
  if (actor.actorCapsule.body.velocity.y > FALLING_SPEED) {
    return;
  }
  // console.log("Setting falling state from: ", getComponent<State>(entity, State).data.keys())
  setState(entity, {state: CharacterStateTypes.FALLING});
};
