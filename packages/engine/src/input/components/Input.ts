import { BehaviorComponent } from "../../common/components/BehaviorComponent"
import { Binary, NumericalType } from "../../common/types/NumericalTypes"
import { Types } from "../../ecs/types/Types"
import { InputSchema } from "../interfaces/InputSchema"
import { InputValue } from "../interfaces/InputValue"
import { InputAlias } from "../types/InputAlias"

// Props that don't get automatically added by the BehaviorComponent generic
export interface InputProps {
  gamepadConnected: boolean
  gamepadThreshold: number
  gamepadButtons: Binary[]
  gamepadInput: number[]
}

// Input inherits from BehaviorComponent, which adds .map and .data
export class Input extends BehaviorComponent<InputAlias, InputSchema, InputValue<NumericalType>> {
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
