import { Vector2 } from "three";
import { BinaryValue } from "../../common/enums/BinaryValue";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { Thumbsticks } from '../../common/enums/Thumbsticks';
import { isClient } from "../../common/functions/isClient";
import { Behavior } from '../../common/interfaces/Behavior';
import { BinaryType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { handleGamepadConnected, handleGamepadDisconnected } from "../behaviors/GamepadInputBehaviors";
import { Input } from '../components/Input';
import { BaseInput } from "../enums/BaseInput";
import { InputType } from '../enums/InputType';
import { MouseInput } from '../enums/MouseInput';
import { TouchInputs } from "../enums/TouchInputs";
import { InputSchema } from "../interfaces/InputSchema";

const touchSensitive = 2;
let prevTouchPosition: [number, number] = [0, 0];
let lastTap = Date.now();
const tapLength = 200; // 100ms between doubletaps


/**
 * Touch move
 * 
 * @param {Entity} entity The entity
 * @param args is argument object
 */

const handleTouchMove: Behavior = (entity: Entity, args: { event: TouchEvent }): void => {
  const input = getComponent(entity, Input);
  const normalizedPosition = normalizeMouseCoordinates(args.event.touches[0].clientX, args.event.touches[0].clientY, window.innerWidth, window.innerHeight);
  const touchPosition: [number, number] = [normalizedPosition.x, normalizedPosition.y];

  if (args.event.touches.length == 1) {

    input.data.set(BaseInput.POINTER1_POSITION, {
      type: InputType.TWODIM,
      value: touchPosition,
      lifecycleState: LifecycleValue.CHANGED
    });
    
    const mappedPositionInput = input.schema.touchInputMap?.axes[TouchInputs.Touch1Position];
    if (!mappedPositionInput) {
      return;
    }
    const hasData = input.data.has(mappedPositionInput);

    input.data.set(mappedPositionInput, {
      type: InputType.TWODIM,
      value: touchPosition,
      lifecycleState: hasData ? LifecycleValue.CHANGED : LifecycleValue.STARTED
    });

    const movementStart = args.event.type === 'touchstart';
    const mappedMovementInput = input.schema.touchInputMap?.axes[TouchInputs.Touch1Movement];
    if (!mappedMovementInput) {
      return;
    }

    const touchMovement: [number, number] = [0, 0];
    if (!movementStart && prevTouchPosition) {
      touchMovement[0] = (touchPosition[0] - prevTouchPosition[0]) * touchSensitive;
      touchMovement[1] = (touchPosition[1] - prevTouchPosition[1]) * touchSensitive;
    }

    prevTouchPosition = touchPosition;

    input.data.set(mappedMovementInput, {
      type: InputType.TWODIM,
      value: touchMovement,
      lifecycleState: input.data.has(mappedMovementInput) ? LifecycleValue.CHANGED : LifecycleValue.STARTED
    });

  } else if (args.event.touches.length >= 2) {

    const normalizedPosition2 = normalizeMouseCoordinates(args.event.touches[1].clientX, args.event.touches[1].clientY, window.innerWidth, window.innerHeight);
    const touchPosition2: [number, number] = [normalizedPosition2.x, normalizedPosition2.y];

    input.data.set(BaseInput.POINTER1_POSITION, {
      type: InputType.TWODIM,
      value: touchPosition,
      lifecycleState: LifecycleValue.CHANGED
    });
    
    input.data.set(BaseInput.POINTER2_POSITION, {
      type: InputType.TWODIM,
      value: touchPosition2,
      lifecycleState: LifecycleValue.CHANGED
    });

    const lastTouchPosition1Array = input.prevData.get(BaseInput.POINTER1_POSITION)?.value;
    const lastTouchPosition2Array = input.prevData.get(BaseInput.POINTER2_POSITION)?.value;
    if (args.event.type === 'touchstart' || !lastTouchPosition1Array || !lastTouchPosition2Array) {
      // skip if it's just start of gesture or there are no previous data yet
      return;
    }

    if (!input.data.has(BaseInput.POINTER1_POSITION) || !input.data.has(BaseInput.POINTER2_POSITION)) {
      console.warn('handleTouchScale requires POINTER1_POSITION and POINTER2_POSITION to be set and updated.');
      return;
    }

    const currentTouchPosition1 = new Vector2().fromArray(input.data.get(BaseInput.POINTER1_POSITION).value as number[]);
    const currentTouchPosition2 = new Vector2().fromArray(input.data.get(BaseInput.POINTER2_POSITION).value as number[]);

    const lastTouchPosition1 = new Vector2().fromArray(lastTouchPosition1Array as number[]);
    const lastTouchPosition2 = new Vector2().fromArray(lastTouchPosition2Array as number[]);

    const scaleMappedInputKey = input.schema.touchInputMap?.axes[TouchInputs.Scale];

    const currentDistance = currentTouchPosition1.distanceTo(currentTouchPosition2);
    const lastDistance = lastTouchPosition1.distanceTo(lastTouchPosition2);

    const touchScaleValue = (lastDistance - currentDistance) * 0.01;
    const signVal = Math.sign(touchScaleValue);
    if (!input.data.has(scaleMappedInputKey)) {
      input.data.set(scaleMappedInputKey, {
        type: InputType.ONEDIM,
        value: signVal,
        lifecycleState: LifecycleValue.STARTED
      });
    } else {
      const oldValue = input.data.get(scaleMappedInputKey).value as number;
      input.data.set(scaleMappedInputKey, {
        type: InputType.ONEDIM,
        value: oldValue + signVal,
        lifecycleState: LifecycleValue.CHANGED
      });
    }
  }
};

/**
 * Handle Touch
 * 
 * @param {Entity} entity The entity
 * @param args is argument object
 */
const handleTouch: Behavior = (entity: Entity, { event, value }: { event: TouchEvent; value: BinaryType }): void => {
  const input = getComponent(entity, Input);
  if (event.targetTouches.length) {
    const mappedInputKey = input.schema.touchInputMap?.buttons[TouchInputs.Touch];
    if (!mappedInputKey) {
      return;
    }
    if (value === BinaryValue.ON) {

      if(event.targetTouches.length == 1) {

        const timeNow = Date.now();
        const doubleTapInput = input.schema.touchInputMap?.buttons[TouchInputs.DoubleTouch];
        
        if(timeNow - lastTap < tapLength) {
          if(input.data.has(doubleTapInput)) {
            input.data.set(doubleTapInput, {
              type: InputType.BUTTON,
              value: BinaryValue.ON,
              lifecycleState: LifecycleValue.CONTINUED
            });
          } else {
            input.data.set(doubleTapInput, {
              type: InputType.BUTTON,
              value: BinaryValue.ON,
              lifecycleState: LifecycleValue.STARTED
            });
          }
        } else {
          if(input.data.has(doubleTapInput)) {
            input.data.set(doubleTapInput, {
              type: InputType.BUTTON,
              value: BinaryValue.OFF,
              lifecycleState: LifecycleValue.ENDED
            });
          }
        }
        lastTap = timeNow;
      }
        
      // If the key is in the map but it's in the same state as now, let's skip it (debounce)
      if (input.data.has(mappedInputKey) &&
        input.data.get(mappedInputKey).value === value) {
        if (input.data.get(mappedInputKey).lifecycleState !== LifecycleValue.CONTINUED) {
          input.data.set(mappedInputKey, {
            type: InputType.BUTTON,
            value: value,
            lifecycleState: LifecycleValue.CONTINUED
          });
        }
        return;
      }
  
      // Set type to BUTTON (up/down discrete state) and value to up or down, depending on what the value is set to
      input.data.set(mappedInputKey, {
        type: InputType.BUTTON,
        value: value,
        lifecycleState: LifecycleValue.STARTED
      });
    }
    else {
      input.data.set(mappedInputKey, {
        type: InputType.BUTTON,
        value: value,
        lifecycleState: LifecycleValue.ENDED
      });
    }
  } else {
    const doubleTapInput = input.schema.touchInputMap?.buttons[TouchInputs.DoubleTouch];
    if(input.data.has(doubleTapInput)) {
      input.data.set(doubleTapInput, {
        type: InputType.BUTTON,
        value: BinaryValue.OFF,
        lifecycleState: LifecycleValue.ENDED
      });
    }
  }
};


/**
 * Called whenever the mobile dpad is moved
 *
 * @param {Entity} entity The entity
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

const handleMobileDirectionalPad: Behavior = (entity: Entity, args: { event: CustomEvent }): void => {
  // TODO: move this types to types and interfaces
  const { stick, value }: { stick: Thumbsticks; value: { x: number; y: number; angleRad: number } } = args.event.detail;

  const input = getComponent(entity, Input);
  const mappedAxes = input.schema.gamepadInputMap?.axes;
  const mappedKey = mappedAxes? mappedAxes[stick] : null;

  // console.log('stick', stick, mappedKey, mappedAxes);

  if (!mappedKey) {
    return;
  }

  const stickPosition: [number, number, number] = [
    value.x,
    value.y,
    value.angleRad,
  ];

  // If position not set, set it with lifecycle started
  if (!input.data.has(mappedKey)) {
    input.data.set(mappedKey, {
      type: InputType.TWODIM,
      value: stickPosition,
      lifecycleState: LifecycleValue.STARTED
    });
  } else {
    // If position set, check it's value
    const oldStickPosition = input.data.get(mappedKey);
    // If it's not the same, set it and update the lifecycle value to changed
    if (JSON.stringify(oldStickPosition) !== JSON.stringify(stickPosition)) {
      // console.log('---changed');
      // Set type to TWODIM (two-dimensional axis) and value to a normalized -1, 1 on X and Y
      input.data.set(mappedKey, {
        type: InputType.TWODIM,
        value: stickPosition,
        lifecycleState: LifecycleValue.CHANGED
      });
    } else {
      // console.log('---not changed');
      // Otherwise, remove it
      //input.data.delete(mappedKey)
    }
  }
};

/**
 * Called when a button on mobile is pressed
 *
 * @param {Entity} entity The entity
 * @param args is argument object
 */

function handleOnScreenGamepadButton(entity: Entity, args: { event: CustomEvent; value: BinaryType }): any {
  console.log("Handle handleOnScreenGamepadButton called", args.event.detail, args.value);

  // input.schema.gamepadInputMap.buttons[]

  // Get immutable reference to Input and check if the button is defined -- ignore undefined keys
  const input = getComponent(entity, Input);
  if (input.schema.gamepadInputMap.buttons[args.event.detail.button] === undefined)
    return;
  const mappedKey = input.schema.gamepadInputMap.buttons[args.event.detail.button];

  if (args.value === BinaryValue.ON) {
    // If the key is in the map but it's in the same state as now, let's skip it (debounce)
    if (input.data.has(mappedKey) &&
      input.data.get(mappedKey).value === args.value) {
      if (input.data.get(mappedKey).lifecycleState !== LifecycleValue.CONTINUED) {
        input.data.set(mappedKey, {
          type: InputType.BUTTON,
          value: args.value,
          lifecycleState: LifecycleValue.CONTINUED
        });
      }
      return;
    }
    // Set type to BUTTON (up/down discrete state) and value to up or down, depending on what the value is set to
    input.data.set(mappedKey, {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.STARTED
    });
  }
  else {
    input.data.set(mappedKey, {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.ENDED
    });
  }
}

/**
 * Called whenever the mouse wheel is scrolled
 *
 * @param {Entity} entity The entity
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

const handleMouseWheel: Behavior = (entity: Entity, args: { event: WheelEvent }): void => {
  const input = getComponent(entity, Input);
  const value = args.event?.deltaY;

  if (!input.data.has(input.schema.mouseInputMap.axes[MouseInput.MouseScroll])) {
    input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseScroll], {
      type: InputType.ONEDIM,
      value: Math.sign(value),
      lifecycleState: LifecycleValue.STARTED
    });
  } else {
    const oldValue = input.data.get(input.schema.mouseInputMap.axes[MouseInput.MouseScroll]).value as number;
    if(oldValue === value) {
      input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseScroll], {
        type: InputType.ONEDIM,
        value: value,
        lifecycleState: LifecycleValue.UNCHANGED
      });
      return;
    }
    input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseScroll], {
      type: InputType.ONEDIM,
      value: oldValue + Math.sign(value),
      lifecycleState: LifecycleValue.CHANGED
    });
  }
};

/**
 * Normalize mouse movement and set the range of coordinates between 0 to 2.
 * @param x
 * @param y
 * @param elementWidth
 * @param elementHeight
 * @returns Normalized Mouse movement (x, y) where x and y are between 0 to 2 inclusively.
 */
function normalizeMouseMovement(x: number, y: number, elementWidth: number, elementHeight: number): { x: number; y: number } {
  return {
    x: x / (elementWidth / 2) ,
    y: -y / (elementHeight / 2)
  };
}

/**
 * Called whenever the mouse is moved
 *
 * @param {Entity} entity The entity
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

const handleMouseMovement: Behavior = (entity: Entity, args: { event: MouseEvent }): void => {
  const input = getComponent(entity, Input);
  const normalizedPosition = normalizeMouseCoordinates(args.event.clientX, args.event.clientY, window.innerWidth, window.innerHeight);
  const mousePosition: [number, number] = [ normalizedPosition.x, normalizedPosition.y ];
 
  const mappedPositionInput = input.schema.mouseInputMap.axes[MouseInput.MousePosition];
  const mappedMovementInput = input.schema.mouseInputMap.axes[MouseInput.MouseMovement];
  const mappedDragMovementInput = input.schema.mouseInputMap.axes[MouseInput.MouseClickDownMovement];

  // If mouse position not set, set it with lifecycle started
  if (mappedPositionInput) {
    input.data.set(mappedPositionInput, {
      type: InputType.TWODIM,
      value: mousePosition,
      lifecycleState: input.data.has(mappedPositionInput)? LifecycleValue.CHANGED : LifecycleValue.STARTED
    });
  }

  const normalizedMovement = normalizeMouseMovement(args.event.movementX, args.event.movementY, window.innerWidth, window.innerHeight)
  const mouseMovement: [number, number] = [normalizedMovement.x, normalizedMovement.y]

  if (mappedMovementInput) {
    input.data.set(mappedMovementInput, {
      type: InputType.TWODIM,
      value: mouseMovement,
      lifecycleState: input.data.has(mappedMovementInput)? LifecycleValue.CHANGED : LifecycleValue.STARTED
    });
  }

  // TODO: it looks like hack... MouseInput.MousePosition doesn't know that it is SCREENXY, and it could be anything ... same should be here
  const SCREENXY_START = input.data.get(BaseInput.SCREENXY_START);
  if (SCREENXY_START && SCREENXY_START.lifecycleState !== LifecycleValue.ENDED) {
    // Set dragging movement delta
    if (mappedDragMovementInput) {
      input.data.set(mappedDragMovementInput, {
        type: InputType.TWODIM,
        value: mouseMovement,
        lifecycleState: input.data.has(mappedDragMovementInput)? LifecycleValue.CHANGED : LifecycleValue.STARTED
      });
    }
  }
};

/**
 * Called when a mouse button is pressed
 *
 * @param {Entity} entity The entity
 * @param args is argument object with event and value properties. Value set 0 | 1
 */

const handleMouseButton: Behavior = (entity: Entity, args: { event: MouseEvent; value: BinaryType }): void => {
  // Get immutable reference to Input and check if the button is defined -- ignore undefined buttons
  const input = getMutableComponent(entity, Input);
  if (input.schema.mouseInputMap.buttons[args.event.button] === undefined)
    return;

  const mousePosition: [number, number] = [0, 0];
  mousePosition[0] = (args.event.clientX / window.innerWidth) * 2 - 1;
  mousePosition[1] = (args.event.clientY / window.innerHeight) * -2 + 1;

  // Set type to BUTTON (up/down discrete state) and value to up or down, as called by the DOM mouse events
  if (args.value === BinaryValue.ON) {
    // Set type to BUTTON and value to up or down
    input.data.set(input.schema.mouseInputMap.buttons[args.event.button], {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.STARTED
    });

    // TODO: this would not be set if none of buttons assigned
    // Set type to TWOD (two dimensional) and value with x: -1, 1 and y: -1, 1
    input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition], {
      type: InputType.TWODIM,
      value: mousePosition,
      lifecycleState: LifecycleValue.STARTED
    });
  }
  else {
    // Removed mouse input data
    input.data.set(input.schema.mouseInputMap.buttons[args.event.button], {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.ENDED
    });
    input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition], {
      type: InputType.TWODIM,
      value: mousePosition,
      lifecycleState: LifecycleValue.ENDED
    });
    input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseClickDownTransformRotation], {
      type: InputType.TWODIM,
      value: mousePosition,
      lifecycleState: LifecycleValue.ENDED
    });
    // input.data.delete(input.schema.mouseInputMap.buttons[args.event.button]);
    // input.data.delete(input.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition]);
    // input.data.delete(input.schema.mouseInputMap.axes[MouseInput.MouseClickDownTransformRotation]);
  }
};

/**
 * Clled when a keyboard key is pressed
 *
 * @param {Entity} entity The entity
 * @param args is argument object
 */

const handleKey = (entity: Entity, args: { event: KeyboardEvent; value: BinaryType }): any => {
  // Get immutable reference to Input and check if the button is defined -- ignore undefined keys
  const input = getComponent(entity, Input);
  if(input === undefined) return console.warn("Skipipng handleKey on ", entity.id, "because input component is undefined");
  if (input.schema.keyboardInputMap[args.event.key?.toLowerCase()] === undefined)
    return;
  const mappedKey = input.schema.keyboardInputMap[args.event.key.toLowerCase()];
  const element = args.event.target as HTMLElement;
  // Сheck which excludes the possibility of controlling the character (car, etc.) when typing a text
  if (element?.tagName === 'INPUT' || element?.tagName === 'SELECT' || element?.tagName === 'TEXTAREA') {
    return;
  }

  if (args.value === BinaryValue.ON) {
    // If the key is in the map but it's in the same state as now, let's skip it (debounce)
    if (input.data.has(mappedKey) &&
      input.data.get(mappedKey).value === args.value) {
      if (input.data.get(mappedKey).lifecycleState !== LifecycleValue.CONTINUED) {
        input.data.set(mappedKey, {
          type: InputType.BUTTON,
          value: args.value,
          lifecycleState: LifecycleValue.CONTINUED
        });
      }
      return;
    }
    // Set type to BUTTON (up/down discrete state) and value to up or down, depending on what the value is set to
    input.data.set(input.schema.keyboardInputMap[args.event.key.toLowerCase()], {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.STARTED
    });
  }
  else {
    input.data.set(input.schema.keyboardInputMap[args.event.key.toLowerCase()], {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.ENDED
    });
  }
}

/**
 * Called when context menu is opened
 *
 * @param {Entity} entity The entity
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

const handleContextMenu: Behavior = (entity: Entity, args: { event: MouseEvent }): void => {
  args.event.preventDefault();
};


/**
 * Called when the mouse leaves
 *
 * @param {Entity} entity The entity
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

const handleMouseLeave: Behavior = (entity: Entity, args: { event: MouseEvent }): void => {
  const input = getComponent(entity, Input);

  Object.keys(input.schema.mouseInputMap.buttons).forEach(button => {
      if (!input.data.has(button)) {
          return;
      }

      input.data.set(button, {
          type: InputType.BUTTON,
          value: BinaryValue.OFF,
          lifecycleState: LifecycleValue.ENDED
      });
  });

  if (input.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition]) {
      const axis = input.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition];
      if (input.data.has(axis)) {
          const value = input.data.get(axis).value;

          if (value[0] !== 0 || value[1] !== 0) {
              input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition], {
                  type: InputType.TWODIM,
                  value: [0, 0],
                  lifecycleState: LifecycleValue.ENDED
              });
          }
      }
  }

  if (input.schema.mouseInputMap.axes[MouseInput.MouseClickDownTransformRotation]) {
      const axis = input.schema.mouseInputMap.axes[MouseInput.MouseClickDownTransformRotation];
      if (input.data.has(axis)) {
          const value = input.data.get(axis).value;

          if (value[0] !== 0 || value[1] !== 0) {
              input.data.set(axis, {
                  type: InputType.TWODIM,
                  value: [0, 0],
                  lifecycleState: LifecycleValue.ENDED
              });
          }
      }
  }

};

const keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

function preventDefault (e) {
  e.preventDefault();
}

function preventDefaultForScrollKeys (e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

// modern Chrome requires { passive: false } when adding event
let supportsPassive = false;
try {
  window.addEventListener(
    'test',
    null,
    Object.defineProperty({}, 'passive', {
      get: function () {
        supportsPassive = true;
      }
    })
  );
  // eslint-disable-next-line no-empty
} catch (e) {}

/**
 * Normalize coordinates and set the range of coordinates between -1 to 1.
 * @param x
 * @param y
 * @param elementWidth
 * @param elementHeight
 * @returns Normalized Mouse coordinates (x, y) where x and y are between -1 to 1 inclusively.
 */
function normalizeMouseCoordinates(x: number, y: number, elementWidth: number, elementHeight: number): { x: number; y: number } {
  return {
    x: (x / elementWidth) * 2 - 1,
    y: (y / elementHeight) * -2 + 1
  };
}


/** Disable the scroll */
function disableScroll (): void {
  if(!isClient) return;
  window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
  // window.addEventListener(wheelEvent, preventDefault, wheelOpt) // modern desktop
  // window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
  window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

/** Enable the scroll */
function enableScroll (): void {
  if(!isClient) return
  window.removeEventListener('DOMMouseScroll', preventDefault, false);
  // window.removeEventListener(wheelEvent, preventDefault)
  // window.removeEventListener('touchmove', preventDefault);
  window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}


export const BaseInputSchema: InputSchema = {
  inputAxisBehaviors: {},
  inputButtonBehaviors: {},
  inputRelationships: {},
  // When an Input component is added, the system will call this array of behaviors
  onAdded: [
    {
      behavior: disableScroll
    }
  ],
  // When an Input component is removed, the system will call this array of behaviors
  onRemoved: [
    {
      behavior: enableScroll
    }
  ],
  eventBindings: {
    // Mouse
    contextmenu: [
      {
        behavior: handleContextMenu
      }
    ],
    mousemove: [
      {
        behavior: handleMouseMovement,
      }
    ],
    mouseup: [
      {
        behavior: handleMouseButton,
        args: {
          value: BinaryValue.OFF
        }
      }
    ],

    mousedown: [
      {
        behavior: handleMouseButton,
        element: 'viewport',
        args: {
          value: BinaryValue.ON
        }
      }
    ],
    wheel: [
      {
        behavior: handleMouseWheel,
        passive: true,
        args: {
          value: BaseInput.CAMERA_SCROLL
        }
      }
    ],
    mouseleave: [
      {
        behavior: handleMouseLeave,
      }
    ],
    // Touch
    touchstart: [
      {
        behavior: handleTouch,
        passive: true,
        args: {
          value: BinaryValue.ON
        }
      },
      {
        behavior: handleTouchMove,
        passive: true
      },
    ],
    touchend: [
      {
        behavior: handleTouch,
        passive: true,
        args: {
          value: BinaryValue.OFF
        }
      }
    ],
    touchcancel: [
      {
        behavior: handleTouch,
        passive: true,
        args: {
          value: BinaryValue.OFF
        }
      }
    ],
    touchmove: [
      {
        behavior: handleTouchMove,
        passive: true
      }
    ],
    // Keys
    keyup: [
      {
        behavior: handleKey,
        element: 'document',
        args: {
          value: BinaryValue.OFF
        }
      }
    ],
    keydown: [
      {
        behavior: handleKey,
        element: 'document',
        args: {
          value: BinaryValue.ON
        }
      }
    ],
    // Gamepad
    gamepadconnected: [
      {
        behavior: handleGamepadConnected,
        element: 'window'
      }
    ],
    gamepaddisconnected: [
      {
        behavior: handleGamepadDisconnected,
        element: 'window'
      }
    ],
    // mobile onscreen gamepad
    stickmove: [
      {
        behavior: handleMobileDirectionalPad,
        element: 'document'
      }
    ],
    mobilegamepadbuttondown: [
      {
        behavior: handleOnScreenGamepadButton,
        element: 'document',
        args: {
          value: BinaryValue.ON
        }
      }
    ],
    mobilegamepadbuttonup: [
      {
        behavior: handleOnScreenGamepadButton,
        element: 'document',
        args: {
          value: BinaryValue.OFF
        }
      }
    ],
  }
};