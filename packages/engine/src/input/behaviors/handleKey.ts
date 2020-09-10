import { BinaryValue } from '../../common/enums/BinaryValue';
import { BinaryType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { Input } from '../components/Input';
import { InputType } from '../enums/InputType';
/**
 * System behavior called when a keyboard key is pressed
 *
 * @param {Entity} entity The entity
 * @param args is argument object
 */

export function handleKey(entity: Entity, args: { event: KeyboardEvent; value: BinaryType; }): any {
  console.log("Handle key called");
  // Get immutable reference to Input and check if the button is defined -- ignore undefined keys
  const input = getComponent(entity, Input);
  if (input.schema.keyboardInputMap[args.event.key] === undefined)
    return;
  // If the key is in the map but it's in the same state as now, let's skip it (debounce)
  if (input.data.has(input.schema.keyboardInputMap[args.event.key]) &&
    input.data.get(input.schema.keyboardInputMap[args.event.key]).value === args.value) { return; }
  // Set type to BUTTON (up/down discrete state) and value to up or down, depending on what the value is set to
  if (args.value === BinaryValue.ON) {
    input.data.set(input.schema.keyboardInputMap[args.event.key], {
      type: InputType.BUTTON,
      value: args.value
    });
  }
  else {
    console.log("Removing key");
    input.data.delete(input.schema.keyboardInputMap[args.event.key]);
  }
}
