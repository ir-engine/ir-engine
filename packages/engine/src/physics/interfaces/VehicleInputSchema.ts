import { InputSchema } from "../../input/interfaces/InputSchema"
import { DefaultInput } from "../../input/defaults/DefaultInput"
import { disableScroll, enableScroll } from "../../common/functions/enableDisableScrolling"
import { preventDefault } from "../../common/functions/preventDefault"
import {
  handleMouseMovement,
  handleMouseButton,
  BinaryValue,
  handleKey,
  handleGamepadConnected,
  handleGamepadDisconnected,
  GamepadButtons,
  Thumbsticks,
  InputRelationship,
  InputType,
  rotateAround
} from "../.."
import { rotateStart } from "../../common/defaults/behaviors/updateLookingState"
import { drive } from "../behaviors/VehicleBehaviors"

export const VehicleInputSchema: InputSchema = {
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
    ["contextmenu"]: [
      {
        behavior: preventDefault
      }
    ],
    ["mousemove"]: [
      {
        behavior: handleMouseMovement,
        args: {
          value: DefaultInput.SCREENXY
        }
      }
    ],
    ["mouseup"]: [
      {
        behavior: handleMouseButton,
        args: {
          value: BinaryValue.OFF
        }
      }
    ],
    ["mousedown"]: [
      {
        behavior: handleMouseButton,
        args: {
          value: BinaryValue.ON
        }
      },
      {
        behavior: rotateStart
      }
    ],
    // Keys
    ["keyup"]: [
      {
        behavior: handleKey,
        args: {
          value: BinaryValue.OFF
        }
      }
    ],
    ["keydown"]: [
      {
        behavior: handleKey,
        args: {
          value: BinaryValue.ON
        }
      }
    ],
    // Gamepad
    ["gamepadconnected"]: [
      {
        behavior: handleGamepadConnected
      }
    ],
    ["gamepaddisconnected"]: [
      {
        behavior: handleGamepadDisconnected
      }
    ]
  },
  // Map mouse buttons to abstract input
  mouseInputMap: {
    axes: {
      mousePosition: DefaultInput.SCREENXY,
      mouseClickDownPosition: DefaultInput.SCREENXY_START,
      mouseClickDownTransformRotation: DefaultInput.ROTATION_START
    }
  },
  // Map gamepad buttons to abstract input
  gamepadInputMap: {
    buttons: {
      [GamepadButtons.DPad1]: DefaultInput.FORWARD, // DPAD 1
      [GamepadButtons.DPad2]: DefaultInput.BACKWARD, // DPAD 2
      [GamepadButtons.DPad3]: DefaultInput.LEFT, // DPAD 3
      [GamepadButtons.DPad4]: DefaultInput.RIGHT // DPAD 4
    },
    axes: {
      [Thumbsticks.Left]: DefaultInput.MOVEMENT_PLAYERONE,
      [Thumbsticks.Right]: DefaultInput.SCREENXY
    }
  },
  // Map keyboard buttons to abstract input
  keyboardInputMap: {
    w: DefaultInput.FORWARD,
    a: DefaultInput.LEFT,
    s: DefaultInput.BACKWARD,
    d: DefaultInput.RIGHT
  },
  // Map how inputs relate to each other
  inputRelationships: {
    [DefaultInput.FORWARD]: { opposes: [DefaultInput.BACKWARD] } as InputRelationship,
    [DefaultInput.BACKWARD]: { opposes: [DefaultInput.FORWARD] } as InputRelationship,
    [DefaultInput.LEFT]: { opposes: [DefaultInput.RIGHT] } as InputRelationship,
    [DefaultInput.RIGHT]: { opposes: [DefaultInput.LEFT] } as InputRelationship
  },
  // "Button behaviors" are called when button input is called (i.e. not axis input)
  inputButtonBehaviors: {
    [DefaultInput.FORWARD]: {
      [BinaryValue.ON]: {
        started: [
          {
            behavior: drive,
            args: {
              inputType: InputType.TWOD,
              value: [0, -1]
            }
          }
        ],
        continued: [
          {
            behavior: drive,
            args: {
              inputType: InputType.TWOD,
              value: [0, -1]
            }
          }
        ]
      }
    },
    [DefaultInput.BACKWARD]: {
      [BinaryValue.ON]: {
        started: [
          {
            behavior: drive,
            args: {
              inputType: InputType.TWOD,
              value: [0, 1]
            }
          }
        ],
        continued: [
          {
            behavior: drive,
            args: {
              inputType: InputType.TWOD,
              value: [0, 1]
            }
          }
        ]
      }
    },
    [DefaultInput.LEFT]: {
      [BinaryValue.ON]: {
        started: [
          {
            behavior: drive,
            args: {
              inputType: InputType.TWOD,
              value: [-1, 0]
            }
          }
        ],
        continued: [
          {
            behavior: drive,
            args: {
              inputType: InputType.TWOD,
              input: {
                value: [-1, 0]
              },
              value: [-1, 0]
            }
          }
        ]
      }
    },
    [DefaultInput.RIGHT]: {
      [BinaryValue.ON]: {
        started: [
          {
            behavior: drive,
            args: {
              inputType: InputType.TWOD,
              value: [1, 0]
            }
          }
        ],
        continued: [
          {
            behavior: drive,
            args: {
              inputType: InputType.TWOD,
              value: [1, 0]
            }
          }
        ]
      }
    }
  },
  // Axis behaviors are called by continuous input and map to a scalar, vec2 or vec3
  inputAxisBehaviors: {
    [DefaultInput.MOVEMENT_PLAYERONE]: {
      started: [
        {
          behavior: drive,
          args: {
            input: DefaultInput.MOVEMENT_PLAYERONE,
            inputType: InputType.TWOD
          }
        }
      ],
      continued: [
        {
          behavior: drive,
          args: {
            input: DefaultInput.MOVEMENT_PLAYERONE,
            inputType: InputType.TWOD
          }
        }
      ]
    },
    [DefaultInput.SCREENXY]: {
      started: [
        {
          behavior: rotateAround,
          args: {
            input: DefaultInput.SCREENXY,
            inputType: InputType.TWOD
          }
        }
      ]
    }
  }
}
