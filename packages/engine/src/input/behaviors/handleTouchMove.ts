import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { TouchInputs } from "../enums/TouchInputs";
import { InputType } from "../enums/InputType";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../components/Input";
import { normalizeMouseCoordinates } from '../../common/functions/normalizeMouseCoordinates';
import { DefaultInput } from "../../templates/shared/DefaultInput";
import { Vector2 } from 'three';

/**
 * Touch move
 * 
 * @param {Entity} entity The entity
 * @param args is argument object
 */
export const handleTouchMove: Behavior = (entity: Entity, args: { event: TouchEvent }): void => {
  const input = getComponent(entity, Input);
  const normalizedPosition = normalizeMouseCoordinates(args.event.touches[0].clientX, args.event.touches[0].clientY, window.innerWidth, window.innerHeight);
  const touchPosition: [number, number] = [normalizedPosition.x, normalizedPosition.y];

  console.log(args.event.targetTouches.length);
  console.log(args.event.touches.length);

  // Store raw pointer positions to use in other behaviours, like gesture detection
  input.data.set(DefaultInput.POINTER1_POSITION, {
    type: InputType.TWODIM,
    value: touchPosition,
    lifecycleState: LifecycleValue.CHANGED // TODO: should we handle lifecycle here?
  });

  if (args.event.touches.length >= 2) {
    const normalizedPosition2 = normalizeMouseCoordinates(args.event.touches[1].clientX, args.event.touches[1].clientY, window.innerWidth, window.innerHeight);

    input.data.set(DefaultInput.POINTER2_POSITION, {
      type: InputType.TWODIM,
      value: [normalizedPosition2.x, normalizedPosition2.y],
      lifecycleState: LifecycleValue.CHANGED // TODO: should we handle lifecycle here?
    });
  }if (args.event.touches.length == 1){
  const mappedPositionInput = input.schema.touchInputMap?.axes[TouchInputs.Touch1Position];
  if (!mappedPositionInput) {
    return;
  }

  const hasData = input.data.has(mappedPositionInput);
  const previousPositionValue = (input.prevData.has(mappedPositionInput)? input.prevData.get(mappedPositionInput) : input.data.get(mappedPositionInput))?.value;

  input.data.set(mappedPositionInput, {
    type: InputType.TWODIM,
    value: touchPosition,
    lifecycleState: hasData? LifecycleValue.CHANGED : LifecycleValue.STARTED
  });

  const movementStart = args.event.type === 'touchstart';
  const mappedMovementInput = input.schema.touchInputMap?.axes[TouchInputs.Touch1Movement];
  if (!mappedMovementInput) {
    return;
  }

  const touchMovement: [number, number] = [ 0,0 ];
  if (!movementStart && previousPositionValue) {
    touchMovement[0] = touchPosition[0] - previousPositionValue[0];
    touchMovement[1] = touchPosition[1] - previousPositionValue[1];
  }

  input.data.set(mappedMovementInput, {
    type: InputType.TWODIM,
    value: touchMovement,
    lifecycleState: input.data.has(mappedMovementInput)? LifecycleValue.CHANGED : LifecycleValue.STARTED
  });

  } else if (args.event.touches.length >= 2) {
  const lastTouchPosition1Array = input.prevData.get(DefaultInput.POINTER1_POSITION)?.value;
  const lastTouchPosition2Array = input.prevData.get(DefaultInput.POINTER2_POSITION)?.value;
  if (args.event.type === 'touchstart' || !lastTouchPosition1Array || !lastTouchPosition2Array) {
    // skip if it's just start of gesture or there are no previous data yet
    return;
  }

  if (!input.data.has(DefaultInput.POINTER1_POSITION) || !input.data.has(DefaultInput.POINTER2_POSITION)) {
    console.warn('handleTouchScale requires POINTER1_POSITION and POINTER2_POSITION to be set and updated.');
    return;
  }

  const currentTouchPosition1 = new Vector2().fromArray(input.data.get(DefaultInput.POINTER1_POSITION).value as number[]);
  const currentTouchPosition2 = new Vector2().fromArray(input.data.get(DefaultInput.POINTER2_POSITION).value as number[]);

  const lastTouchPosition1 = new Vector2().fromArray(lastTouchPosition1Array as number[]);
  const lastTouchPosition2 = new Vector2().fromArray(lastTouchPosition2Array as number[]);

  const scaleMappedInputKey = input.schema.touchInputMap?.axes[TouchInputs.Scale];

  // console.log(lastTouchPosition1);
  // console.log(lastTouchPosition2);
  // console.log(currentTouchPosition1);
  // console.log(currentTouchPosition2);

  const currentDistance = currentTouchPosition1.distanceTo(currentTouchPosition2);
  const lastDistance = lastTouchPosition1.distanceTo(lastTouchPosition2);

  const touchScaleValue =   (lastDistance  - currentDistance) ;

  const signVal = Math.sign(touchScaleValue);

  

  // console.log(currentDistance);
  // console.log(lastDistance);
  console.log(touchScaleValue);
  console.log(signVal);
  // console.log(currentTouchPosition2);

  // If mouse position not set, set it with lifecycle started
  // input.data.set(scaleMappedInputKey, {
  //   type: InputType.TWODIM,
  //   value: touchScaleValue * 100, // TODO: remove 100 multiplication after mouse scroll will be normalized (or divided by 100)
  //   lifecycleState: input.data.has(scaleMappedInputKey)? LifecycleValue.CHANGED : LifecycleValue.STARTED
  // });
  // input.data.set(scaleMappedInputKey, {
  //   type: InputType.TWODIM,
  //   value: Math.sign(touchScaleValue) , // TODO: remove 100 multiplication after mouse scroll will be normalized (or divided by 100)
  //   lifecycleState:LifecycleValue.CHANGED
  // });

  // If mouse position not set, set it with lifecycle started
  if (!input.data.has(scaleMappedInputKey)) {
    input.data.set(scaleMappedInputKey, {
      type: InputType.ONEDIM,
      value:signVal ,
      lifecycleState: LifecycleValue.STARTED
    });
  } else {
    // If mouse position set, check it's value
    const oldValue = input.data.get(scaleMappedInputKey).value as number;

    // If it's not the same, set it and update the lifecycle value to changed
    input.data.set(scaleMappedInputKey, {
      type: InputType.ONEDIM,
      value: oldValue + signVal,
      lifecycleState: LifecycleValue.CHANGED
    });
  }
}
};
