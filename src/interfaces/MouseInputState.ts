import ButtonAction from "../enums/ButtonAction"

export interface MouseInputState {
  mouseButtonLeft: ButtonAction
  mouseButtonMiddle: ButtonAction
  mouseButtonScrollUp: ButtonAction
  mouseButtonScrollDown: ButtonAction
  mouseButtonRight: ButtonAction
  mousePosition: { x: number; y: number }
}
