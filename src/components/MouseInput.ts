import { Component, Types } from "ecsy"
import { MouseInputState } from "../interfaces/MouseInputState"
import { MouseInputActionMap, MouseInputAxisMap } from "../defaults/DefaultMouseInputMap"

export default class MouseInput extends Component<MouseInputState> {
  actionMap = MouseInputActionMap
  axisMap = MouseInputAxisMap
  downHandler: any
  moveHandler: any
  upHandler: any
}

MouseInput.schema = {
  actionMap: { type: Types.Ref, default: MouseInputActionMap },
  axisMap: { type: Types.Ref, default: MouseInputAxisMap },
  downHandler: { type: Types.Ref },
  moveHandler: { type: Types.Ref },
  upHandler: { type: Types.Ref }
}
