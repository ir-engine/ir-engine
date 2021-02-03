import { BinaryValue } from "../../common/enums/BinaryValue";
import { disableScroll, enableScroll } from "../../common/functions/enableDisableScrolling";
import { handleGamepadConnected, handleGamepadDisconnected } from "../../input/behaviors/GamepadInputBehaviors";
import { handleMouseLeave } from "../../input/behaviors/handelMouseLeave";
import { handleKey } from "../../input/behaviors/handleKey";
import { handleMouseButton } from "../../input/behaviors/handleMouseButton";
import { handleMouseMovement } from "../../input/behaviors/handleMouseMovement";
import { handleMouseWheel } from "../../input/behaviors/handleMouseWheel";
import {
  handleOnScreenGamepadButton,
  handleOnScreenGamepadMovement
} from "../../input/behaviors/handleOnScreenJoystick";
import { handleContextMenu } from "../../input/behaviors/handleContextMenu"
import { handleTouch } from "../../input/behaviors/handleTouch";
import { handleTouchMove } from "../../input/behaviors/handleTouchMove";
import { InputSchema } from "../../input/interfaces/InputSchema";
import { DefaultInput } from "./DefaultInput";

export const DefaultInputSchema: InputSchema = {
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
          value: DefaultInput.CAMERA_SCROLL
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
        behavior: handleTouchMove,
        passive: true
      },
      {
        behavior: handleTouch,
        passive: true,
        args: {
          value: BinaryValue.ON
        }
      }
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
        behavior: handleOnScreenGamepadMovement,
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
    ]
  }
};