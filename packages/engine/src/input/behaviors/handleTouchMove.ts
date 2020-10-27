import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { TouchInputs } from "../enums/TouchInputs";
import { InputType } from "../enums/InputType";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../components/Input";
import { DefaultInput } from '../../templates/shared/DefaultInput';
import { normalizeMouseCoordinates } from '../../common/functions/normalizeMouseCoordinates';
import { BinaryValue } from '../../common/enums/BinaryValue';
import { deltaMouseMovement } from '../../common/functions/deltaMouseMovement';
import { deltaTouchMovement } from '../../common/functions/deltaTouchMovement';

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

  //console.log('handleTouchMove', touchPosition);
  //console.log(args.event);
  const mappedPositionInput = input.schema.touchInputMap?.axes[TouchInputs.Touch1Position];

  if (!mappedPositionInput) {
    return;
  }

  const hasData = input.data.has(mappedPositionInput);
  console.log('handleTouchMove', args.event.type, hasData, LifecycleValue[hasData? LifecycleValue.CHANGED : LifecycleValue.STARTED]);

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
  if (!movementStart && input.prevData.has(mappedPositionInput)) {
    const touchPositionPrevInput = input.prevData.get(mappedPositionInput);
    touchMovement[0] = touchPosition[0] - touchPositionPrevInput.value[0];
    touchMovement[1] = touchPosition[1] - touchPositionPrevInput.value[1];
    // console.log(touchMovement);
    console.log('prev input', touchPositionPrevInput.value);
  }

  input.data.set(mappedMovementInput, {
    type: InputType.TWODIM,
    value: touchMovement,
    lifecycleState: input.data.has(mappedMovementInput)? LifecycleValue.CHANGED : LifecycleValue.STARTED
  });
};
