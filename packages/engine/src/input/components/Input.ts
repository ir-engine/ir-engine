import { BehaviorComponent } from '../../common/components/BehaviorComponent';
import { NumericalType } from '../../common/types/NumericalTypes';
import { InputSchema } from '../interfaces/InputSchema';
import { InputValue } from '../interfaces/InputValue';
import { InputAlias } from '../types/InputAlias';

export class Input extends BehaviorComponent<InputAlias, InputSchema, InputValue<NumericalType>> {
  prevData: Map<InputAlias, InputValue<NumericalType>>

  constructor() {
    super();
    this.prevData = new Map();
  }

  reset(): void {
    super.reset();
    this.prevData.clear();
  }
}

/**
 * Set schema to itself
 */
Input._schema = {
  ...Input._schema,
};
