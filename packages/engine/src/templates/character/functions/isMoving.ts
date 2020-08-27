import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Entity } from '../../../ecs/classes/Entity';
import { State } from '../../../state/components/State';
import { DefaultInput } from '../../shared/DefaultInput';

export const isMoving = (entity: Entity): boolean => {
  const stateData = getComponent(entity, State).data;
  if (stateData.size == 0)
    return false; // No attempt to move, so return
  let numberOfStates = 0;
  if (stateData.has(DefaultInput.FORWARD) ||
    stateData.has(DefaultInput.BACKWARD) ||
    stateData.has(DefaultInput.LEFT) ||
    stateData.has(DefaultInput.RIGHT))
    return true;
  else
    return false;
};
