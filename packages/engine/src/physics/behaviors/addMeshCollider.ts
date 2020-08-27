import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { addComponent } from '../../ecs/functions/EntityFunctions';
import { ColliderComponent } from '../components/ColliderComponent';

export const addMeshCollider: Behavior = (entity: Entity) => {

  addComponent(entity, ColliderComponent, { type: 'box', scale: [10, 0.1, 10] });

  return entity;
};
