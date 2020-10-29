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
import { Vector2 } from "three";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../../input/components/Input";

const startPosition = new Vector2(0,0);
const accumulatedMoveDifference = new Vector2(0,0);

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
      },
      {
        behavior: entity => {
          const input = getComponent(entity, Input);
          const move = input.data.get(DefaultInput.LOOKTURN_PLAYERONE)?.value;
          if (move) {
            accumulatedMoveDifference.add(new Vector2(move[0], move[1]));
          }
        }
      }
    ],
    mouseup: [
      {
        behavior: handleMouseButton,
        args: {
          value: BinaryValue.OFF
        }
      },
      {
        behavior: (entity) => {
          const input = getComponent(entity, Input);
          const pos = input.data.get(DefaultInput.SCREENXY).value;
          console.log('MOV DIFF1', startPosition.clone().sub(new Vector2(pos[0], pos[1])).toArray());
          console.log('MOV DIFF2', accumulatedMoveDifference.toArray());
        }
      }
    ],
    mousedown: [
      {
        behavior: handleMouseButton,
        args: {
          value: BinaryValue.ON
        }
      },
      {
        behavior: (entity) => {
          const input = getComponent(entity, Input);
          const pos = input.data.get(DefaultInput.SCREENXY).value;
          startPosition.set(pos[0], pos[1]);
          accumulatedMoveDifference.set(0,0);
          console.log('MOV START');
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
      },
      {
        behavior: (entity) => {
          const input = getComponent(entity, Input);
          const pos = input.data.get(DefaultInput.SCREENXY).value;
          startPosition.set(pos[0], pos[1]);
          accumulatedMoveDifference.set(0,0);
          console.log('MOV START');
        }
      }
    ],
    touchend: [
      {
        behavior: handleTouch,
        args: {
          value: BinaryValue.OFF
        }
      },
      {
        behavior: (entity) => {
          const input = getComponent(entity, Input);
          const pos = input.data.get(DefaultInput.SCREENXY).value;
          console.log('MOV DIFF1', startPosition.clone().sub(new Vector2(pos[0], pos[1])).toArray());
          console.log('MOV DIFF2', accumulatedMoveDifference.toArray());
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
      },
      {
        behavior: entity => {
          const input = getComponent(entity, Input);
          const move = input.data.get(DefaultInput.LOOKTURN_PLAYERONE).value;
          accumulatedMoveDifference.add(new Vector2(move[0], move[1]));
        }
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