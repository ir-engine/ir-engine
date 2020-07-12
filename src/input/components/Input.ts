// Should be a singleton, we only need one in our world

import { Component, Types } from "ecsy"
import DefaultInputMap from "../defaults/DefaultInputMap"
import InputMap from "../interfaces/InputMap"

export default interface InputProps {
  inputMap: InputMap
  gamepadConnected: boolean
  gamepadThreshold: number
  gamepadButtons: boolean[]
  gamepadAxes: number[]
}

export default class Input extends Component<InputProps> {
  inputMap: InputMap
  gamepadConnected: boolean
  gamepadThreshold: number
  gamepadButtons: boolean[]
  gamepadAxes: number[]
}

Input.schema = {
  inputMap: { type: Types.Ref, default: DefaultInputMap },
  data: { type: Types.Ref, default: DefaultInputMap },
  gamepadConnected: { type: Types.Boolean, default: false },
  gamepadThreshold: { type: Types.Number, default: 0.1 },
  gamepadButtons: { type: Types.Array, default: [] },
  gamepadAxes: { type: Types.Array, default: [] }
}
