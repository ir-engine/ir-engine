import { getComponent } from '../../../ecs/functions/EntityFunctions';
import { Entity } from '../../../ecs/classes/Entity';
import { DefaultInput } from '../../shared/DefaultInput';
import { Input } from '../../../input/components/Input';
import { CharacterComponent } from "../components/CharacterComponent";

export const isMoving = (entity: Entity): boolean => {
  const { localMovementDirection } = getComponent(entity, CharacterComponent);
  return localMovementDirection.length() > 0;
};
