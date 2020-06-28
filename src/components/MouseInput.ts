import { Component, Types } from "ecsy"
import { Axis2DStateType } from "../types/Axis2DType"
import Axis2D from "../interfaces/Axis2D"
import { MouseInputState } from "../interfaces/MouseInputState"
import { MouseInputActionMap, MouseInputAxisMap } from "../maps/MouseInputMap"

export default class MouseInput extends Component<MouseInputState> {
  actionMap = MouseInputActionMap
  axisMap = MouseInputAxisMap
  screenPosition: Axis2D
  downHandler: any
  moveHandler: any
  upHandler: any
  lastMovementTimestamp: number
  lastTimestamp: number
}

MouseInput.schema = {
  inputMap: { type: Types.Ref, default: MouseInputActionMap },
  axisMap: { type: Types.Ref, default: MouseInputAxisMap },
  screenPosition: { type: Axis2DStateType },
  lastMovementTimestamp: { type: Types.Number },
  downHandler: { type: Types.Ref },
  moveHandler: { type: Types.Ref },
  upHandler: { type: Types.Ref }
}
