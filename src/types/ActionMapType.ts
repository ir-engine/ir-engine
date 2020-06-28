import ActionType from "../enums/ActionType"
import ActionMapping from "../interfaces/ActionMapping"

type ActionMapType = {
  [key in ActionType]?: ActionMapping
}

export default ActionMapType
