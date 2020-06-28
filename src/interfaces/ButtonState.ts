import ActionState from "../enums/ActionState"

export default interface ButtonState {
  current: ActionState
  prev: ActionState
  changed: boolean
}
