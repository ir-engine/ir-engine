import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { addComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { RigidBody } from '../components/RigidBody';

export const addMeshRigidBody: Behavior = (entity: Entity, args: any) => {
  addComponent(entity, RigidBody, args);
  return entity;
};

export const removeMeshRigidBody: Behavior = (entity: Entity) => {
  removeComponent(entity, RigidBody);
  return entity;
};
