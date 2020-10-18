import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { State } from '../components/State';
import { StateAlias } from '../types/StateAlias';
import { getComponent } from '../../ecs/functions/EntityFunctions';


export const removeState: Behavior = (entity: Entity, args: { state: StateAlias; }): void => {
  // check state group
  const stateComponent = getComponent(entity, State);
  if (stateComponent.data.has(args.state)) {
    stateComponent.data.delete(args.state);
  }
};
