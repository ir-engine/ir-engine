import { InputSchema } from "../../input/interfaces/InputSchema";
import { preventDefault } from "../../common/functions/preventDefault";
import { handleMouseMovement } from "../../input/behaviors/handleMouseMovement";
import { handleMouseButton } from "../../input/behaviors/handleMouseButton";
import { BinaryValue } from "../../common/enums/BinaryValue";
import { handleMouseWheel } from "../../input/behaviors/handleMouseWheel";
import { DefaultInput } from "./DefaultInput";
import { handleTouch } from "../../input/behaviors/handleTouch";
import { handleTouchMove } from "../../input/behaviors/handleTouchMove";
import { handleKey } from "../../input/behaviors/handleKey";
import { handleGamepadConnected, handleGamepadDisconnected } from "../../input/behaviors/GamepadInputBehaviors";
import {
  handleOnScreenGamepadButton,
  handleOnScreenGamepadMovement
} from "../../input/behaviors/handleOnScreenJoystick";
import { disableScroll, enableScroll } from "../../common/functions/enableDisableScrolling";

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
        behavior: preventDefault
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
        args: {
          value: BinaryValue.ON
        }
      }
    ],
    wheel: [
      {
        behavior: handleMouseWheel,
        args: {
          value: DefaultInput.CAMERA_SCROLL
        }
      }
    ],

    // Touch
    touchstart: [
      {
        behavior: handleTouch,
        args: {
          value: BinaryValue.ON
        }
      },
      {
        behavior: handleTouchMove,
      }
    ],
    touchend: [
      {
        behavior: handleTouch,
        args: {
          value: BinaryValue.OFF
        }
      }
    ],
    touchcancel: [
      {
        behavior: handleTouch,
        args: {
          value: BinaryValue.OFF
        }
      }
    ],
    touchmove: [
      {
        behavior: handleTouchMove
      }
    ],
    // Keys
    keyup: [
      {
        behavior: handleKey,
        args: {
          value: BinaryValue.OFF
        }
      }
    ],
    keydown: [
      {
        behavior: handleKey,
        args: {
          value: BinaryValue.ON
        }
      }
    ],
    // Gamepad
    gamepadconnected: [
      {
        behavior: handleGamepadConnected,
        element: 'document'
      }
    ],
    gamepaddisconnected: [
      {
        behavior: handleGamepadDisconnected,
        element: 'document'
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