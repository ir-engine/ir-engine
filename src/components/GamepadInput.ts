import { Component, Types } from "ecsy"

export default interface GamepadInputPropTypes {
  connected: boolean
  threshold: number
}

export default class GamepadInput extends Component<GamepadInputPropTypes> {
  connected: boolean
  threshold: number
}

GamepadInput.schema = {
  connected: { type: Types.Boolean, default: false },
  threshold: { type: Types.Number, default: 0.1 }
}
