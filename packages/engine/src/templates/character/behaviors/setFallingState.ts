import { Behavior } from '../../../common/interfaces/Behavior';
import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { addState } from "../../../state/behaviors/addState";
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent } from '../components/CharacterComponent';
import { State } from '../../../state/components/State';

const FALLING_SPEED = -0.5;

export const setFallingState: Behavior = (entity) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if (!actor.initialized) return;
  if (actor.rayHasHit) return;
  if (actor.velocity.y > FALLING_SPEED) {
    return;
  }
  // console.log("Setting falling state from: ", getComponent<State>(entity, State).data.keys())
  addState(entity, {state: CharacterStateTypes.FALLING});
};
