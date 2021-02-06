import { LifecycleValue } from '../../common/enums/LifecycleValue';
import { NumericalType } from '../../common/types/NumericalTypes';
import { InputType } from '../enums/InputType';
export interface InputValue<T extends NumericalType> {
    type: InputType;
    value: T;
    lifecycleState?: LifecycleValue;
}
