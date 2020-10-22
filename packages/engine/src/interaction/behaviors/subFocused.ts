import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { addComponent, getComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions";

import { Interactive } from "../components/Interactive";
import { InteractiveFocused } from "../components/InteractiveFocused";
import { SubFocused } from "../components/SubFocused";
import { HighlightComponent } from "../../effects/components/HighlightComponent";

// DO TO: add logic what to do if the object is highlighted in a different way, e.g. mouse or quest object

export const subFocused:Behavior = (entity: Entity, args, delta: number): void => {

  if (!hasComponent(entity, Interactive)) {
    console.error('Attempted to call interact behavior, but target does not have Interactive component');
    return;
  }

  const focused = hasComponent(entity, InteractiveFocused);
  const subFocused = hasComponent(entity, SubFocused);

  if (!focused) {
    if (subFocused){
      addComponent(entity, HighlightComponent);
    }
    else {
      removeComponent(entity, HighlightComponent);
    }
  }

};
