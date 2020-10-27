import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { Interactable } from "../components/Interactable";
import { addComponent, getComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions";
import { InteractiveFocused } from "../components/InteractiveFocused";
import { HighlightComponent } from "../../effects/components/HighlightComponent";
import { SubFocused } from "../components/SubFocused";

export const interactFocused: Behavior = (entity: Entity, args, delta: number): void => {
  if (!hasComponent(entity, Interactable)) {
    console.error('Attempted to call interact behavior, but target does not have Interactive component');
    return;
  }

  const focused = hasComponent(entity, InteractiveFocused);
  //const subFocused = hasComponent(entity, SubFocused);

  const interactive = getComponent(entity, Interactable);
  if (interactive && typeof interactive.onInteractionFocused === 'function') {
    const entityFocuser = focused? getComponent(entity, InteractiveFocused).interacts : null;
    interactive.onInteractionFocused(entityFocuser, { focused }, delta, entity);
  }
  // now works highlight from subfocus component
/*
  if (!subFocused) {
    if (focused){
      addComponent(entity, HighlightComponent)
    }
    else {
      removeComponent(entity, HighlightComponent)
    }
  }
  */
};
