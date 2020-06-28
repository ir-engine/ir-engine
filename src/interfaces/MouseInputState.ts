import ActionValues from "../enums/ActionValues"

export interface MouseInputState {
  mouseButtonLeft: ActionValues
  mouseButtonMiddle: ActionValues
  mouseButtonScrollUp: ActionValues
  mouseButtonScrollDown: ActionValues
  mouseButtonRight: ActionValues
  mousePosition: { x: number; y: number }
}
