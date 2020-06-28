import ActionState from "../enums/ActionState"

export interface MouseInputState {
  mouseButtonLeft: ActionState
  mouseButtonMiddle: ActionState
  mouseButtonScrollUp: ActionState
  mouseButtonScrollDown: ActionState
  mouseButtonRight: ActionState
  mousePosition: { x: number; y: number }
}
