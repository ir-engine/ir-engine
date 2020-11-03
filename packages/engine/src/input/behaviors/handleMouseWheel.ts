import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { InputType } from '../enums/InputType';
import { Input } from '../components/Input';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { MouseInput } from '../enums/MouseInput';
import { LifecycleValue } from '../../common/enums/LifecycleValue';

/**
 * System behavior called whenever the mouse pressed
 *
 * @param {Entity} entity The entity
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

export const handleMouseWheel: Behavior = (entity: Entity, args: { event: WheelEvent }): void => {
  const input = getComponent(entity, Input);
  const value = args.event?.deltaY;
  console.log(args)

  // If mouse position not set, set it with lifecycle started
  if (!input.data.has(input.schema.mouseInputMap.axes[MouseInput.MouseScroll])) {
    input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseScroll], {
      type: InputType.ONEDIM,
      value: Math.sign(value),
      lifecycleState: LifecycleValue.STARTED
    });
  } else {
    // If mouse position set, check it's value
    const oldValue = input.data.get(input.schema.mouseInputMap.axes[MouseInput.MouseScroll]).value as number;

    // If it's not the same, set it and update the lifecycle value to changed
    input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseScroll], {
      type: InputType.ONEDIM,
      value: oldValue + Math.sign(value),
      lifecycleState: LifecycleValue.CHANGED
    });
  }
};
