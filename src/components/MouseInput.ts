import { Component, Types } from "ecsy"
import { ButtonStateType } from "../types/ButtonStateType"
import { MousePositionType } from "../types/MousePosition"
import { ButtonState } from "../enums"
import Vector2 from "../interfaces/Vector2"

export default class MouseInput extends Component<any> {
  mouseButtonLeft: ButtonState
  mouseButtonMiddle: ButtonState
  mouseButtonRight: ButtonState
  mousePosition: Vector2
  lastMousePosition: Vector2
  downHandler: any
  moveHandler: any
  upHandler: any
  lastMovementTimestamp: number
  lastTimestamp: number
}

MouseInput.schema = {
  mouseButtonLeft: { type: ButtonStateType },
  mouseButtonMiddle: { type: ButtonStateType },
  mouseButtonRight: { type: ButtonStateType },
  mousePosition: { type: MousePositionType },
  lastMousePosition: { type: MousePositionType },
  lastMovementTimestamp: { type: Types.Number },
  downHandler: { type: Types.Ref },
  moveHandler: { type: Types.Ref },
  upHandler: { type: Types.Ref }
}
