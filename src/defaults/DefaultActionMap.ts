import IActionMap from "../interfaces/ActionMapping"
import ActionType from "./DefaultActionType"
import ActionMapType from "../types/ActionMapType"

export const ActionMap: ActionMapType = {
  [ActionType.FORWARD]: { opposes: [ActionType.BACKWARD] } as IActionMap,
  [ActionType.BACKWARD]: { opposes: [ActionType.FORWARD] } as IActionMap,
  [ActionType.LEFT]: { opposes: [ActionType.RIGHT] } as IActionMap,
  [ActionType.RIGHT]: { opposes: [ActionType.LEFT] } as IActionMap
}
