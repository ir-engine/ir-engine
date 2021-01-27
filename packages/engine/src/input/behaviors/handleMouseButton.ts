import { BinaryValue } from '../../common/enums/BinaryValue';
import { Behavior } from '../../common/interfaces/Behavior';
import { BinaryType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { Input } from '../components/Input';
import { InputType } from '../enums/InputType';
import { MouseInput } from '../enums/MouseInput';
import { LifecycleValue } from "../../common/enums/LifecycleValue";

/**
 * System behavior called when a mouse button is fired
 *
 * @param {Entity} entity The entity
 * @param args is argument object with event and value properties. Value set 0 | 1
 */

export const handleMouseButton: Behavior = (entity: Entity, args: { event: MouseEvent; value: BinaryType }): void => {
  // Get immutable reference to Input and check if the button is defined -- ignore undefined buttons
  const input = getMutableComponent(entity, Input);
  if (input.schema.mouseInputMap.buttons[args.event.button] === undefined)
    return;

  const mousePosition: [number, number] = [0, 0];
  mousePosition[0] = (args.event.clientX / window.innerWidth) * 2 - 1;
  mousePosition[1] = (args.event.clientY / window.innerHeight) * -2 + 1;

  // Set type to BUTTON (up/down discrete state) and value to up or down, as called by the DOM mouse events
  if (args.value === BinaryValue.ON) {
    // Set type to BUTTON and value to up or down
    input.data.set(input.schema.mouseInputMap.buttons[args.event.button], {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.STARTED
    });

    // TODO: this would not be set if none of buttons assigned
    // Set type to TWOD (two dimensional) and value with x: -1, 1 and y: -1, 1
    input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition], {
      type: InputType.TWODIM,
      value: mousePosition,
      lifecycleState: LifecycleValue.STARTED
    });
  }
  else {
    // Removed mouse input data
    input.data.set(input.schema.mouseInputMap.buttons[args.event.button], {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.ENDED
    });
    input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition], {
      type: InputType.TWODIM,
      value: mousePosition,
      lifecycleState: LifecycleValue.ENDED
    });
    input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseClickDownTransformRotation], {
      type: InputType.TWODIM,
      value: mousePosition,
      lifecycleState: LifecycleValue.ENDED
    });
    // input.data.delete(input.schema.mouseInputMap.buttons[args.event.button]);
    // input.data.delete(input.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition]);
    // input.data.delete(input.schema.mouseInputMap.axes[MouseInput.MouseClickDownTransformRotation]);
  }
};
