import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { State } from '../components/State';
import { StateAlias } from '../types/StateAlias';
import { getComponent } from '../../ecs/functions/EntityFunctions';

export const hasState: Behavior = (entity: Entity, args: { state: StateAlias }): boolean => {
  // check state group
  return !!getComponent(entity, State)?.data.has(args.state)
};
