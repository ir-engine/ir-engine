import { Component, Types } from "ecsy"
import { MouseInputActionMap, MouseInputAxisMap } from "../defaults/DefaultMouseInputMap"
import ActionMap from "../interfaces/ActionMap"
import AxisMap from "../interfaces/AxisMap"

export interface MouseInputPropTypes {
  actionMap: ActionMap
  axisMap: AxisMap
  downHandler: any
  moveHandler: any
  upHandler: any
}

export default class MouseInput extends Component<MouseInputPropTypes> {
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
