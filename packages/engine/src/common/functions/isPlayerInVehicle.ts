import { getComponent } from "../../ecs/functions/EntityFunctions";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";

/** @returns Whether is MyPlayer or not. */

export const isPlayerInVehicle = function(entity) {
  return getComponent<CharacterComponent>(entity, CharacterComponent).actorCapsule.body.world == null;
};
