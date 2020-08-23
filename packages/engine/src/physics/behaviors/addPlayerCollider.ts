import { Behavior } from '../../common/interfaces/Behavior';
import { ColliderComponent } from '../components/ColliderComponent';
import { RigidBody } from '../../physics/components/RigidBody';
import { Entity } from '../../ecs/classes/Entity';
import { addComponent } from '../../ecs/functions/EntityFunctions';

export const addPlayerCollider: Behavior = (entity: Entity) => {


    addComponent(entity, ColliderComponent, { type: 'box', scale: [1, 1, 1], mass: 10 });
    addComponent(entity, RigidBody, { isKinematic: true });

  return entity;
};
