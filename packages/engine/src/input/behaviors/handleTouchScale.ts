import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { InputType } from '../enums/InputType';
import { Input } from '../components/Input';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { MouseInput } from '../enums/MouseInput';
import { LifecycleValue } from '../../common/enums/LifecycleValue';
import { TouchInputs } from '../enums/TouchInputs';
import { normalizeMouseCoordinates } from '../../common/functions/normalizeMouseCoordinates';
import { DefaultInput } from '../../templates/shared/DefaultInput';
import { Vector2 } from 'three';

/**
 * System behavior called whenever the mouse pressed
 *
 * @param {Entity} entity The entity
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

export const handleTouchScale: Behavior = (entity: Entity, args: { event: TouchEvent }): void => {
  const input = getComponent(entity, Input);
  //   const value = args.event?.deltaY;


  // let s = 'Touch move.';
  // A list of contact points on a touch surface.
  if (args.event.targetTouches.length) {
    // s +=
    //   ' x: ' +
    //   Math.trunc(args.event.targetTouches[0].clientX) +
    //   ', y: ' +
    //   Math.trunc(args.event.targetTouches[0].clientY);
    //   const value = (args.event as any).scale;
    //   console.log(args)
    //   console.log(value)

    if (args.event.targetTouches.length == 2) {
      // if ((args.event as any).scale) {
      //   debugger;
      // }
      const normalizedPosition0 = normalizeMouseCoordinates(args.event.touches[0].clientX, args.event.touches[0].clientY, window.innerWidth, window.innerHeight);
      const normalizedPosition1 = normalizeMouseCoordinates(args.event.touches[1].clientX, args.event.touches[1].clientY, window.innerWidth, window.innerHeight);
      // const touchPosition0: [number, number] = [normalizedPosition0.x, normalizedPosition0.y];
      // const touchPosition1: [number, number] = [normalizedPosition1.x, normalizedPosition1.y];
      // const touchPositionsAvarageY : number = (touchPosition0[1] + touchPosition1[1]) / 2;      


      const touchPosition0 = new Vector2();
      if (normalizedPosition0) {
        touchPosition0.x = normalizedPosition0.x;
        touchPosition0.y = normalizedPosition0.y;
      }
      const touchPosition1 = new Vector2();
      if (normalizedPosition1) {
        touchPosition1.x = normalizedPosition1.x;
        touchPosition1.y = normalizedPosition1.y;
      }

      const savedPositionInput = DefaultInput.POINTER1_POSITION;
      const savedPositionInput1 = DefaultInput.POINTER2_POSITION;

      if (!savedPositionInput && !savedPositionInput1) {
        return;
      }

      const hasData0 = input.data.has(savedPositionInput);
      if (!hasData0) {
        input.data.set(savedPositionInput, {
          type: InputType.TWODIM,
          value: touchPosition0,
          lifecycleState: hasData0 ? LifecycleValue.CHANGED : LifecycleValue.STARTED
        });
      }
      const hasData1 = input.data.has(savedPositionInput1);
      if (!hasData1) {
        input.data.set(savedPositionInput1, {
          type: InputType.TWODIM,
          value: touchPosition1,
          lifecycleState: hasData1 ? LifecycleValue.CHANGED : LifecycleValue.STARTED
        });
      }

      const previousPositionValue = input.data.get(savedPositionInput)?.value;
      const previousPositionValue1 = input.data.get(savedPositionInput1)?.value;
      const scaleMappedInputKey = input.schema.touchInputMap?.axes[TouchInputs.Scale];
      // const value = (args.event as any).scale;
      // const oldValue = input.data.get(scaleMappedInputKey).value as number;

      console.log(previousPositionValue)
      console.log(previousPositionValue1)
      console.log(touchPosition0)
      console.log(touchPosition1)
      // console.log(oldValue)
      // console.log(hasData)
      // console.log(previousPositionValue)
      // console.log(input.data)
      // console.log(touchPosition0[1])

      // const touch1PositionsAvarageY : number = (touchPosition0[1] + touchPosition1[1]) / 2;
      // const touch1PositionsAvarageY : number = (touchPosition0[1] + touchPosition1[1]) / 2;

      const touchDistanceOnStart = touchPosition0.distanceTo(touchPosition1);

      // console.log(touchDistanceOnStart)

      // If mouse position not set, set it with lifecycle started
      if (!input.data.has(scaleMappedInputKey)) {
        input.data.set(scaleMappedInputKey, {
          type: InputType.TWODIM,
          value: touchDistanceOnStart * 100,
          lifecycleState: LifecycleValue.STARTED
        });
      } else {
        // If touch position set, check it's value
        const oldValue = input.data.get(scaleMappedInputKey).value as number;

        console.log(oldValue)
        console.log(touchDistanceOnStart)
        // If it's not the same, set it and update the lifecycle value to changed
        input.data.set(scaleMappedInputKey, {
          type: InputType.TWODIM,
          value: touchDistanceOnStart * 100,
          lifecycleState: LifecycleValue.CHANGED
        });
        console.log(oldValue)
        console.log(touchDistanceOnStart)
      }



      // if (scaleMappedInputKey) {

      //   if ((args.event as any).scale) {
      //     input.data.set(scaleMappedInputKey, {
      //       type: InputType.TWODIM,
      //       value: (args.event as any).scale,
      //       lifecycleState: LifecycleValue.CHANGED
      //     });
      //   }
      // }
    }

  }
  // console.log(s);

  // If mouse position not set, set it with lifecycle started


  //   if (!input.data.has(input.schema.mouseInputMap.axes[MouseInput.MouseScroll])) {
  //     input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseScroll], {
  //       type: InputType.ONEDIM,
  //       value: Math.sign(value),
  //       lifecycleState: LifecycleValue.STARTED
  //     });
  //   } else {
  //     // If mouse position set, check it's value
  //     const oldValue = input.data.get(input.schema.mouseInputMap.axes[MouseInput.MouseScroll]).value as number;

  //     // If it's not the same, set it and update the lifecycle value to changed
  //     input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseScroll], {
  //       type: InputType.ONEDIM,
  //       value: oldValue + Math.sign(value),
  //       lifecycleState: LifecycleValue.CHANGED
  //     });
  //   }
};
