import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { addComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions";
import { HighlightComponent } from "../../effects/components/HighlightComponent";
import { Interactable } from "../components/Interactable";
import { SubFocused } from "../components/SubFocused";


// TO DO: add logic what to do if the object is highlighted in a different way, e.g. mouse or quest object

export const subFocused:Behavior = (entity: Entity, args, delta: number): void => {

  if (!hasComponent(entity, Interactable)) {
    console.error('Attempted to call interact behavior, but target does not have Interactive component');
    return;
  }

  //const focused = hasComponent(entity, InteractiveFocused);
  const subFocused = hasComponent(entity, SubFocused);

//  if (!focused) {
    if (subFocused){
      addComponent(entity, HighlightComponent);
    }
    else {
      removeComponent(entity, HighlightComponent);
    }
//  }

};
