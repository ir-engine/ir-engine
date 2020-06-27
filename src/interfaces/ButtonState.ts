import ButtonAction from "../enums/ButtonAction"

export default interface ButtonState {
  current: ButtonAction
  prev: ButtonAction
  changed: boolean
}
