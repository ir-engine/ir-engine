import { Component, Types } from "ecsy"
import GamepadInputState from "../interfaces/GamepadInputState"

export default class GamepadInput extends Component<GamepadInputState> {
  connected: boolean
  axis_threshold: any
  dpadOneAxisX: number
  dpadTwoAxisX: number
  dpadOneAxisY: number
  dpadTwoAxisY: number
  buttonA: import("../enums/ActionValues").default
  buttonB: import("../enums/ActionValues").default
  buttonX: import("../enums/ActionValues").default
  buttonY: import("../enums/ActionValues").default
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
