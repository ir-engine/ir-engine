import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Entity } from '../../../ecs/classes/Entity';
import { DefaultInput } from '../../shared/DefaultInput';
import { Input } from '../../../input/components/Input';

export const isMoving = (entity: Entity): boolean => {
  const inputData = getComponent(entity, Input).data;
  if (inputData.size == 0)
    return false; // No attempt to move, so return
  if (inputData.has(DefaultInput.FORWARD) ||
    inputData.has(DefaultInput.BACKWARD) ||
    inputData.has(DefaultInput.LEFT) ||
    inputData.has(DefaultInput.RIGHT))
    return true;
  else
    return false;
};
