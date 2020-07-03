import Actions from "./DefaultActions"
import Axes from "./DefaultAxes"

export const MouseInputActionMap = {
  0: Actions.PRIMARY,
  2: Actions.SECONDARY, // Right mouse
  1: Actions.INTERACT // Middle Mouse button
}

export const MouseInputAxisMap = {
  mousePosition: Axes.SCREENXY
}
