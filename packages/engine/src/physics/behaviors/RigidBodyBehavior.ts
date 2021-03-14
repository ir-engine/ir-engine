import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';

import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '../components/ColliderComponent';


export const RigidBodyBehavior: Behavior = (entity: Entity, args): void => {
  const colliderComponent = getComponent<ColliderComponent>(entity, ColliderComponent);
  const transform = getComponent<TransformComponent>(entity, TransformComponent);

  if (args.phase == 'onAdded') {
    // ON CLIENT
    /*  Its was idea for delete physics on client and update only by interpolation
    if (isClient && colliderComponent && PhysicsSystem.serverOnlyRigidBodyCollides) {
      PhysicsSystem.physicsWorld.removeBody(colliderComponent.collider);
    }
    */
    return;
  }

  if (args.phase == 'onRemoved') return;

  transform.position.set(
    colliderComponent.collider.position.x,
    colliderComponent.collider.position.y,
    colliderComponent.collider.position.z
  );
  transform.rotation.set(
    colliderComponent.collider.quaternion.x,
    colliderComponent.collider.quaternion.y,
    colliderComponent.collider.quaternion.z,
    colliderComponent.collider.quaternion.w
  );
};
