import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { InputType } from "../enums/InputType";
import { Input } from "../components/Input";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { MouseInput } from "../enums/MouseInput";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { normalizeMouseCoordinates } from "../../common/functions/normalizeMouseCoordinates";
import { DefaultInput } from "../../templates/shared/DefaultInput";
import { BinaryValue } from "../../common/enums/BinaryValue";

/**
 * System behavior called whenever the mouse pressed
 *
 * @param {Entity} entity The entity
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

export const handleMouseMovement: Behavior = (entity: Entity, args: { event: MouseEvent }): void => {
  const input = getComponent(entity, Input);
  const normalizedPosition = normalizeMouseCoordinates(args.event.clientX, args.event.clientY, window.innerWidth, window.innerHeight);
  const mousePosition: [number, number] = [ normalizedPosition.x, normalizedPosition.y ];
 
  const mappedPositionInput = input.schema.mouseInputMap.axes[MouseInput.MousePosition];
  const mappedMovementInput = input.schema.mouseInputMap.axes[MouseInput.MouseMovement];
  const mappedDragMovementInput = input.schema.mouseInputMap.axes[MouseInput.MouseClickDownMovement];

  const previousPosition = (input.prevData.has(mappedPositionInput)? input.prevData.get(mappedPositionInput) : input.data.get(mappedPositionInput))?.value;

  // If mouse position not set, set it with lifecycle started
  if (mappedPositionInput) {
    input.data.set(mappedPositionInput, {
      type: InputType.TWODIM,
      value: mousePosition,
      lifecycleState: input.data.has(mappedPositionInput)? LifecycleValue.CHANGED : LifecycleValue.STARTED
    });
  }
  
  const mouseMovement: [number, number] = [0, 0];
  if (previousPosition) {
    mouseMovement[0] = mousePosition[0] - previousPosition[0];
    mouseMovement[1] = mousePosition[1] - previousPosition[1];
  }

  if (mappedMovementInput) {
    input.data.set(mappedMovementInput, {
      type: InputType.TWODIM,
      value: mouseMovement,
      lifecycleState: input.data.has(mappedMovementInput)? LifecycleValue.CHANGED : LifecycleValue.STARTED
    });
  }

  // TODO: it looks like hack... MouseInput.MousePosition doesn't know that it is SCREENXY, and it could be anything ... same should be here
  const SCREENXY_START = input.data.get(DefaultInput.SCREENXY_START);
  if (SCREENXY_START && SCREENXY_START.lifecycleState !== LifecycleValue.ENDED) {
    
    // Set dragging movement delta
    if (mappedDragMovementInput) {
      input.data.set(mappedDragMovementInput, {
        type: InputType.TWODIM,
        value: mouseMovement,
        lifecycleState: input.data.has(mappedDragMovementInput) ? LifecycleValue.CHANGED : LifecycleValue.STARTED
      });
    }
}
};
