import { cameraPointerLock } from "@xr3ngine/engine/src/camera/behaviors/cameraPointerLock";
import { BinaryValue } from '../../common/enums/BinaryValue';
import { Thumbsticks } from '../../common/enums/Thumbsticks';
import { disableScroll, enableScroll } from '../../common/functions/enableDisableScrolling';
import { preventDefault } from '../../common/functions/preventDefault';
import { handleMouseMovement } from "../../input/behaviors/handleMouseMovement";
import { handleMouseButton } from "../../input/behaviors/handleMouseButton";
import { handleKey } from "../../input/behaviors/handleKey";
import { handleGamepadConnected, handleGamepadDisconnected } from '../../input/behaviors/GamepadInputBehaviors';
import { handleTouch, handleTouchMove } from '../../input/behaviors/TouchBehaviors';
import { GamepadButtons } from '../../input/enums/GamepadButtons';
import { MouseInput } from '../../input/enums/MouseInput';
import { InputRelationship } from '../../input/interfaces/InputRelationship';
import { InputSchema } from '../../input/interfaces/InputSchema';
import { DefaultInput } from '../shared/DefaultInput';
import { updateCharacterState } from "./behaviors/updateCharacterState";
import { interact } from "../../interaction/behaviors/interact";
import {
  handleOnScreenGamepadButton,
  handleOnScreenGamepadMovement
} from "../../input/behaviors/handleOnScreenJoystick";
import { moveByInputAxis } from "./behaviors/move";
import { InputType } from "../../input/enums/InputType";
import { setLocalMovementDirection } from "./behaviors/setLocalMovementDirection";

export const CharacterInputSchema: InputSchema = {
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
  // When the input component is added or removed, the system will bind/unbind these events to the DOM
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
        args: {
          value: DefaultInput.SCREENXY
        }
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

    // Touch
    touchstart: [
      {
        behavior: handleTouch,
        args: {
          value: BinaryValue.ON
        }
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
        behavior: handleGamepadConnected
      }
    ],
    gamepaddisconnected: [
      {
        behavior: handleGamepadDisconnected
      }
    ],
    // mobile onscreen gamepad
    stickmove: [
      {
        behavior: handleOnScreenGamepadMovement
      }
    ],
    mobilegamepadbuttondown: [
      {
        behavior: handleOnScreenGamepadButton,
        args: {
          value: BinaryValue.ON
        }
      }
    ],
    mobilegamepadbuttonup: [
      {
        behavior: handleOnScreenGamepadButton,
        args: {
          value: BinaryValue.OFF
        }
      }
    ]
  },
  // Map mouse buttons to abstract input
  mouseInputMap: {
    buttons: {
      [MouseInput.LeftButton]: DefaultInput.PRIMARY,
      [MouseInput.RightButton]: DefaultInput.SECONDARY,
      [MouseInput.MiddleButton]: DefaultInput.INTERACT
    },
    axes: {
      [MouseInput.MouseMovement]: DefaultInput.MOUSE_MOVEMENT,
      [MouseInput.MousePosition]: DefaultInput.SCREENXY,
      [MouseInput.MouseClickDownPosition]: DefaultInput.SCREENXY_START,
      [MouseInput.MouseClickDownTransformRotation]: DefaultInput.ROTATION_START
    }
  },
  // Map gamepad buttons to abstract input
  gamepadInputMap: {
    buttons: {
      [GamepadButtons.A]: DefaultInput.JUMP,
      [GamepadButtons.B]: DefaultInput.CROUCH, // B - back
      [GamepadButtons.X]: DefaultInput.SPRINT, // X - secondary input
      [GamepadButtons.Y]: DefaultInput.INTERACT, // Y - tertiary input
      // 4: DefaultInput.DEFAULT, // LB
      // 5: DefaultInput.DEFAULT, // RB
      // 6: DefaultInput.DEFAULT, // LT
      // 7: DefaultInput.DEFAULT, // RT
      // 8: DefaultInput.DEFAULT, // Back
      // 9: DefaultInput.DEFAULT, // Start
      // 10: DefaultInput.DEFAULT, // LStick
      // 11: DefaultInput.DEFAULT, // RStick
      [GamepadButtons.DPad1]: DefaultInput.FORWARD, // DPAD 1
      [GamepadButtons.DPad2]: DefaultInput.BACKWARD, // DPAD 2
      [GamepadButtons.DPad3]: DefaultInput.LEFT, // DPAD 3
      [GamepadButtons.DPad4]: DefaultInput.RIGHT // DPAD 4
    },
    axes: {
      [Thumbsticks.Left]: DefaultInput.MOVEMENT_PLAYERONE,
      [Thumbsticks.Right]: DefaultInput.LOOKTURN_PLAYERONE
    }
  },
  // Map keyboard buttons to abstract input
  keyboardInputMap: {
    w: DefaultInput.FORWARD,
    a: DefaultInput.LEFT,
    s: DefaultInput.BACKWARD,
    d: DefaultInput.RIGHT,
    e: DefaultInput.INTERACT,
    ' ': DefaultInput.JUMP,
    p: DefaultInput.POINTER_LOCK
  },
  // Map how inputs relate to each other
  inputRelationships: {
    [DefaultInput.FORWARD]: { opposes: [DefaultInput.BACKWARD] } as InputRelationship,
    [DefaultInput.BACKWARD]: { opposes: [DefaultInput.FORWARD] } as InputRelationship,
    [DefaultInput.LEFT]: { opposes: [DefaultInput.RIGHT] } as InputRelationship,
    [DefaultInput.RIGHT]: { opposes: [DefaultInput.LEFT] } as InputRelationship,
    [DefaultInput.JUMP]: {} as InputRelationship
  },
  // "Button behaviors" are called when button input is called (i.e. not axis input)
  inputButtonBehaviors: {
    [DefaultInput.POINTER_LOCK]: {
        started: [
          {
            behavior: cameraPointerLock,
            args: {}
          }
        ]
    },
    [DefaultInput.INTERACT]: {
      ended: [
        {
          behavior: interact,
          args: {}
        }
      ]
    },
    [DefaultInput.JUMP]: {
        started: [
          {
            behavior: updateCharacterState,
            args: {}
          }
        ],
      ended: [
        {
          behavior: updateCharacterState,
          args: {}
        }
      ]
    },
    [DefaultInput.FORWARD]: {
        started: [
          {
            behavior: setLocalMovementDirection,
            args: {
              z: 1
            }
          }
        ],
        continued: [
          {
            behavior: setLocalMovementDirection,
            args: {
              z: 1
            }
          }
        ],
      ended: [
        {
          behavior: setLocalMovementDirection,
          args: {
            z: 0
          }
        },
        {
          behavior: updateCharacterState,
          args: {}
        }
      ]
    },
    [DefaultInput.BACKWARD]: {
        started: [
          {
            behavior: setLocalMovementDirection,
            args: {
              z: -1
            }
          }
        ],
        continued: [
          {
            behavior: setLocalMovementDirection,
            args: {
              z: -1
            }
          }
        ],
      ended: [
        {
          behavior: setLocalMovementDirection,
          args: {
            z: 0
          }
        },
        {
          behavior: updateCharacterState,
          args: {}
        }
      ]
    },
    [DefaultInput.LEFT]: {
        started: [
          {
            behavior: setLocalMovementDirection,
            args: {
              x: 1
            }
          }
        ],
        continued: [
          {
            behavior: setLocalMovementDirection,
            args: {
              x: 1
            }
          }
        ],
      ended: [
        {
          behavior: setLocalMovementDirection,
          args: {
            x: 0
          }
        },
        {
          behavior: updateCharacterState,
          args: {}
        }
      ]
    },
    [DefaultInput.RIGHT]: {
        started: [
          {
            behavior: setLocalMovementDirection,
            args: {
              x: -1
            }
          }
        ],
        continued: [
          {
            behavior: setLocalMovementDirection,
            args: {
              x: -1
            }
          }
        ],
      ended: [
        {
          behavior: setLocalMovementDirection,
          args: {
            x: 0
          }
        },
        {
          behavior: updateCharacterState,
          args: {}
        }
      ]
    }
  },
  // Axis behaviors are called by continuous input and map to a scalar, vec2 or vec3
  inputAxisBehaviors: {
    [DefaultInput.MOVEMENT_PLAYERONE]: {
      started: [
        {
          behavior: moveByInputAxis,
          args: {
            input: DefaultInput.MOVEMENT_PLAYERONE,
            inputType: InputType.TWODIM
          }
        }
      ],
      changed: [
        {
          behavior: moveByInputAxis,
          args: {
            input: DefaultInput.MOVEMENT_PLAYERONE,
            inputType: InputType.TWODIM
          }
        },
        {
          behavior: updateCharacterState,
          args: {
            setCameraRelativeOrientationTarget: true
          }
        }
      ]
    }
  }
};
