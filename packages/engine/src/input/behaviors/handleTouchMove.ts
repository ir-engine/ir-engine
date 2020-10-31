import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { TouchInputs } from "../enums/TouchInputs";
import { InputType } from "../enums/InputType";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../components/Input";
import { normalizeMouseCoordinates } from '../../common/functions/normalizeMouseCoordinates';

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
  const mappedPositionInput = input.schema.touchInputMap?.axes[TouchInputs.Touch1Position];

  if (!mappedPositionInput) {
    return;
  }

  const hasData = input.data.has(mappedPositionInput);
  const previousPositionValue = input.data.get(mappedPositionInput)?.value;

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
    // const touchPositionPrevInput = input.prevData.get(mappedPositionInput);
    // touchMovement[0] = touchPosition[0] - touchPositionPrevInput.value[0];
    // touchMovement[1] = touchPosition[1] - touchPositionPrevInput.value[1];
    touchMovement[0] = touchPosition[0] - previousPositionValue[0];
    touchMovement[1] = touchPosition[1] - previousPositionValue[1];
  }

  input.data.set(mappedMovementInput, {
    type: InputType.TWODIM,
    value: touchMovement,
    lifecycleState: input.data.has(mappedMovementInput)? LifecycleValue.CHANGED : LifecycleValue.STARTED
  });
};
