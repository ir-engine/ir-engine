import ActionType from "../enums/InputActionType"
import ActionMapping from "../interfaces/InputActionMapping"

type ActionMapType = {
  [key in ActionType]?: ActionMapping
}

export default ActionMapType
