import DefaultActions from "./DefaultActions"
import DefaultAxes from "./DefaultAxes"
import InputActionTable from "../interfaces/InputActionTable"
import ActionRules from "../interfaces/ActionRules"

export const DefaultInputActionTable: InputActionTable = {
  mouse: {
    actions: {
      0: DefaultActions.PRIMARY,
      2: DefaultActions.SECONDARY, // Right mouse
      1: DefaultActions.INTERACT // Middle Mouse button
    },
    axes: {
      mousePosition: DefaultAxes.SCREENXY
    }
  },
  keyboard: {
    actions: {
      w: DefaultActions.FORWARD,
      a: DefaultActions.LEFT,
      s: DefaultActions.RIGHT,
      d: DefaultActions.BACKWARD,
      [" "]: DefaultActions.JUMP,
      shift: DefaultActions.CROUCH
    }
  },
  gamepad: {
    actions: {
      0: DefaultActions.JUMP, // A - primary action
      1: DefaultActions.CROUCH, // B - back
      2: DefaultActions.SPRINT, // X - secondary action
      3: DefaultActions.INTERACT, // Y - tertiary actions
      // 4: DefaultActions.DEFAULT, // LB
      // 5: DefaultActions.DEFAULT, // RB
      // 6: DefaultActions.DEFAULT, // LT
      // 7: DefaultActions.DEFAULT, // RT
      // 8: DefaultActions.DEFAULT, // Back
      // 9: DefaultActions.DEFAULT, // Start
      // 10: DefaultActions.DEFAULT, // LStick
      // 11: DefaultActions.DEFAULT, // RStick
      12: DefaultActions.FORWARD, // DPAD 1
      13: DefaultActions.BACKWARD, // DPAD 2
      14: DefaultActions.LEFT, // DPAD 3
      15: DefaultActions.RIGHT // DPAD 4
    },
    axes: {
      0: DefaultAxes.MOVEMENT_PLAYERONE,
      1: DefaultAxes.LOOKTURN_PLAYERONE
    }
  },
  rules: {
    [DefaultActions.FORWARD]: { opposes: [DefaultActions.BACKWARD] } as ActionRules,
    [DefaultActions.BACKWARD]: { opposes: [DefaultActions.FORWARD] } as ActionRules,
    [DefaultActions.LEFT]: { opposes: [DefaultActions.RIGHT] } as ActionRules,
    [DefaultActions.RIGHT]: { opposes: [DefaultActions.LEFT] } as ActionRules,
    [DefaultActions.CROUCH]: { blockedBy: [DefaultActions.JUMP, DefaultActions.SPRINT] } as ActionRules,
    [DefaultActions.JUMP]: { overrides: [DefaultActions.CROUCH] } as ActionRules,
    [DefaultActions.SPRINT]: { blockedBy: [DefaultActions.JUMP], overrides: [DefaultActions.CROUCH] } as ActionRules,
    [DefaultActions.WALK]: { blockedBy: [DefaultActions.JUMP, DefaultActions.SPRINT], overrides: [DefaultActions.CROUCH] } as ActionRules,
    [DefaultActions.INTERACT]: { blockedBy: [DefaultActions.JUMP] } as ActionRules
  }
}
export default DefaultInputActionTable
