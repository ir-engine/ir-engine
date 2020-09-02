import { BinaryValue } from '../../common/enums/BinaryValue';
import { Behavior } from '../../common/interfaces/Behavior';
import { BinaryType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { InputType } from '../enums/InputType';
import { Input } from '../components/Input';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { MouseInput } from '../enums/MouseInput';

/**
 * Local reference to input component
 */
let input: Input;
const value: [number, number] = [0, 0];

/**
 * System behavior called whenever the mouse pressed
 * 
 * @param {Entity} entity The entity
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */
export const handleMouseMovement: Behavior = (entity: Entity, args: { event: MouseEvent }): void => {
  input = getComponent(entity, Input);
  value[0] = (args.event.clientX / window.innerWidth) * 2 - 1;
  value[1] = (args.event.clientY / window.innerHeight) * -2 + 1;
  // Set type to TWOD (two-dimensional axis) and value to a normalized -1, 1 on X and Y
  input.data.set(input.schema.mouseInputMap.axes[MouseInput.MousePosition], {
    type: InputType.TWODIM,
    value: value
  });
};

/**
 * System behavior called when a mouse button is fired
 * 
 * @param {Entity} entity The entity
 * @param args is argument object with event and value properties. Value set 0 | 1
 */
export const handleMouseButton: Behavior = (entity: Entity, args: { event: MouseEvent, value: BinaryType }): void => {
  // Get immutable reference to Input and check if the button is defined -- ignore undefined buttons
  input = getMutableComponent(entity, Input);
  if (input.schema.mouseInputMap.buttons[args.event.button] === undefined) return;
  // Set type to BUTTON (up/down discrete state) and value to up or down, as called by the DOM mouse events
  if (args.value === BinaryValue.ON) {
    // Set type to BUTTON and value to up or down
    input.data.set(input.schema.mouseInputMap.buttons[args.event.button], {
      type: InputType.BUTTON,
      value: args.value
    });
    const mousePosition: [number, number] = [0, 0];
    mousePosition[0] = (args.event.clientX / window.innerWidth) * 2 - 1;
    mousePosition[1] = (args.event.clientY / window.innerHeight) * -2 + 1;
    // Set type to TWOD (two dimensional) and value with x: -1, 1 and y: -1, 1
    input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition], {
      type: InputType.TWODIM,
      value: mousePosition
    });
  } else {
    // Removed mouse input data
    input.data.delete(input.schema.mouseInputMap.buttons[args.event.button]);
    input.data.delete(input.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition]);
    input.data.delete(input.schema.mouseInputMap.axes[MouseInput.MouseClickDownTransformRotation]);
  }
};

/**
 * System behavior called when a keyboard key is pressed
 * 
 * @param {Entity} entity The entity
 * @param args is argument object 
 */
export function handleKey(entity: Entity, args: { event: KeyboardEvent, value: BinaryType }): any {
  // Get immutable reference to Input and check if the button is defined -- ignore undefined keys
  input = getComponent(entity, Input);
  if (input.schema.keyboardInputMap[args.event.key] === undefined) return;
  // If the key is in the map but it's in the same state as now, let's skip it (debounce)
  if (
    input.data.has(input.schema.keyboardInputMap[args.event.key]) &&
    input.data.get(input.schema.keyboardInputMap[args.event.key]).value === args.value
  ) { return; }
  // Set type to BUTTON (up/down discrete state) and value to up or down, depending on what the value is set to
  if (args.value === BinaryValue.ON) {
    input.data.set(input.schema.keyboardInputMap[args.event.key], {
      type: InputType.BUTTON,
      value: args.value
    });
  } else {
    // Removed buttons property from mouseInputMap and set 
    input.data.delete(input.schema.mouseInputMap.buttons[args.event.key]);
    input.data.set(input.schema.keyboardInputMap[args.event.key], {
      type: InputType.BUTTON,
      value: args.value
    });
  }
}
