import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { InputType } from '../enums/InputType';
import { Input } from '../components/Input';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { LifecycleValue } from '../../common/enums/LifecycleValue';
import { Thumbsticks } from '../../common/enums/Thumbsticks';
import { BinaryType } from "../../common/types/NumericalTypes";
import { BinaryValue } from "../../common/enums/BinaryValue";

/**
 * System behavior called whenever the mouse pressed
 *
 * @param {Entity} entity The entity
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

export const handleOnScreenGamepadMovement: Behavior = (entity: Entity, args: { event: CustomEvent; }): void => {
  // TODO: move this types to types and interfaces
  const { stick, value }:{ stick:Thumbsticks, value:{x:number,y:number} } = args.event.detail;

  const input = getComponent(entity, Input);
  const mappedAxes = input.schema.gamepadInputMap?.axes;
  const mappedKey = mappedAxes? mappedAxes[stick] : null;

  console.log('stick', stick, mappedKey, mappedAxes);

  if (!mappedKey) {
    return;
  }

  const stickPosition: [number, number] = [
    value.x,
    value.y
  ];

  // If position not set, set it with lifecycle started
  if (!input.data.has(mappedKey)) {
    input.data.set(mappedKey, {
      type: InputType.TWODIM,
      value: stickPosition,
      lifecycleState: LifecycleValue.STARTED
    });
  } else {
    // If position set, check it's value
    const oldStickPosition = input.data.get(mappedKey);
    // If it's not the same, set it and update the lifecycle value to changed
    if (JSON.stringify(oldStickPosition) !== JSON.stringify(stickPosition)) {
      console.log('---changed');
      // Set type to TWODIM (two-dimensional axis) and value to a normalized -1, 1 on X and Y
      input.data.set(mappedKey, {
        type: InputType.TWODIM,
        value: stickPosition,
        lifecycleState: LifecycleValue.CHANGED
      });
    } else {
      console.log('---not changed');
      // Otherwise, remove it
      //input.data.delete(mappedKey)
    }
  }
};

/**
 * System behavior called when a keyboard key is pressed
 *
 * @param {Entity} entity The entity
 * @param args is argument object
 */

export function handleOnScreenGamepadButton(entity: Entity, args: { event: CustomEvent; value: BinaryType; }): any {
  console.log("Handle handleOnScreenGamepadButton called", args.event.detail, args.value);

  // input.schema.gamepadInputMap.buttons[]

  // Get immutable reference to Input and check if the button is defined -- ignore undefined keys
  const input = getComponent(entity, Input);
  if (input.schema.gamepadInputMap.buttons[args.event.detail.button] === undefined)
    return;
  const mappedKey = input.schema.gamepadInputMap.buttons[args.event.detail.button];

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
    input.data.set(mappedKey, {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.STARTED
    });
  }
  else {
    input.data.set(mappedKey, {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.ENDED
    });
  }
}