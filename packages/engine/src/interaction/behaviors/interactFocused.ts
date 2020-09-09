import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { Interactive } from "../components/Interactive";
import { getComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { InteractiveFocused } from "../components/InteractiveFocused";

export const interactFocused:Behavior = (entity: Entity, args, delta: number): void => {
  if (!hasComponent(entity, Interactive)) {
    console.error('Attempted to call interact behavior, but target does not have Interactive component')
    return
  }

  const focused = hasComponent(entity, InteractiveFocused)
  const interactive = getComponent(entity, Interactive)
  if (interactive && typeof interactive.onInteractionFocused === 'function') {
    const entityFocuser = focused? getComponent(entity, InteractiveFocused).interacts : null
    interactive.onInteractionFocused(entityFocuser, { focused }, delta, entity)
  }
}