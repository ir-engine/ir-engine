import { BinaryValue } from '../../common/enums/BinaryValue';
import { Behavior } from '../../common/interfaces/Behavior';
import { BinaryType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { TouchInputs } from "../enums/TouchInputs";
import { InputType } from "../enums/InputType";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { Vector2 } from "three";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../components/Input";
import { DefaultInput } from '../../templates/shared/DefaultInput';

/**
 * Handle Touch
 * 
 * @param {Entity} entity The entity
 * @param args is argument object
 */
export const handleTouch: Behavior = (entity: Entity, { event, value }: { event: TouchEvent; value: BinaryType }): void => {
  const input = getComponent(entity, Input);
  // If the touch is ON
  if (value === BinaryValue.ON) {
    //console.log('Touch start.', event);
    // A list of contact points on a touch surface.
    if (event.targetTouches.length) {
      // s +=
      //   ' x: ' +
      //   Math.trunc(args.event.targetTouches[0].clientX) +
      //   ', y: ' +
      //   Math.trunc(args.event.targetTouches[0].clientY);
      const inputKeys = [ TouchInputs.Touch ];
     
      inputKeys.forEach((inputKey, touchIndex) => {
        if (!event.targetTouches[touchIndex]) {
          return;
        }
        const mappedInputKey = input.schema.touchInputMap?.buttons[inputKey];
        
        if (!mappedInputKey) {
          return;
        }

        const inputValue = BinaryValue.ON;
        if (!input.data.has(mappedInputKey)) {
          input.data.set(mappedInputKey, {
            type: InputType.BUTTON,
            value: inputValue,
            lifecycleState: LifecycleValue.STARTED
          });
          
        } else {
          // If mouse position set, check it's value
          const oldValue = input.data.get(mappedInputKey).value as number;

          // If it's not the same, set it and update the lifecycle value to changed
          input.data.set(mappedInputKey, {
            type: InputType.BUTTON,
            value: inputValue,
            lifecycleState: LifecycleValue.CHANGED
          });
        }
      });
    }
    
  } else {
    const mappedInputKey = input.schema.touchInputMap?.buttons[TouchInputs.Touch];

    if (!mappedInputKey) {
      return;
    }
    input.data.set(mappedInputKey, {
      type: InputType.BUTTON,
      value: BinaryValue.OFF,
      lifecycleState: LifecycleValue.ENDED
    });
  }


};

