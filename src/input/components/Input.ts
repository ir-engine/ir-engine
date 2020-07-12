// Should be a singleton, we only need one in our world

import { Component, Types } from "ecsy"
import DefaultInputActionTable from "../defaults/DefaultInputMap"
import InputData from "../interfaces/InputData"

export default interface InputProps {
  inputMap: InputData
  connected: boolean
  threshold: number
  buttons: boolean[]
  axes: number[]
  downHandler: any
  moveHandler: any
  upHandler: any
}

export default class Input extends Component<InputProps> {
  inputMap: InputData
  connected: boolean
  threshold: number
  buttons: boolean[]
  axes: number[]
  downHandler: any
  moveHandler: any
  upHandler: any
}

Input.schema = {
  inputMap: { type: Types.Ref, default: DefaultInputActionTable },
  data: { type: Types.Ref, default: DefaultInputActionTable },
  connected: { type: Types.Boolean, default: false },
  threshold: { type: Types.Number, default: 0.1 },
  buttons: { type: Types.Array, default: [] },
  axes: { type: Types.Array, default: [] },
  downHandler: { type: Types.Ref },
  moveHandler: { type: Types.Ref },
  upHandler: { type: Types.Ref }
}
