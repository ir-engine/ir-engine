import ActionMapping from "../interfaces/ActionMapping"
import Actions from "./DefaultActions"
import IActionMap from "../interfaces/ActionMap"

export const ActionMap: IActionMap = {
  [Actions.FORWARD]: { opposes: [Actions.BACKWARD] } as ActionMapping,
  [Actions.BACKWARD]: { opposes: [Actions.FORWARD] } as ActionMapping,
  [Actions.LEFT]: { opposes: [Actions.RIGHT] } as ActionMapping,
  [Actions.RIGHT]: { opposes: [Actions.LEFT] } as ActionMapping
}

export default ActionMap
