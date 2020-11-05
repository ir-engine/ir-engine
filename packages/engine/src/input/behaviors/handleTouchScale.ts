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


  if (args.event.targetTouches.length == 2) {

    const normalizedPosition1 = normalizeMouseCoordinates(args.event.touches[0].clientX, args.event.touches[0].clientY, window.innerWidth, window.innerHeight);
    const currentTouchPosition1: [number, number] = [normalizedPosition1.x, normalizedPosition1.y];
    const normalizedPosition2 = normalizeMouseCoordinates(args.event.touches[1].clientX, args.event.touches[1].clientY, window.innerWidth, window.innerHeight);
    const currentTouchPosition2: [number, number] = [normalizedPosition2.x, normalizedPosition2.y];
   

    const defaultTouchPosition1 = input.data.get(DefaultInput.POINTER1_POSITION)?.value;
    const defaultTouchPosition2 = input.data.get(DefaultInput.POINTER2_POSITION)?.value;

    // console.log(defaultTouchPosition1)
    // console.log(defaultTouchPosition2)

    const updateTouchPosition1 = new Vector2();
    if (currentTouchPosition1) {
      updateTouchPosition1.x = currentTouchPosition1[0];
      updateTouchPosition1.y = currentTouchPosition1[1];
    }

    const updateTouchPosition2 = new Vector2();
    if (currentTouchPosition2) {
      updateTouchPosition2.x = currentTouchPosition2[0];
      updateTouchPosition2.y = currentTouchPosition2[1];
    }
   
    const touchPosition0 = new Vector2();
    if (Array.isArray(defaultTouchPosition1)) {
      touchPosition0.fromArray(defaultTouchPosition1);
    }
    const touchPosition1 = new Vector2();
    if (Array.isArray(defaultTouchPosition2)) {
      touchPosition1.fromArray(defaultTouchPosition2);
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

    // const previousPositionValue = input.data.get(savedPositionInput)?.value;
    // const previousPositionValue1 = input.data.get(savedPositionInput1)?.value;
    const scaleMappedInputKey = input.schema.touchInputMap?.axes[TouchInputs.Scale];


    console.log(defaultTouchPosition1)
    console.log(defaultTouchPosition2)
    console.log(touchPosition0)
    console.log(touchPosition1)

    const touchDistanceOnStart = touchPosition0.distanceTo(touchPosition1);
    const touchDistanceUpdate = updateTouchPosition1.distanceTo(updateTouchPosition2);

    const touchScaleValue = touchDistanceOnStart - touchDistanceUpdate;



    // console.log(touchDistanceOnStart)

    // If mouse position not set, set it with lifecycle started
    if (!input.data.has(scaleMappedInputKey)) {
      input.data.set(scaleMappedInputKey, {
        type: InputType.TWODIM,
        value: touchScaleValue * 100,
        lifecycleState: LifecycleValue.STARTED
      });
    } else {
      // If touch position set, check it's value
      // const oldValue = input.data.get(scaleMappedInputKey).value as number;

      // If it's not the same, set it and update the lifecycle value to changed
      input.data.set(scaleMappedInputKey, {
        type: InputType.TWODIM,
        value: touchScaleValue * 100,
        lifecycleState: LifecycleValue.CHANGED
      });
      
  }
}