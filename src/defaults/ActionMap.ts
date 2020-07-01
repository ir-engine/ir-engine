import IActionMap from "../interfaces/IActionMapping"
import ActionType from "../../common/src/action/enums/InputActionType"
import ActionMapType from "../types/ActionMapType"

export const ActionMap: ActionMapType = {
  [ActionType.FORWARD]: { opposes: [ActionType.BACKWARD] } as IActionMap,
  [ActionType.BACKWARD]: { opposes: [ActionType.FORWARD] } as IActionMap,
  [ActionType.LEFT]: { opposes: [ActionType.RIGHT] } as IActionMap,
  [ActionType.RIGHT]: { opposes: [ActionType.LEFT] } as IActionMap
}
