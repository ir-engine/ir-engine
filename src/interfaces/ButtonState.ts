import ActionValues from "../enums/ActionValues"

export default interface ButtonState {
  current: ActionValues
  prev: ActionValues
  changed: boolean
}
