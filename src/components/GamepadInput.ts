import { Component, Types } from "ecsy"
import GamepadInputState from "../interfaces/GamepadInputState"

export default class GamepadInput extends Component<GamepadInputState> {
  connected: boolean
  axis_threshold: any
  dpadOneAxisX: number
  dpadTwoAxisX: number
  dpadOneAxisY: number
  dpadTwoAxisY: number
  buttonA: import("../enums/ActionState").default
  buttonB: import("../enums/ActionState").default
  buttonX: import("../enums/ActionState").default
  buttonY: import("../enums/ActionState").default
}

GamepadInput.schema = {
  axis_threshold: { type: Types.Number, default: 0.1 },
  connected: { type: Types.Boolean, default: false },
  dpadOneAxisY: { type: Types.Number },
  dpadOneAxisX: { type: Types.Number },
  dpadTwoAxisY: { type: Types.Number },
  dpadTwoAxisX: { type: Types.Number },
  buttonA: { type: Types.Boolean },
  buttonB: { type: Types.Boolean },
  buttonX: { type: Types.Boolean },
  buttonY: { type: Types.Boolean }
}
