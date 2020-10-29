import { BinaryValue } from '../../common/enums/BinaryValue';
import { BinaryType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { Input } from '../components/Input';
import { InputType } from '../enums/InputType';
import { LifecycleValue } from "../../common/enums/LifecycleValue";

/**
 * System behavior called when a keyboard key is pressed
 *
 * @param {Entity} entity The entity
 * @param args is argument object
 */

export function handleKey(entity: Entity, args: { event: KeyboardEvent; value: BinaryType }): any {
  console.log("Handle key called");
  // Get immutable reference to Input and check if the button is defined -- ignore undefined keys
  const input = getComponent(entity, Input);
  if (input.schema.keyboardInputMap[args.event.key?.toLowerCase()] === undefined)
    return;
  const mappedKey = input.schema.keyboardInputMap[args.event.key.toLowerCase()];

  if (args.value === BinaryValue.ON) {
    // If the key is in the map but it's in the same state as now, let's skip it (debounce)
    if (input.data.has(mappedKey) &&
      input.data.get(mappedKey).value === args.value) {
      if (input.data.get(mappedKey).lifecycleState !== LifecycleValue.CONTINUED) {
        input.data.set(mappedKey, {
          type: InputType.BUTTON,
          value: args.value,
          lifecycleState: LifecycleValue.CONTINUED
        });
      }
      return;
    }
    // Set type to BUTTON (up/down discrete state) and value to up or down, depending on what the value is set to
    input.data.set(input.schema.keyboardInputMap[args.event.key.toLowerCase()], {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.STARTED
    });
  }
  else {
    input.data.set(input.schema.keyboardInputMap[args.event.key.toLowerCase()], {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.ENDED
    });
  }
}
