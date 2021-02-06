import { BehaviorComponent } from '../../common/components/BehaviorComponent';
import { NumericalType } from '../../common/types/NumericalTypes';
import { StateSchema } from '../interfaces/StateSchema';
import { StateValue } from '../interfaces/StateValue';
import { StateAlias } from '../types/StateAlias';
export declare class State extends BehaviorComponent<StateAlias, StateSchema, StateValue<NumericalType>> {
    timer: number;
}
