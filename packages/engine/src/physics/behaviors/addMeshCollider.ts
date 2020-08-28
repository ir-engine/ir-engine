import { Behavior } from '../../common/interfaces/Behavior';
import { ColliderComponent } from '../components/ColliderComponent';
import { RigidBody } from '../../physics/components/RigidBody';
import { Entity } from '../../ecs/classes/Entity';
import { addComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";

export const addMeshCollider: Behavior = (entity: Entity, args: any) => {
  addComponent(entity, ColliderComponent, args);
  return entity;
};

export const removeMeshCollider: Behavior = (entity: Entity) => {
  removeComponent(entity, ColliderComponent);
  return entity;
};
