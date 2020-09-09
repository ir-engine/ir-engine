import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { Interactive } from "../components/Interactive";
import { getComponent, hasComponent } from "../../ecs/functions/EntityFunctions";

export const interact:Behavior = (entity: Entity, args: any, delta: number, entityOut): void => {
  if (!hasComponent(entityOut, Interactive)) {
    console.error('Attempted to call interact behavior, but target does not have Interactive component')
    return
  }

  const interactive = getComponent(entityOut, Interactive)
  if (interactive && typeof interactive.onInteraction === 'function') {
    interactive.onInteraction(entity)
  }
}