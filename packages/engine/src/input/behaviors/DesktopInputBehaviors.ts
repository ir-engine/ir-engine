import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { InputType } from '../enums/InputType';
import { Input } from '../components/Input';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { MouseInput } from '../enums/MouseInput';

/**
 * Local reference to input component
 */
export let input: Input;
const mousePosition: [number, number] = [0, 0];
const mouseMovement: [number, number] = [0, 0];

/**
 * System behavior called whenever the mouse pressed
 *
 * @param {Entity} entity The entity
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */
export const handleMouseMovement: Behavior = (entity: Entity, args: { event: MouseEvent }): void => {
  input = getComponent(entity, Input);
  mousePosition[0] = (args.event.clientX / window.innerWidth) * 2 - 1;
  mousePosition[1] = (args.event.clientY / window.innerHeight) * -2 + 1;

  const axis = input.schema.mouseInputMap.axes[MouseInput.MousePosition]
  
  // If input data doesn't have this call behaviors with lifecycle value started
  // Otherwise, if input data has this...
  // If it has changed, call changed
  // If hasn't changed, call unchanged

  // Set type to TWODIM (two-dimensional axis) and value to a normalized -1, 1 on X and Y
  input.data.set(input.schema.mouseInputMap.axes[MouseInput.MousePosition], {
    type: InputType.TWODIM,
    value: mousePosition
  });

  mouseMovement[0] = args.event.movementX;
  mouseMovement[1] = args.event.movementY;

  input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseMovement], {
    type: InputType.TWODIM,
    value: mouseMovement
  });







// If lifecycle hasn't been set, init it
if (value.lifecycleState === undefined) value.lifecycleState = LifecycleValue.STARTED
if(value.lifecycleState === LifecycleValue.STARTED) {
  // Set the value to continued to debounce
  input.schema.inputAxisBehaviors[key].started?.forEach(element =>
    element.behavior(entity, element.args, delta)
  );
  input.data.set(key, {
    type: value.type,
    value: value.value as BinaryType,
    lifecycleState: LifecycleValue.CHANGED
  });
}
// Evaluate if the number is the same as last time, send the delta 
else {
  // If the value is different from last frame, update it
    if(input.data.has(key) && JSON.stringify(value.value) !== JSON.stringify(input.data.get(key).value)) {
      input.data.set(key, {
        type: value.type,
        value: value.value as BinaryType,
        lifecycleState: LifecycleValue.CHANGED
      });
      input.schema.inputAxisBehaviors[key].changed?.forEach(element =>
        element.behavior(entity, element.args, delta)
      );
    }
    // Otherwise, remove it from the frame
    else {
        input.data.set(key, {
          type: value.type,
          value: value.value as BinaryType,
          lifecycleState: LifecycleValue.UNCHANGED
        });
        input.schema.inputAxisBehaviors[key].unchanged?.forEach(element =>
          element.behavior(entity, element.args, delta)
        );
    }
}
}




};


