import ActionMapping from "../interfaces/ActionMapping"
import ActionType from "../enums/ActionType"
import ActionMapType from "../types/ActionMapType"

export const ActionMap: ActionMapType = {
  [ActionType.FORWARD]: { opposes: [ActionType.BACKWARD] } as ActionMapping,
  [ActionType.BACKWARD]: { opposes: [ActionType.FORWARD] } as ActionMapping,
  [ActionType.LEFT]: { opposes: [ActionType.RIGHT] } as ActionMapping,
  [ActionType.RIGHT]: { opposes: [ActionType.LEFT] } as ActionMapping
}
