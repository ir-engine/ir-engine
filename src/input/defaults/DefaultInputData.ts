import InputMap from "../interfaces/InputMap"
import { handleMouseButton, handleMouseMovement } from "../behaviors/DesktopInputBehaviors"
import BinaryValue from "../../common/enums/BinaryValue"
import { handleKey } from "../behaviors/DesktopInputBehaviors"
import { GamepadButtons } from "../enums/GamepadButtons"
import { Thumbsticks } from "../../common/enums/Thumbsticks"
import { preventDefault } from "../../common/utils/preventDefault"
import { disableScroll, enableScroll } from "../../common/utils/EnableDisableScrolling"
import { handleGamepadConnected, handleGamepadDisconnected } from "../behaviors/GamepadInputBehaviors"
import { addState, removeState } from "../../state/behaviors/StateBehaviors"
import { InputType } from "../enums/InputType"
import InputRelationshipMapping from "../interfaces/InputRelationshipMapping"
import { DefaultStateTypes } from "../../state/defaults/DefaultStateTypes"
import { move } from "../../common/defaults/behaviors/move"
import { updateMovementState } from "../../common/defaults/behaviors/updateMovementState"
import { MouseButtons } from "../enums/MouseButtons"
import { jump } from "../../common/defaults/behaviors/jump"
import { rotateAround } from "../../common/defaults/behaviors/rotate"
import { rotateStart } from "../../common/defaults/behaviors/updateLookingState"

import { DefaultInput } from './DefaultInput'

export const DefaultInputMap: InputMap = {
  // When an Input component is added, the system will call this array of behaviors
  onAdded: [
    {
      behavior: disableScroll
      // args: { }
    }
  ],
  // When an Input component is removed, the system will call this array of behaviors
  onRemoved: [
    {
      behavior: enableScroll
      // args: { }
    }
  ],
  // When the input component is added or removed, the system will bind/unbind these events to the DOM
  eventBindings: {
    // Mouse
    ["contextmenu"]: {
      behaviors: [
        {
          behavior: preventDefault
        }
      ]
    },
    ["mousemove"]: {
      behaviors: [
        {      
          behavior: handleMouseMovement,
          args: {
            value: DefaultInput.SCREENXY
          }
        }
      ]
    },
    ["mouseup"]: {
      behaviors: [
        {  
          behavior: handleMouseButton,
          args: {
            value: BinaryValue.OFF
          }
        }
      ]
    },
    ["mousedown"]: {
      behaviors: [
        {      
          behavior: handleMouseButton,
          args: {
            value: BinaryValue.ON
          }
        },
        {
          behavior: rotateStart,
          args: {}
        }
      ]
    },
    // Keys
    ["keyup"]: {
      behaviors: [
        {  
          behavior: handleKey,
          args: {
            value: BinaryValue.OFF
          }
        }
      ]
    },
    ["keydown"]: {
      behaviors: [
        {  
          behavior: handleKey,
          args: {
            value: BinaryValue.ON
          }
        }
      ]
    },
    // Gamepad
    ["gamepadconnected"]: {
      behaviors: [
        {  
          behavior: handleGamepadConnected
        }
      ]
    },
    ["gamepaddisconnected"]: {
      behaviors: [
        {
          behavior: handleGamepadDisconnected
        }
      ]
    }
  },
  // Map mouse buttons to abstract input
  mouseInputMap: {
    buttons: {
      [MouseButtons.LeftButton]: DefaultInput.PRIMARY,
      [MouseButtons.RightButton]: DefaultInput.SECONDARY
      // [MouseButtons.MiddleButton]: DefaultInput.INTERACT
    },
    axes: {
      mousePosition: DefaultInput.SCREENXY,
      mouseClickDownPosition: DefaultInput.SCREENXY_START,
      mouseClickDownTransformRotation: DefaultInput.ROTATION_START
    }
  },
  // Map gamepad buttons to abstract input
  gamepadInputMap: {
    buttons: {
      [GamepadButtons.A]: DefaultInput.JUMP,
      [GamepadButtons.B]: DefaultInput.CROUCH, // B - back
      // [GamepadButtons.X]: DefaultInput.SPRINT, // X - secondary input
      // [GamepadButtons.Y]: DefaultInput.INTERACT, // Y - tertiary input
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
    [" "]: DefaultInput.JUMP,
    shift: DefaultInput.CROUCH
  },
  // Map how inputs relate to each other
  inputRelationships: {
    [DefaultInput.FORWARD]: { opposes: [DefaultInput.BACKWARD] } as InputRelationshipMapping,
    [DefaultInput.BACKWARD]: { opposes: [DefaultInput.FORWARD] } as InputRelationshipMapping,
    [DefaultInput.LEFT]: { opposes: [DefaultInput.RIGHT] } as InputRelationshipMapping,
    [DefaultInput.RIGHT]: { opposes: [DefaultInput.LEFT] } as InputRelationshipMapping,
    [DefaultInput.CROUCH]: { blockedBy: [DefaultInput.JUMP, DefaultInput.SPRINT] } as InputRelationshipMapping,
    [DefaultInput.JUMP]: { overrides: [DefaultInput.CROUCH] } as InputRelationshipMapping
  },
  // "Button behaviors" are called when button input is called (i.e. not axis input)
  inputButtonBehaviors: {
    [DefaultInput.JUMP]: {
      [BinaryValue.ON]: {
        behaviors: {
          started: {
            behavior: jump,
            args: {}
          }
        }
      }
    },
    [DefaultInput.FORWARD]: {
      [BinaryValue.ON]: {
        behaviors: {
          started: {
            behavior: updateMovementState,
            args: {},
          },
          continued: {
            behavior: move,
            args: {
              inputType: InputType.TWOD,
              input: {
                value: [0, -1]
              },
              value: [0, -1]
            }
          }
        }
      },
      [BinaryValue.OFF]: {
        behaviors: {
          started: {
            behavior: updateMovementState,
            args: {},
          }
        }
      }
    },
    [DefaultInput.BACKWARD]: {
      [BinaryValue.ON]: {
        behaviors: {
          started: {
            behavior: updateMovementState,
            args: {},
          },
          continued: {
            behavior: move,
            args: {
              inputType: InputType.TWOD,
              input: {
                value: [0, 1]
              },
              value: [0, 1]
            }
          }
        }
      },
      [BinaryValue.OFF]: {
        behaviors: {
          started: {
            behavior: updateMovementState,
            args: {},
          }
        }
      }
    },
    [DefaultInput.LEFT]: {
      [BinaryValue.ON]: {
        behaviors: {
          started: {
            behavior: updateMovementState,
            args: {},
          },
          continued: {
            behavior: move,
            args: {
              inputType: InputType.TWOD,
              input: {
                value: [-1, 0]
              },
              value: [-1, 0]
            }
          }
        }
      },
      [BinaryValue.OFF]: {
        behaviors: {
          started: {
            behavior: updateMovementState,
            args: {},
          }
        }
      }
    },
    [DefaultInput.RIGHT]: {
      [BinaryValue.ON]: {
        behaviors: {
          started: {
            behavior: updateMovementState,
            args: {},
          },
          continued: {
            behavior: move,
            args: {
              inputType: InputType.TWOD,
              input: {
                value: [1, 0]
              },
              value: [1, 0]
            }
          }
        }
      },
      [BinaryValue.OFF]: {
        behaviors: {
          started: {
            behavior: updateMovementState,
            args: {},
          }
        }
      }
    },
    // [DefaultInput.CROUCH]: {
    //   [BinaryValue.ON]: {
    //     behavior: startCrouching,
    //     args: { state: DefaultStateTypes.CROUCHING }
    //   },
    //   [BinaryValue.OFF]: {
    //     behavior: stopCrouching,
    //     args: { state: DefaultStateTypes.CROUCHING }
    //   }
  },
  // Axis behaviors are called by continuous input and map to a scalar, vec2 or vec3
  inputAxisBehaviors: {
    [DefaultInput.MOVEMENT_PLAYERONE]: {
      behaviors: {
        started: {
          behavior: updateMovementState,
          args: {},
        },
        continued: {
          behavior: move,
          args: {
            input: DefaultInput.MOVEMENT_PLAYERONE,
            inputType: InputType.TWOD
          }
        }
      }
    },
    [DefaultInput.SCREENXY]: {
      behaviors: {
        started: {
          behavior: rotateAround,
          args: {
            input: DefaultInput.SCREENXY,
            inputType: InputType.TWOD
          }
        }
      }
    },
  }
}
