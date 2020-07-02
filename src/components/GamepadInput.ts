import { Component, Types } from "ecsy"
import LifecycleValue from "../enums/LifecycleValue"
import Axis2D from "../interfaces/Axis2D"

export default interface GamepadInputPropTypes {
  connected: boolean
  threshold: number
  dpadOne: Axis2D
  dpadTwo: Axis2D
  buttonA: LifecycleValue
  buttonB: LifecycleValue
  buttonX: LifecycleValue
  buttonY: LifecycleValue
}

export default class GamepadInput extends Component<GamepadInputPropTypes> {
  connected: boolean
  threshold: number
  dpadOne: Axis2D
  dpadTwo: Axis2D
  buttonA: LifecycleValue
  buttonB: LifecycleValue
  buttonX: LifecycleValue
  buttonY: LifecycleValue
}

GamepadInput.schema = {
  threshold: { type: Types.Number, default: 0.1 },
  connected: { type: Types.Boolean, default: false },
  dpadOne: { type: Types.Number }, // TODO: Fix this
  dpadTwo: { type: Types.Number },
  buttonA: { type: Types.Boolean },
  buttonB: { type: Types.Boolean },
  buttonX: { type: Types.Boolean },
  buttonY: { type: Types.Boolean }
}
