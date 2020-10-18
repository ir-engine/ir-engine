import { BinaryValue } from '../../common/enums/BinaryValue';
import { Behavior } from '../../common/interfaces/Behavior';
import { BinaryType } from '../../common/types/NumericalTypes';
import { Entity } from '../../ecs/classes/Entity';
import { StateAlias } from '../types/StateAlias';
import { StateGroupAlias } from '../types/StateGroupAlias';
import { removeState } from './removeState';
import { addState } from './addState';

export const toggleState: Behavior = (entity: Entity, args: { value: BinaryType, stateType: StateAlias }): void => {
  if (args.value === BinaryValue.ON) addState(entity, args);
  else removeState(entity, args);
};


