import { LifecycleValue } from '../../common/enums/LifecycleValue';
import { NumericalType } from '../../common/types/NumericalTypes';
import { InputType } from '../enums/InputType';

export interface InputValue<T extends NumericalType> {
  type: InputType; // How many dimensions? Button, 2D?
  value: T; // What's the value? Binary, scalar, vector
  lifecycleState?: LifecycleValue;
}
