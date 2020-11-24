import { Behavior } from '../../common/interfaces/Behavior';
import { ColliderComponent } from '../components/ColliderComponent';
import { RigidBody } from '../../physics/components/RigidBody';
import { Entity } from '../../ecs/classes/Entity';
import { addComponent, removeComponent } from '../../ecs/functions/EntityFunctions';

export const addPlayerCollider: Behavior = (entity: Entity) => {
  addComponent(entity, ColliderComponent, { type: 'box', scale: [1, 1, 1], mass: 10 });
  addComponent(entity, RigidBody, { isKinematic: true });
  return entity;
};

export const removePlayerCollider: Behavior = (entity: Entity) => {
  removeComponent(entity, ColliderComponent);
  removeComponent(entity, RigidBody);
  return entity;
};
