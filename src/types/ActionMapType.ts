import ActionType from "./ActionType"
import ActionMapping from "../interfaces/ActionMapping"

type ActionMapType = {
  [key in ActionType]?: ActionMapping
}

export default ActionMapType
