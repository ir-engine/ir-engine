import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { Interactive } from "../components/Interactive";
import { getComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { Interacts } from "../components/Interacts";

/**
 *
 * @param entity the one who interacts
 * @param args
 * @param delta
 */
export const interact:Behavior = (entity: Entity, args:any, delta): void => {
  if (!hasComponent(entity, Interacts)) {
    console.error('Attempted to call interact behavior, but actor does not have Interacts component');
    return;
  }
  const { focusedInteractive:focusedEntity } = getComponent(entity, Interacts);

  if (!focusedEntity) {
    // no available interactive object is focused right now
    return;
  }

  if (!hasComponent(focusedEntity, Interactive)) {
    console.error('Attempted to call interact behavior, but target does not have Interactive component');
    return;
  }

  const interactive = getComponent(focusedEntity, Interactive);
  if (interactive && typeof interactive.onInteraction === 'function') {
    interactive.onInteraction(entity, args, delta, focusedEntity);
  }
};