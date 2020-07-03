import Actions from "./DefaultActions"
import Axes from "./DefaultAxes"
import InputMap from "../interfaces/InputMap"
import ActionMapping from "../interfaces/ActionMapping"

export const DefaultInputMap: InputMap = {
  mouse: {
    actions: {
      0: Actions.PRIMARY,
      2: Actions.SECONDARY, // Right mouse
      1: Actions.INTERACT // Middle Mouse button
    },
    axes: {
      mousePosition: Axes.SCREENXY
    }
  },
  keyboard: {
    actions: {
      w: Actions.FORWARD,
      a: Actions.LEFT,
      s: Actions.RIGHT,
      d: Actions.BACKWARD
    }
  },
  actionMap: {
    [Actions.FORWARD]: { opposes: [Actions.BACKWARD] } as ActionMapping,
    [Actions.BACKWARD]: { opposes: [Actions.FORWARD] } as ActionMapping,
    [Actions.LEFT]: { opposes: [Actions.RIGHT] } as ActionMapping,
    [Actions.RIGHT]: { opposes: [Actions.LEFT] } as ActionMapping,
    [Actions.CROUCH]: { blockedBy: [Actions.JUMP, Actions.SPRINT] } as ActionMapping,
    [Actions.JUMP]: { overrides: [Actions.CROUCH] } as ActionMapping,
    [Actions.SPRINT]: { blockedBy: [Actions.JUMP], overrides: [Actions.CROUCH] } as ActionMapping,
    [Actions.WALK]: { blockedBy: [Actions.JUMP, Actions.SPRINT], overrides: [Actions.CROUCH] } as ActionMapping,
    [Actions.INTERACT]: { blockedBy: [Actions.JUMP] } as ActionMapping
  }
}
export default DefaultInputMap
