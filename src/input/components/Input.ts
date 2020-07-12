import { Types } from "ecsy"
import InputMap from "../interfaces/InputMap"
import BehaviorComponent from "../../common/components/BehaviorComponent"
import InputAlias from "../types/InputAlias"
import InputValue from "../interfaces/AxisValue"
import { Scalar, Vector2, Vector3 } from "../../common/types/NumericalTypes"
import BinaryValue from "../../common/enums/BinaryValue"

export default interface InputProps {
  gamepadConnected: boolean
  gamepadThreshold: number
  gamepadButtons: BinaryValue[]
  gamepadInput: number[]
}

export default class Input extends BehaviorComponent<InputAlias, InputMap, InputValue<Scalar | Vector2 | Vector3>> {
  gamepadConnected: boolean
  gamepadThreshold: number
  gamepadButtons: BinaryValue[]
  gamepadInput: number[]
}

Input.schema = {
  ...Input.schema,
  gamepadConnected: { type: Types.Boolean, default: false },
  gamepadThreshold: { type: Types.Number, default: 0.1 },
  gamepadButtons: { type: Types.Array, default: [] },
  gamepadInput: { type: Types.Array, default: [] }
}
