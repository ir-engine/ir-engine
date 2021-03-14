/** @returns Whether is MyPlayer or not. */
import { getComponent } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";
import { CharacterComponent } from "@xr3ngine/engine/src/templates/character/components/CharacterComponent";

export const isPlayerInVehicle = function(entity) {
  return getComponent<CharacterComponent>(entity, CharacterComponent).actorCapsule.body.world == null;
};
