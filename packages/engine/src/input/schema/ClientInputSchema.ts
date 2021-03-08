import { Vector2 } from "three";
import { BinaryValue } from "../../common/enums/BinaryValue";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { Thumbsticks } from '../../common/enums/Thumbsticks';
import { isClient } from "../../common/functions/isClient";
import { BinaryType } from '../../common/types/NumericalTypes';
import { Engine } from "../../ecs/classes/Engine";
import { handleGamepadConnected, handleGamepadDisconnected } from "../behaviors/GamepadInputBehaviors";
import { BaseInput } from "../enums/BaseInput";
import { InputType } from '../enums/InputType';
import { MouseInput } from '../enums/MouseInput';
import { TouchInputs } from "../enums/TouchInputs";

const touchSensitive = 2;
let prevTouchPosition: [number, number] = [0, 0];
let lastTap = Date.now();
const tapLength = 200; // 100ms between doubletaps

/**
 * Touch move
 * 
 * @param args is argument object
 */

const handleTouchMove = (args: { event: TouchEvent }): void => {
  
  const normalizedPosition = normalizeMouseCoordinates(args.event.touches[0].clientX, args.event.touches[0].clientY, window.innerWidth, window.innerHeight);
  const touchPosition: [number, number] = [normalizedPosition.x, normalizedPosition.y];

  if (args.event.touches.length == 1) {

    Engine.inputState.data.set(BaseInput.POINTER1_POSITION, {
      type: InputType.TWODIM,
      value: touchPosition,
      lifecycleState: LifecycleValue.CHANGED
    });
    
    const mappedPositionInput = Engine.inputState.schema.touchInputMap?.axes[TouchInputs.Touch1Position];
    if (!mappedPositionInput) {
      return;
    }
    const hasData = Engine.inputState.data.has(mappedPositionInput);

    Engine.inputState.data.set(mappedPositionInput, {
      type: InputType.TWODIM,
      value: touchPosition,
      lifecycleState: hasData ? LifecycleValue.CHANGED : LifecycleValue.STARTED
    });

    const movementStart = args.event.type === 'touchstart';
    const mappedMovementInput = Engine.inputState.schema.touchInputMap?.axes[TouchInputs.Touch1Movement];
    if (!mappedMovementInput) {
      return;
    }

    const touchMovement: [number, number] = [0, 0];
    if (!movementStart && prevTouchPosition) {
      touchMovement[0] = (touchPosition[0] - prevTouchPosition[0]) * touchSensitive;
      touchMovement[1] = (touchPosition[1] - prevTouchPosition[1]) * touchSensitive;
    }

    prevTouchPosition = touchPosition;

    Engine.inputState.data.set(mappedMovementInput, {
      type: InputType.TWODIM,
      value: touchMovement,
      lifecycleState: Engine.inputState.data.has(mappedMovementInput) ? LifecycleValue.CHANGED : LifecycleValue.STARTED
    });

  } else if (args.event.touches.length >= 2) {

    const normalizedPosition2 = normalizeMouseCoordinates(args.event.touches[1].clientX, args.event.touches[1].clientY, window.innerWidth, window.innerHeight);
    const touchPosition2: [number, number] = [normalizedPosition2.x, normalizedPosition2.y];

    Engine.inputState.data.set(BaseInput.POINTER1_POSITION, {
      type: InputType.TWODIM,
      value: touchPosition,
      lifecycleState: LifecycleValue.CHANGED
    });
    
    Engine.inputState.data.set(BaseInput.POINTER2_POSITION, {
      type: InputType.TWODIM,
      value: touchPosition2,
      lifecycleState: LifecycleValue.CHANGED
    });

    const lastTouchPosition1Array = Engine.inputState.prevData.get(BaseInput.POINTER1_POSITION)?.value;
    const lastTouchPosition2Array = Engine.inputState.prevData.get(BaseInput.POINTER2_POSITION)?.value;
    if (args.event.type === 'touchstart' || !lastTouchPosition1Array || !lastTouchPosition2Array) {
      // skip if it's just start of gesture or there are no previous data yet
      return;
    }

    if (!Engine.inputState.data.has(BaseInput.POINTER1_POSITION) || !Engine.inputState.data.has(BaseInput.POINTER2_POSITION)) {
      console.warn('handleTouchScale requires POINTER1_POSITION and POINTER2_POSITION to be set and updated.');
      return;
    }

    const currentTouchPosition1 = new Vector2().fromArray(Engine.inputState.data.get(BaseInput.POINTER1_POSITION).value as number[]);
    const currentTouchPosition2 = new Vector2().fromArray(Engine.inputState.data.get(BaseInput.POINTER2_POSITION).value as number[]);

    const lastTouchPosition1 = new Vector2().fromArray(lastTouchPosition1Array as number[]);
    const lastTouchPosition2 = new Vector2().fromArray(lastTouchPosition2Array as number[]);

    const scaleMappedInputKey = Engine.inputState.schema.touchInputMap?.axes[TouchInputs.Scale];

    const currentDistance = currentTouchPosition1.distanceTo(currentTouchPosition2);
    const lastDistance = lastTouchPosition1.distanceTo(lastTouchPosition2);

    const touchScaleValue = (lastDistance - currentDistance) * 0.01;
    const signVal = Math.sign(touchScaleValue);
    if (!Engine.inputState.data.has(scaleMappedInputKey)) {
      Engine.inputState.data.set(scaleMappedInputKey, {
        type: InputType.ONEDIM,
        value: signVal,
        lifecycleState: LifecycleValue.STARTED
      });
    } else {
      const oldValue = Engine.inputState.data.get(scaleMappedInputKey).value as number;
      Engine.inputState.data.set(scaleMappedInputKey, {
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
 * @param args is argument object
 */
const handleTouch = ({ event, value }: { event: TouchEvent; value: BinaryType }): void => {
    if (event.targetTouches.length) {
    const mappedInputKey = Engine.inputState.schema.touchInputMap?.buttons[TouchInputs.Touch];
    if (!mappedInputKey) {
      return;
    }
    if (value === BinaryValue.ON) {

      if(event.targetTouches.length == 1) {

        const timeNow = Date.now();
        const doubleTapInput = Engine.inputState.schema.touchInputMap?.buttons[TouchInputs.DoubleTouch];
        
        if(timeNow - lastTap < tapLength) {
          if(Engine.inputState.data.has(doubleTapInput)) {
            Engine.inputState.data.set(doubleTapInput, {
              type: InputType.BUTTON,
              value: BinaryValue.ON,
              lifecycleState: LifecycleValue.CONTINUED
            });
          } else {
            Engine.inputState.data.set(doubleTapInput, {
              type: InputType.BUTTON,
              value: BinaryValue.ON,
              lifecycleState: LifecycleValue.STARTED
            });
          }
        } else {
          if(Engine.inputState.data.has(doubleTapInput)) {
            Engine.inputState.data.set(doubleTapInput, {
              type: InputType.BUTTON,
              value: BinaryValue.OFF,
              lifecycleState: LifecycleValue.ENDED
            });
          }
        }
        lastTap = timeNow;
      }
        
      // If the key is in the map but it's in the same state as now, let's skip it (debounce)
      if (Engine.inputState.data.has(mappedInputKey) &&
        Engine.inputState.data.get(mappedInputKey).value === value) {
        if (Engine.inputState.data.get(mappedInputKey).lifecycleState !== LifecycleValue.CONTINUED) {
          Engine.inputState.data.set(mappedInputKey, {
            type: InputType.BUTTON,
            value: value,
            lifecycleState: LifecycleValue.CONTINUED
          });
        }
        return;
      }
  
      // Set type to BUTTON (up/down discrete state) and value to up or down, depending on what the value is set to
      Engine.inputState.data.set(mappedInputKey, {
        type: InputType.BUTTON,
        value: value,
        lifecycleState: LifecycleValue.STARTED
      });
    }
    else {
      Engine.inputState.data.set(mappedInputKey, {
        type: InputType.BUTTON,
        value: value,
        lifecycleState: LifecycleValue.ENDED
      });
    }
  } else {
    const doubleTapInput = Engine.inputState.schema.touchInputMap?.buttons[TouchInputs.DoubleTouch];
    if(Engine.inputState.data.has(doubleTapInput)) {
      Engine.inputState.data.set(doubleTapInput, {
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
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

const handleMobileDirectionalPad = (args: { event: CustomEvent }): void => {
  // TODO: move this types to types and interfaces
  const { stick, value }: { stick: Thumbsticks; value: { x: number; y: number; angleRad: number } } = args.event.detail;

    const mappedAxes = Engine.inputState.schema.gamepadInputMap?.axes;
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
  if (!Engine.inputState.data.has(mappedKey)) {
    Engine.inputState.data.set(mappedKey, {
      type: InputType.TWODIM,
      value: stickPosition,
      lifecycleState: LifecycleValue.STARTED
    });
  } else {
    // If position set, check it's value
    const oldStickPosition = Engine.inputState.data.get(mappedKey);
    // If it's not the same, set it and update the lifecycle value to changed
    if (JSON.stringify(oldStickPosition) !== JSON.stringify(stickPosition)) {
      // console.log('---changed');
      // Set type to TWODIM (two-dimensional axis) and value to a normalized -1, 1 on X and Y
      Engine.inputState.data.set(mappedKey, {
        type: InputType.TWODIM,
        value: stickPosition,
        lifecycleState: LifecycleValue.CHANGED
      });
    } else {
      // console.log('---not changed');
      // Otherwise, remove it
      //Engine.inputState.data.delete(mappedKey)
    }
  }
};

/**
 * Called when a button on mobile is pressed
 *
 * @param args is argument object
 */

function handleOnScreenGamepadButton(args: { event: CustomEvent; value: BinaryType }): any {
  console.log("Handle handleOnScreenGamepadButton called", args.event.detail, args.value);

  // Engine.inputState.schema.gamepadInputMap.buttons[]

  // Get immutable reference to Input and check if the button is defined -- ignore undefined keys
    if (Engine.inputState.schema.gamepadInputMap.buttons[args.event.detail.button] === undefined)
    return;
  const mappedKey = Engine.inputState.schema.gamepadInputMap.buttons[args.event.detail.button];

  if (args.value === BinaryValue.ON) {
    // If the key is in the map but it's in the same state as now, let's skip it (debounce)
    if (Engine.inputState.data.has(mappedKey) &&
    Engine.inputState.data.get(mappedKey).value === args.value) {
      if (Engine.inputState.data.get(mappedKey).lifecycleState !== LifecycleValue.CONTINUED) {
        Engine.inputState.data.set(mappedKey, {
          type: InputType.BUTTON,
          value: args.value,
          lifecycleState: LifecycleValue.CONTINUED
        });
      }
      return;
    }
    // Set type to BUTTON (up/down discrete state) and value to up or down, depending on what the value is set to
    Engine.inputState.data.set(mappedKey, {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.STARTED
    });
  }
  else {
    Engine.inputState.data.set(mappedKey, {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.ENDED
    });
  }
}

/**
 * Called whenever the mouse wheel is scrolled
 *
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

const handleMouseWheel = (args: { event: WheelEvent }): void => {
    const value = args.event?.deltaY;

  if (!Engine.inputState.data.has(Engine.inputState.schema.mouseInputMap.axes[MouseInput.MouseScroll])) {
    Engine.inputState.data.set(Engine.inputState.schema.mouseInputMap.axes[MouseInput.MouseScroll], {
      type: InputType.ONEDIM,
      value: Math.sign(value),
      lifecycleState: LifecycleValue.STARTED
    });
  } else {
    const oldValue = Engine.inputState.data.get(Engine.inputState.schema.mouseInputMap.axes[MouseInput.MouseScroll]).value as number;
    if(oldValue === value) {
      Engine.inputState.data.set(Engine.inputState.schema.mouseInputMap.axes[MouseInput.MouseScroll], {
        type: InputType.ONEDIM,
        value: value,
        lifecycleState: LifecycleValue.UNCHANGED
      });
      return;
    }
    Engine.inputState.data.set(Engine.inputState.schema.mouseInputMap.axes[MouseInput.MouseScroll], {
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
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

const handleMouseMovement = (args: { event: MouseEvent }): void => {
    const normalizedPosition = normalizeMouseCoordinates(args.event.clientX, args.event.clientY, window.innerWidth, window.innerHeight);
  const mousePosition: [number, number] = [ normalizedPosition.x, normalizedPosition.y ];
 
  const mappedPositionInput = Engine.inputState.schema.mouseInputMap.axes[MouseInput.MousePosition];
  const mappedMovementInput = Engine.inputState.schema.mouseInputMap.axes[MouseInput.MouseMovement];
  const mappedDragMovementInput = Engine.inputState.schema.mouseInputMap.axes[MouseInput.MouseClickDownMovement];

  // If mouse position not set, set it with lifecycle started
  if (mappedPositionInput) {
    Engine.inputState.data.set(mappedPositionInput, {
      type: InputType.TWODIM,
      value: mousePosition,
      lifecycleState: Engine.inputState.data.has(mappedPositionInput)? LifecycleValue.CHANGED : LifecycleValue.STARTED
    });
  }

  const normalizedMovement = normalizeMouseMovement(args.event.movementX, args.event.movementY, window.innerWidth, window.innerHeight)
  const mouseMovement: [number, number] = [normalizedMovement.x, normalizedMovement.y]

  if (mappedMovementInput) {
    Engine.inputState.data.set(mappedMovementInput, {
      type: InputType.TWODIM,
      value: mouseMovement,
      lifecycleState: Engine.inputState.data.has(mappedMovementInput)? LifecycleValue.CHANGED : LifecycleValue.STARTED
    });
  }

  // TODO: it looks like hack... MouseInput.MousePosition doesn't know that it is SCREENXY, and it could be anything ... same should be here
  const SCREENXY_START = Engine.inputState.data.get(BaseInput.SCREENXY_START);
  if (SCREENXY_START && SCREENXY_START.lifecycleState !== LifecycleValue.ENDED) {
    // Set dragging movement delta
    if (mappedDragMovementInput) {
      Engine.inputState.data.set(mappedDragMovementInput, {
        type: InputType.TWODIM,
        value: mouseMovement,
        lifecycleState: Engine.inputState.data.has(mappedDragMovementInput)? LifecycleValue.CHANGED : LifecycleValue.STARTED
      });
    }
  }
};

/**
 * Called when a mouse button is pressed
 *
 * @param args is argument object with event and value properties. Value set 0 | 1
 */

const handleMouseButton = (args: { event: MouseEvent; value: BinaryType }): void => {
  // Get immutable reference to Input and check if the button is defined -- ignore undefined buttons
  if (Engine.inputState.schema.mouseInputMap.buttons[args.event.button] === undefined)
    return;

  const mousePosition: [number, number] = [0, 0];
  mousePosition[0] = (args.event.clientX / window.innerWidth) * 2 - 1;
  mousePosition[1] = (args.event.clientY / window.innerHeight) * -2 + 1;

  // Set type to BUTTON (up/down discrete state) and value to up or down, as called by the DOM mouse events
  if (args.value === BinaryValue.ON) {
    // Set type to BUTTON and value to up or down
    Engine.inputState.data.set(Engine.inputState.schema.mouseInputMap.buttons[args.event.button], {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.STARTED
    });

    // TODO: this would not be set if none of buttons assigned
    // Set type to TWOD (two dimensional) and value with x: -1, 1 and y: -1, 1
    Engine.inputState.data.set(Engine.inputState.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition], {
      type: InputType.TWODIM,
      value: mousePosition,
      lifecycleState: LifecycleValue.STARTED
    });
  }
  else {
    // Removed mouse Engine.inputState data
    Engine.inputState.data.set(Engine.inputState.schema.mouseInputMap.buttons[args.event.button], {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.ENDED
    });
    Engine.inputState.data.set(Engine.inputState.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition], {
      type: InputType.TWODIM,
      value: mousePosition,
      lifecycleState: LifecycleValue.ENDED
    });
    Engine.inputState.data.set(Engine.inputState.schema.mouseInputMap.axes[MouseInput.MouseClickDownTransformRotation], {
      type: InputType.TWODIM,
      value: mousePosition,
      lifecycleState: LifecycleValue.ENDED
    });
    // Engine.inputState.data.delete(Engine.inputState.schema.mouseInputMap.buttons[args.event.button]);
    // Engine.inputState.data.delete(Engine.inputState.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition]);
    // Engine.inputState.data.delete(Engine.inputState.schema.mouseInputMap.axes[MouseInput.MouseClickDownTransformRotation]);
  }
};

/**
 * Clled when a keyboard key is pressed
 *
 * @param args is argument object
 */

const handleKey = (args: { event: KeyboardEvent; value: BinaryType }): any => {
  // Get immutable reference to Input and check if the button is defined -- ignore undefined keys
  if (Engine.inputState.schema.keyboardInputMap[args.event.key?.toLowerCase()] === undefined)
    return;
  const mappedKey = Engine.inputState.schema.keyboardInputMap[args.event.key.toLowerCase()];
  const element = args.event.target as HTMLElement;
  // Сheck which excludes the possibility of controlling the character (car, etc.) when typing a text
  if (element?.tagName === 'INPUT' || element?.tagName === 'SELECT' || element?.tagName === 'TEXTAREA') {
    return;
  }

  if (args.value === BinaryValue.ON) {
    // If the key is in the map but it's in the same state as now, let's skip it (debounce)
    if (Engine.inputState.data.has(mappedKey) &&
      Engine.inputState.data.get(mappedKey).value === args.value) {
      if (Engine.inputState.data.get(mappedKey).lifecycleState !== LifecycleValue.CONTINUED) {
        Engine.inputState.data.set(mappedKey, {
          type: InputType.BUTTON,
          value: args.value,
          lifecycleState: LifecycleValue.CONTINUED
        });
      }
      return;
    }
    // Set type to BUTTON (up/down discrete state) and value to up or down, depending on what the value is set to
    Engine.inputState.data.set(Engine.inputState.schema.keyboardInputMap[args.event.key.toLowerCase()], {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.STARTED
    });
  }
  else {
    Engine.inputState.data.set(Engine.inputState.schema.keyboardInputMap[args.event.key.toLowerCase()], {
      type: InputType.BUTTON,
      value: args.value,
      lifecycleState: LifecycleValue.ENDED
    });
  }
}

/**
 * Called when context menu is opened
 *
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

const handleContextMenu = (args: { event: MouseEvent }): void => {
  args.event.preventDefault();
};


/**
 * Called when the mouse leaves
 *
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

const handleMouseLeave = (args: { event: MouseEvent }): void => {
  
  Object.keys(Engine.inputState.schema.mouseInputMap.buttons).forEach(button => {
      if (!Engine.inputState.data.has(button)) {
          return;
      }

      Engine.inputState.data.set(button, {
          type: InputType.BUTTON,
          value: BinaryValue.OFF,
          lifecycleState: LifecycleValue.ENDED
      });
  });

  if (Engine.inputState.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition]) {
      const axis = Engine.inputState.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition];
      if (Engine.inputState.data.has(axis)) {
          const value = Engine.inputState.data.get(axis).value;

          if (value[0] !== 0 || value[1] !== 0) {
              Engine.inputState.data.set(Engine.inputState.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition], {
                  type: InputType.TWODIM,
                  value: [0, 0],
                  lifecycleState: LifecycleValue.ENDED
              });
          }
      }
  }

  if (Engine.inputState.schema.mouseInputMap.axes[MouseInput.MouseClickDownTransformRotation]) {
      const axis = Engine.inputState.schema.mouseInputMap.axes[MouseInput.MouseClickDownTransformRotation];
      if (Engine.inputState.data.has(axis)) {
          const value = Engine.inputState.data.get(axis).value;

          if (value[0] !== 0 || value[1] !== 0) {
              Engine.inputState.data.set(axis, {
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


export const ClientInputSchema = {
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