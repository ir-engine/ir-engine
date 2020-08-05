import InputSchema from "../interfaces/InputSchema"
import { handleMouseButton, handleMouseMovement } from "../behaviors/DesktopInputBehaviors"
import BinaryValue from "../../common/enums/BinaryValue"
import { handleKey } from "../behaviors/DesktopInputBehaviors"
import { GamepadButtons } from "../enums/GamepadButtons"
import { Thumbsticks } from "../../common/enums/Thumbsticks"
import { preventDefault } from "../../common/functions/preventDefault"
import { disableScroll, enableScroll } from "../../common/functions/enableDisableScrolling"
import { handleGamepadConnected, handleGamepadDisconnected } from "../behaviors/GamepadInputBehaviors"
import { InputType } from "../enums/InputType"
import InputRelationship from "../interfaces/InputRelationship"
import { move } from "../../common/defaults/behaviors/move"
import { updateMovementState } from "../../common/defaults/behaviors/updateMovementState"
import { MouseButtons } from "../enums/MouseButtons"
import { jump } from "../../common/defaults/behaviors/jump"
import { rotateAround } from "../../common/defaults/behaviors/rotate"
import { rotateStart } from "../../common/defaults/behaviors/updateLookingState"

// Abstract inputs that all input devices get mapped to
export const DefaultInput = {
  PRIMARY: 0,
  SECONDARY: 1,
  FORWARD: 2,
  BACKWARD: 3,
  UP: 4,
  DOWN: 5,
  LEFT: 6,
  RIGHT: 7,
  INTERACT: 8,
  CROUCH: 9,
  JUMP: 10,
  WALK: 11,
  RUN: 12,
  SPRINT: 13,
  SNEAK: 14,
  SCREENXY: 15, // Is this too specific, or useful?
  SCREENXY_START: 16,
  ROTATION_START: 17,
  MOVEMENT_PLAYERONE: 18,
  LOOKTURN_PLAYERONE: 19,
  MOVEMENT_PLAYERTWO: 20,
  LOOKTURN_PLAYERTWO: 21,
  ALTERNATE: 22
}

export const DefaultInputMap: InputSchema = {
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
      behavior: preventDefault
    },
    ["mousemove"]: {
      behavior: handleMouseMovement,
      args: {
        value: DefaultInput.SCREENXY
      }
    },
    ["mouseup"]: {
      behavior: handleMouseButton,
      args: {
        value: BinaryValue.OFF
      }
    },
    ["mousedown"]: {
      behavior: handleMouseButton,
      args: {
        value: BinaryValue.ON
      }
    },
    // Keys
    ["keyup"]: {
      behavior: handleKey,
      args: {
        value: BinaryValue.OFF
      }
    },
    ["keydown"]: {
      behavior: handleKey,
      args: {
        value: BinaryValue.ON
      }
    },
    // Gamepad
    ["gamepadconnected"]: {
      behavior: handleGamepadConnected
    },
    ["gamepaddisconnected"]: {
      behavior: handleGamepadDisconnected
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
    [DefaultInput.FORWARD]: { opposes: [DefaultInput.BACKWARD] } as InputRelationship,
    [DefaultInput.BACKWARD]: { opposes: [DefaultInput.FORWARD] } as InputRelationship,
    [DefaultInput.LEFT]: { opposes: [DefaultInput.RIGHT] } as InputRelationship,
    [DefaultInput.RIGHT]: { opposes: [DefaultInput.LEFT] } as InputRelationship,
    [DefaultInput.CROUCH]: { blockedBy: [DefaultInput.JUMP, DefaultInput.SPRINT] } as InputRelationship,
    [DefaultInput.JUMP]: { overrides: [DefaultInput.CROUCH] } as InputRelationship
  },
  // "Button behaviors" are called when button input is called (i.e. not axis input)
  inputButtonBehaviors: {
    [DefaultInput.JUMP]: {
      [BinaryValue.ON]: {
        behavior: jump,
        args: {}
      }
    },
    [DefaultInput.FORWARD]: {
      [BinaryValue.ON]: {
        behavior: move,
        args: {
          inputType: InputType.TWOD,
          input: {
            value: [0, -1]
          },
          value: [0, -1]
        }
      },
      [BinaryValue.OFF]: {
        behavior: updateMovementState,
        args: {}
      }
    },
    [DefaultInput.BACKWARD]: {
      [BinaryValue.ON]: {
        behavior: move,
        args: {
          inputType: InputType.TWOD,
          input: {
            value: [0, 1]
          },
          value: [0, 1]
        }
      },
      [BinaryValue.OFF]: {
        behavior: updateMovementState,
        args: {}
      }
    },
    [DefaultInput.LEFT]: {
      [BinaryValue.ON]: {
        behavior: move,
        args: {
          inputType: InputType.TWOD,
          input: {
            value: [-1, 0]
          },
          value: [-1, 0]
        }
      },
      [BinaryValue.OFF]: {
        behavior: updateMovementState,
        args: {}
      }
    },
    [DefaultInput.RIGHT]: {
      [BinaryValue.ON]: {
        behavior: move,
        args: {
          inputType: InputType.TWOD,
          input: {
            value: [1, 0]
          },
          value: [1, 0]
        }
      },
      [BinaryValue.OFF]: {
        behavior: updateMovementState,
        args: {}
      }
    }
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
      behavior: move,
      args: {
        input: DefaultInput.MOVEMENT_PLAYERONE,
        inputType: InputType.TWOD
      }
    },
    [DefaultInput.SCREENXY]: {
      behavior: rotateAround,
      args: {
        input: DefaultInput.SCREENXY,
        inputType: InputType.TWOD
      }
    },
    [DefaultInput.SCREENXY_START]: {
      behavior: rotateStart,
      args: {
        inputType: InputType.TWOD
      }
    }
  }
}
