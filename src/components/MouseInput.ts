import { Component, Types } from "ecsy"
import { MousePositionType } from "../types/MousePositionType"
import { TemporalButtonStateType } from "../types/TemporalButtonStateType"
import Vector2 from "../interfaces/Vector2"
import ButtonState from "../interfaces/ButtonState"
import { MouseInputState } from "../interfaces/MouseInputState"

export default class MouseInput extends Component<MouseInputState> {
  mouseButtonLeft: ButtonState
  mouseButtonMiddle: ButtonState
  mouseButtonRight: ButtonState
  mousePosition: Vector2
  downHandler: any
  moveHandler: any
  upHandler: any
  lastMovementTimestamp: number
  lastTimestamp: number
}

MouseInput.schema = {
  mouseButtonLeft: { type: TemporalButtonStateType },
  mouseButtonMiddle: { type: TemporalButtonStateType },
  mouseButtonRight: { type: TemporalButtonStateType },
  mousePosition: { type: MousePositionType },
  lastMovementTimestamp: { type: Types.Number },
  downHandler: { type: Types.Ref },
  moveHandler: { type: Types.Ref },
  upHandler: { type: Types.Ref }
}
