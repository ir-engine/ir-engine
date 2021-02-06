import { LifecycleValue } from '../../common/enums/LifecycleValue';
import { NumericalType } from '../../common/types/NumericalTypes';
import { StateType } from '../enums/StateType';
import { StateAlias } from '../types/StateAlias';
import { StateGroupAlias } from '../types/StateGroupAlias';
export interface StateValue<T extends NumericalType> {
    state: StateAlias;
    type?: StateType;
    value?: T;
    group?: StateGroupAlias;
    lifecycleState: LifecycleValue;
}
