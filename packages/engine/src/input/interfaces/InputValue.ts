import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { NumericalType } from '../../common/types/NumericalTypes'
import { InputType } from '../enums/InputType'

export interface InputValue {
  type: InputType // How many dimensions? Button, 2D?
  value: NumericalType // What's the value? Binary, scalar, vector
  lifecycleState: keyof typeof LifecycleValue
}
