import ActionMapping from "../interfaces/ActionMapping"
import ActionType from "./DefaultActionType"
import IActionMap from "../interfaces/ActionMap"

export const ActionMap: IActionMap = {
  [ActionType.FORWARD]: { opposes: [ActionType.BACKWARD] } as ActionMapping,
  [ActionType.BACKWARD]: { opposes: [ActionType.FORWARD] } as ActionMapping,
  [ActionType.LEFT]: { opposes: [ActionType.RIGHT] } as ActionMapping,
  [ActionType.RIGHT]: { opposes: [ActionType.LEFT] } as ActionMapping
}

export default ActionMap
