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
import { mapInputToState } from "../behaviors/mapInputToState"
import { InputType } from "../enums/InputType"
import InputPriorityMapping from "../interfaces/InputPriorityMapping"
import { DefaultStateTypes } from "../../state/defaults/DefaultStateData"
import { move } from "../../common/defaults/behaviors/move"
import { debugInput } from "../behaviors/debugInput"

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
  MOVEMENT_PLAYERONE: 16,
  LOOKTURN_PLAYERONE: 17,
  MOVEMENT_PLAYERTWO: 18,
  LOOKTURN_PLAYERTWO: 19,
  ALTERNATE: 20
}

export const DefaultInputMap: InputMap = {
  onAdded: [
    {
      behavior: disableScroll
    }
  ],
  onRemoved: [
    {
      behavior: enableScroll
    }
  ],
  eventBindings: {
    ["contextmenu"]: {
      behavior: preventDefault
    },
    // Mouse
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
    ["gamepadconnected"]: {
      behavior: handleGamepadConnected
    },
    ["gamepaddisconnected"]: {
      behavior: handleGamepadDisconnected
    }
  },
  mouseInputMap: {
    buttons: {
      [MouseButtons.LeftButton]: DefaultInput.PRIMARY,
      [MouseButtons.RightButton]: DefaultInput.SECONDARY,
      [MouseButtons.MiddleButton]: DefaultInput.INTERACT
    },
    input: {
      mousePosition: DefaultInput.SCREENXY
    }
  },
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
    input: {
      [Thumbsticks.Left]: DefaultInput.MOVEMENT_PLAYERONE,
      [Thumbsticks.Right]: DefaultInput.LOOKTURN_PLAYERONE
    }
  },
  keyboardInputMap: {
    w: DefaultInput.FORWARD,
    a: DefaultInput.LEFT,
    s: DefaultInput.RIGHT,
    d: DefaultInput.BACKWARD,
    [" "]: DefaultInput.JUMP,
    shift: DefaultInput.CROUCH
  },
  buttonPriorities: {
    [DefaultInput.FORWARD]: { opposes: [DefaultInput.BACKWARD] } as InputPriorityMapping,
    [DefaultInput.BACKWARD]: { opposes: [DefaultInput.FORWARD] } as InputPriorityMapping,
    [DefaultInput.LEFT]: { opposes: [DefaultInput.RIGHT] } as InputPriorityMapping,
    [DefaultInput.RIGHT]: { opposes: [DefaultInput.LEFT] } as InputPriorityMapping,
    [DefaultInput.CROUCH]: { blockedBy: [DefaultInput.JUMP, DefaultInput.SPRINT] } as InputPriorityMapping,
    [DefaultInput.JUMP]: { overrides: [DefaultInput.CROUCH] } as InputPriorityMapping,
    [DefaultInput.SPRINT]: { blockedBy: [DefaultInput.JUMP], overrides: [DefaultInput.CROUCH] } as InputPriorityMapping,
    [DefaultInput.WALK]: { blockedBy: [DefaultInput.JUMP, DefaultInput.SPRINT], overrides: [DefaultInput.CROUCH] } as InputPriorityMapping,
    [DefaultInput.INTERACT]: { blockedBy: [DefaultInput.JUMP] } as InputPriorityMapping
  },
  inputButtonsToState: {
    [DefaultInput.JUMP]: {
      [BinaryValue.ON]: {
        behavior: addState,
        args: { state: DefaultStateTypes.JUMPING }
      }
    },
    [DefaultInput.CROUCH]: {
      [BinaryValue.ON]: {
        behavior: addState,
        args: { state: DefaultStateTypes.CROUCHING }
      },
      [BinaryValue.OFF]: {
        behavior: removeState,
        args: { state: DefaultStateTypes.CROUCHING }
      }
    },
    [DefaultInput.SPRINT]: {
      [BinaryValue.ON]: {
        behavior: addState,
        args: { state: DefaultStateTypes.SPRINTING }
      },
      [BinaryValue.OFF]: {
        behavior: removeState,
        args: { state: DefaultStateTypes.SPRINTING }
      }
    },
    inputAxesToState: {
      [DefaultInput.MOVEMENT_PLAYERONE]: {
        behavior: move,
        args: {
          input: DefaultInput.MOVEMENT_PLAYERONE,
          inputType: InputType.TWOD
        }
      },
      [DefaultInput.SCREENXY]: {
        behavior: debugInput,
        args: {
          input: DefaultInput.LOOKTURN_PLAYERONE,
          inputType: InputType.TWOD
        }
      }
    }
  }
}
