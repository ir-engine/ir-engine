import ActionMapping from "../interfaces/ActionMapping"
import Actions from "./DefaultActions"
import IActionMap from "../interfaces/ActionMap"

export const ActionMap: IActionMap = {
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

export default ActionMap
