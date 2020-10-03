import { BinaryValue } from '../../common/enums/BinaryValue';
import { Behavior } from '../../common/interfaces/Behavior';
import { BinaryType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { TouchInputs } from "../enums/TouchInputs";
import { MouseInput } from "../enums/MouseInput";
import { InputType } from "../enums/InputType";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { Vector2 } from "three";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../components/Input";

/**
 * Handle Touch
 * 
 * @param {Entity} entity The entity
 * @param args is argument object
 */
export const handleTouch: Behavior = (entity: Entity, { event, value }: { event: TouchEvent, value: BinaryType }): void => {
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
      const inputKeys = [ TouchInputs.Touch1, TouchInputs.Touch2 ];
      inputKeys.forEach((inputKey, touchIndex) => {
        if (!event.targetTouches[touchIndex]) {
          return;
        }
        const mappedInputKey = input.schema.touchInputMap?.axes[inputKey];

        if (!mappedInputKey) {
          return;
        }

        const inputValue = new Vector2(event.targetTouches[touchIndex].clientX, event.targetTouches[touchIndex].clientY);
        if (!input.data.has(mappedInputKey)) {
          input.data.set(mappedInputKey, {
            type: InputType.TWODIM,
            value: inputValue,
            lifecycleState: LifecycleValue.STARTED
          });
        } else {
          // If mouse position set, check it's value
          const oldValue = input.data.get(mappedInputKey).value as number;

          // If it's not the same, set it and update the lifecycle value to changed
          input.data.set(mappedInputKey, {
            type: InputType.TWODIM,
            value: inputValue,
            lifecycleState: LifecycleValue.CHANGED
          });
        }
      });
    }
    //console.log(s);
  } else {
    // console.log('Touch end.');
    // TODO: set ENDED lifecycleState to all mapped inputs?
  }


};

/**
 * Touch move
 * 
 * @param {Entity} entity The entity
 * @param args is argument object
 */
export const handleTouchMove: Behavior = (entity: Entity, args: { event: TouchEvent }): void => {
  const input = getComponent(entity, Input);

  let s = 'Touch move.';
  // A list of contact points on a touch surface.
  if (args.event.targetTouches.length) {
    s +=
      ' x: ' +
      Math.trunc(args.event.targetTouches[0].clientX) +
      ', y: ' +
      Math.trunc(args.event.targetTouches[0].clientY);

    if (args.event.targetTouches.length == 2) {
      if ((args.event as any).scale) {
        debugger;
      }


      const scaleMappedInputKey = input.schema.touchInputMap?.axes[TouchInputs.Scale];
      if (scaleMappedInputKey) {

        if ((args.event as any).scale) {
          input.data.set(scaleMappedInputKey, {
            type: InputType.ONEDIM,
            value: (args.event as any).scale,
            lifecycleState: LifecycleValue.CHANGED
          });
        }
      }
    }

  }
  console.log(s);
};
