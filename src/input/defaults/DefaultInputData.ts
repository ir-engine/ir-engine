import { DefaultAxes } from "../../axis/defaults/DefaultAxisData"
import InputMap from "../interfaces/InputMap"
import { handleMouseButton, handleMouseMovement } from "../behaviors/DesktopInputBehaviors"
import BinaryValue from "../../common/enums/BinaryValue"
import { handleKey } from "../behaviors/DesktopInputBehaviors"
import { GamepadButtons } from "../enums/GamepadButtons"
import { Thumbsticks } from "../../common/enums/Thumbsticks"
import { preventDefault } from "../../common/utils/preventDefault"
import { disableScroll, enableScroll } from "../../common/utils/EnableDisableScrolling"
import { handleGamepadConnected, handleGamepadDisconnected } from "../behaviors/GamepadInputBehaviors"

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
        value: DefaultAxes.SCREENXY
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
  mouseAxisMap: {
    buttons: {
      [MouseButtons.LeftButton]: DefaultAxes.PRIMARY,
      [MouseButtons.RightButton]: DefaultAxes.SECONDARY,
      [MouseButtons.MiddleButton]: DefaultAxes.INTERACT
    },
    axes: {
      mousePosition: DefaultAxes.SCREENXY
    }
  },
  gamepadAxisMap: {
    buttons: {
      [GamepadButtons.A]: DefaultAxes.JUMP,
      [GamepadButtons.B]: DefaultAxes.CROUCH, // B - back
      [GamepadButtons.X]: DefaultAxes.SPRINT, // X - secondary axis
      [GamepadButtons.Y]: DefaultAxes.INTERACT, // Y - tertiary axes
      // 4: DefaultAxes.DEFAULT, // LB
      // 5: DefaultAxes.DEFAULT, // RB
      // 6: DefaultAxes.DEFAULT, // LT
      // 7: DefaultAxes.DEFAULT, // RT
      // 8: DefaultAxes.DEFAULT, // Back
      // 9: DefaultAxes.DEFAULT, // Start
      // 10: DefaultAxes.DEFAULT, // LStick
      // 11: DefaultAxes.DEFAULT, // RStick
      [GamepadButtons.DPad1]: DefaultAxes.FORWARD, // DPAD 1
      [GamepadButtons.DPad2]: DefaultAxes.BACKWARD, // DPAD 2
      [GamepadButtons.DPad3]: DefaultAxes.LEFT, // DPAD 3
      [GamepadButtons.DPad4]: DefaultAxes.RIGHT // DPAD 4
    },
    axes: {
      [Thumbsticks.Left]: DefaultAxes.MOVEMENT_PLAYERONE,
      [Thumbsticks.Right]: DefaultAxes.LOOKTURN_PLAYERONE
    }
  },
  keyboardAxisMap: {
    w: DefaultAxes.FORWARD,
    a: DefaultAxes.LEFT,
    s: DefaultAxes.RIGHT,
    d: DefaultAxes.BACKWARD,
    [" "]: DefaultAxes.JUMP,
    shift: DefaultAxes.CROUCH
  }
}
