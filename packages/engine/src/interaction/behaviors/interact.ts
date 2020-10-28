import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { Interactable } from "../components/Interactable";
import { getComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { Interactor } from "../components/Interactor";
import { Input } from "../../input/components/Input";
import { DefaultInput } from "../../templates/shared/DefaultInput";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { Engine } from "../../ecs/classes/Engine";
import { TouchInputs } from "../../input/enums/TouchInputs";
import { Vector2 } from "three";
import { normalizeMouseCoordinates } from "../../common/functions/normalizeMouseCoordinates";

/**
 *
 * @param entity the one who interacts
 * @param args
 * @param delta
 */

const startedPosition = new Map<Entity,any>();

export const  interact: Behavior = (entity: Entity, args: any, delta): void => {
  if (!hasComponent(entity, Interactor)) {
    console.error(
      'Attempted to call interact behavior, but actor does not have Interacts component'
    );
    return;
  }
  
  const { focusedInteractive: focusedEntity } = getComponent(entity, Interacts);
  const input = getComponent(entity, Input);
  const mouseScreenPosition = getComponent(entity, Input).data.get(DefaultInput.SCREENXY);
   
  if (args.phaze === LifecycleValue.STARTED ){
    startedPosition.set(entity,mouseScreenPosition.value);
    return;
  }

  const startedMousePosition = startedPosition.get(entity);
  
  if (startedMousePosition !== mouseScreenPosition.value) {
    if (!focusedEntity) {
      // no available interactive object is focused right now
      return;
    }
  }

    if (!hasComponent(focusedEntity, Interactable)) {
      console.error(
        'Attempted to call interact behavior, but target does not have Interactive component'
      );
      return;
    }

    const interactive = getComponent(focusedEntity, Interactable);
    if (interactive && typeof interactive.onInteraction === 'function') {
      interactive.onInteraction(entity, args, delta, focusedEntity);
    }
  
};
