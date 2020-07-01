import ActionType from "../../common/src/action/enums/InputActionType"
import AxisType from "../../common/src/axis/enums/AxisType"

export const MouseInputActionMap = {
  0: ActionType.PRIMARY,
  2: ActionType.SECONDARY, // Right mouse
  1: ActionType.INTERACT // Middle Mouse button
}

export const MouseInputAxisMap = {
  mousePosition: AxisType.SCREENXY
}
