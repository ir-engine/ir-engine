import { Component, Types } from "ecsy"
import GamepadInputState from "../interfaces/GamepadInputState"

export default class GamepadInput extends Component<GamepadInputState> {
  connected: boolean
  axis_threshold: any
  dpadOneAxisX: number
  dpadTwoAxisX: number
  dpadOneAxisY: number
  dpadTwoAxisY: number
  buttonA: import("../../common/src/common/enums/Lifecycle").default
  buttonB: import("../../common/src/common/enums/Lifecycle").default
  buttonX: import("../../common/src/common/enums/Lifecycle").default
  buttonY: import("../../common/src/common/enums/Lifecycle").default
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
