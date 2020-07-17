import { Types } from "ecsy"
import InputMap from "../interfaces/InputMap"
import BehaviorComponent from "../../common/components/BehaviorComponent"
import InputAlias from "../types/InputAlias"
import InputValue from "../interfaces/InputValue"
import { Binary, Scalar, Vector2, Vector3 } from "../../common/types/NumericalTypes"

// TODO: Put gamepad data into input data map() object

// Props that don't get automatically added by the BehaviorComponent generic
export default interface InputProps {
  gamepadConnected: boolean
  gamepadThreshold: number
  gamepadButtons: Binary[]
  gamepadInput: number[]
}

// Input inherits from BehaviorComponent, which adds .map and .data
export default class Input extends BehaviorComponent<InputAlias, InputMap, InputValue<Scalar | Vector2 | Vector3>> {
  gamepadConnected: boolean
  gamepadThreshold: number
  gamepadButtons: Binary[]
  gamepadInput: number[]
}

// Set schema to itself plus gamepad data
Input.schema = {
  ...Input.schema,
  gamepadConnected: { type: Types.Boolean, default: false },
  gamepadThreshold: { type: Types.Number, default: 0.1 },
  gamepadButtons: { type: Types.Array, default: [] },
  gamepadInput: { type: Types.Array, default: [] }
}
