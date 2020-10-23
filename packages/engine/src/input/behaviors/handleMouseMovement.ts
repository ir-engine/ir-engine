import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { InputType } from '../enums/InputType';
import { Input } from '../components/Input';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { MouseInput } from '../enums/MouseInput';
import { LifecycleValue } from '../../common/enums/LifecycleValue';
import { normalizeMouseCoordinates } from "../../common/functions/normalizeMouseCoordinates";
import { DefaultInput } from '../../templates/shared/DefaultInput';
import { Vector2, Vector3 } from 'three';
import { deltaMouseMovement } from '../../common/functions/deltaMouseMovement';

/**
 * Local reference to input component
 */
const mousePosition: [number, number] = [0, 0];
const mouseMovement: [number, number] = [0, 0];

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
  // console.log(args.event);
 
  // TODO: should movement be also normalized?
  const normalizedMovement = deltaMouseMovement(args.event.movementX, args.event.movementY, window.innerWidth, window.innerHeight);
  const mouseMovement: [number, number] = [ normalizedMovement.x, normalizedMovement.y ];
 
  const mappedPositionInput = input.schema.mouseInputMap.axes[MouseInput.MousePosition];
  const mappedMovementInput = input.schema.mouseInputMap.axes[MouseInput.MouseMovement];
  const mappedDragMovementInput = input.schema.mouseInputMap.axes[MouseInput.MouseClickDownMovement];

  // If mouse position not set, set it with lifecycle started
  if (mappedPositionInput) {
    if (!input.data.has(mappedPositionInput)) {
      input.data.set(mappedPositionInput, {
        type: InputType.TWODIM,
        value: mousePosition,
        lifecycleState: LifecycleValue.STARTED
      });
    } else {
      input.data.set(mappedPositionInput, {
        type: InputType.TWODIM,
        value: mousePosition,
        lifecycleState: LifecycleValue.CHANGED
      });
    }
  }

  if (mappedMovementInput) {
    if (!input.data.has(mappedMovementInput)) {
      input.data.set(mappedMovementInput, {
        type: InputType.TWODIM,
        value: mouseMovement,
        lifecycleState: LifecycleValue.STARTED
      });
    } else {
      input.data.set(mappedMovementInput, {
        type: InputType.TWODIM,
        value: mouseMovement,
        lifecycleState: LifecycleValue.CHANGED
      });
    }
  }

  // TODO: it looks like hack... MouseInput.MousePosition doesn't know that it is SCREENXY, and it could be anything ... same should be here
  const SCREENXY_START = input.data.get(DefaultInput.SCREENXY_START);
  if (SCREENXY_START && SCREENXY_START.lifecycleState !== LifecycleValue.ENDED) {
    // Set dragging movement delta
    if (mappedDragMovementInput) {
      if (!input.data.has(mappedDragMovementInput)) {
        input.data.set(mappedDragMovementInput, {
          type: InputType.TWODIM,
          value: mouseMovement,
          lifecycleState: LifecycleValue.STARTED
        });
      } else {
        input.data.set(mappedDragMovementInput, {
          type: InputType.TWODIM,
          value: mouseMovement,
          lifecycleState: LifecycleValue.CHANGED
        });
      }
    }
  }
};
