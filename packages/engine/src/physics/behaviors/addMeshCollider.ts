import { Behavior } from '../../common/interfaces/Behavior';
import { ColliderComponent } from '../components/Collider';
import { RigidBody } from '../../physics/components/RigidBody';
import { Entity } from '../../ecs/classes/Entity';
import { addComponent } from '../../ecs/functions/EntityFunctions';

export const addMeshCollider: Behavior = (entity: Entity) => {
  addComponent(entity, ColliderComponent, { scale: [1, 1, 1], mass: 0.2 });
  addComponent(entity, RigidBody);
  console.log(entity);
  return entity;
};
