import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { Interactable } from "../components/Interactable";
import { getComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { Interactor } from "../components/Interactor";
import { Input } from "../../input/components/Input";
import { DefaultInput } from "../../templates/shared/DefaultInput";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { NumericalType } from "../../common/types/NumericalTypes";

const startedPosition = new Map<Entity,NumericalType>();

/**
 *
 * @param entity the one who interacts
 * @param args
 * @param delta
 */
export const  interact: Behavior = (entity: Entity, args: any, delta): void => {
  if (!hasComponent(entity, Interactor)) {
    console.error(
      'Attempted to call interact behavior, but actor does not have Interactor component'
    );
    return;
  }
  
  const { focusedInteractive: focusedEntity } = getComponent(entity, Interactor);
  const mouseScreenPosition = getComponent(entity, Input).data.get(DefaultInput.SCREENXY);

  if (args.phaze === LifecycleValue.STARTED ){
    startedPosition.set(entity,mouseScreenPosition.value);
    return;
  }

  if (!focusedEntity) {
    // no available interactive object is focused right now
    return;
  }

  const startedMousePosition = startedPosition.get(entity);
  if (startedMousePosition !== mouseScreenPosition.value) {
    // mouse moved, skip "click"
    console.warn('mouse moved!');
    return;
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
