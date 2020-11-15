import { LifecycleValue } from '../../common/enums/LifecycleValue';
import { Behavior } from '../../common/interfaces/Behavior';
import { NumericalType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { Input } from '../components/Input';
import { InputType } from '../enums/InputType';
import { InputValue } from '../interfaces/InputValue';
import { InputAlias } from '../types/InputAlias';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';

export const cleanupInput: Behavior = (entity: Entity, args: { }) => {
  const input = getMutableComponent(entity, Input);

  // clean processed LifecycleValue.ENDED inputs
  input.data.forEach((value: InputValue<NumericalType>, key: InputAlias) => {
    if (value.type === InputType.BUTTON) {
      if (value.lifecycleState === LifecycleValue.ENDED) {
        input.data.delete(key);
      }
    }
  });
};
