import ActionType from "../enums/InputActionType"
import AxisType from "../enums/AxisType"

export const MouseInputActionMap = {
  0: ActionType.PRIMARY,
  2: ActionType.SECONDARY, // Right mouse
  1: ActionType.INTERACT // Middle Mouse button
}

export const MouseInputAxisMap = {
  mousePosition: AxisType.SCREENXY
}
