import DefaultActions from "./DefaultActions"
import DefaultAxes from "./DefaultAxes"
import InputActionTable from "../interfaces/InputActionTable"
import ActionRules from "../interfaces/ActionMapping"

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
