import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { addComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { ColliderComponent } from '../components/ColliderComponent';

export const addMeshCollider: Behavior = (entity: Entity, args: any) => {
  addComponent(entity, ColliderComponent, args);
  return entity;
};
