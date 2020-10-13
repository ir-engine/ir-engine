import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { Interactive } from "../components/Interactive";
import { getComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { Interacts } from "../components/Interacts";
import { Input } from "../../input/components/Input";
import { DefaultInput } from "../../templates/shared/DefaultInput";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { LifecycleValue } from "../../common/enums/LifecycleValue";

/**
 *
 * @param entity the one who interacts
 * @param args
 * @param delta
 */
export const interact: Behavior = (entity: Entity, args: any, delta): void => {
  if (!hasComponent(entity, Interacts)) {
    console.error(
      'Attempted to call interact behavior, but actor does not have Interacts component'
    )
    return
  }
  const { focusedInteractive: focusedEntity } = getComponent(entity, Interacts)
  const input = getComponent(entity, Input)
  // const mouseStarted = LifecycleValue.STARTED;
  // const mouseEnded = LifecycleValue.ENDED;
  // const mouseScreenPosition = getComponent(entity, Input).data.get(DefaultInput.SCREENXY);
  let mouseScreenPosition = getComponent(entity, Input).data.get(DefaultInput.MOUSE_MOVEMENT)
  let mouseButtonDownCheckStart = input.schema.inputButtonBehaviors[8].started[0].args.phaze
  let mouseButtonDownCheckEnd = input.schema.inputButtonBehaviors[8].ended[0].args.phaze

  console.log(mouseScreenPosition)

  if (mouseButtonDownCheckEnd && !mouseScreenPosition) {
    if (!focusedEntity) {
      // no available interactive object is focused right now
      return
    }

    if (!hasComponent(focusedEntity, Interactive)) {
      console.error(
        'Attempted to call interact behavior, but target does not have Interactive component'
      )
      return
    }

    const interactive = getComponent(focusedEntity, Interactive)
    if (interactive && typeof interactive.onInteraction === 'function') {
      interactive.onInteraction(entity, args, delta, focusedEntity)
    }
  }
  // else {

  // }
}