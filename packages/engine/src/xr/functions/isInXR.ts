import { CharacterComponent } from "../../character/components/CharacterComponent";
import { CHARACTER_STATES } from "../../character/state/CharacterStates";
import { getBit } from "../../common/functions/bitFunctions";
import { Entity } from "../../ecs/classes/Entity";
import { getMutableComponent } from "../../ecs/functions/EntityFunctions";

export const isInXR = (entity: Entity) => {
  const actor = getMutableComponent(entity, CharacterComponent);
  return Boolean(getBit(actor.state, CHARACTER_STATES.VR));
}