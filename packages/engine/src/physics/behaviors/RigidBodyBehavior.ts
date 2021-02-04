import { isClient } from "../../common/functions/isClient";
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { NetworkObject } from '../../networking/components/NetworkObject';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '../components/ColliderComponent';
import { PhysicsSystem } from '../systems/PhysicsSystem';

export const RigidBodyBehavior: Behavior = (entity: Entity, args): void => {
  const colliderComponent = getComponent<ColliderComponent>(entity, ColliderComponent);
  const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);

  // ON CLIENT
  if (isClient) {
    if (args.phase == 'onAdded') {
      if (colliderComponent && PhysicsSystem.serverOnlyRigidBodyCollides) {
        PhysicsSystem.physicsWorld.removeBody(colliderComponent.collider);
      }
    }

    if (args.phase == 'onUpdate') {
      if (hasComponent(entity, NetworkObject) && args.clientSnapshot.interpolationSnapshot) {
        const networkObject = getComponent<NetworkObject>(entity, NetworkObject)
        const interpolationSnapshot = args.clientSnapshot.interpolationSnapshot.state.find(v => v.networkId == networkObject.networkId);
        if (!interpolationSnapshot) return;

        transform.position.set(
          interpolationSnapshot.x,
          interpolationSnapshot.y,
          interpolationSnapshot.z
        );
        transform.rotation.set(
          interpolationSnapshot.qX,
          interpolationSnapshot.qY,
          interpolationSnapshot.qZ,
          interpolationSnapshot.qW
        );

        if (!PhysicsSystem.serverOnlyRigidBodyCollides && colliderComponent.collider) {
          colliderComponent.collider.position.set(
            interpolationSnapshot.x,
            interpolationSnapshot.y,
            interpolationSnapshot.z
          );
          colliderComponent.collider.quaternion.set(
            interpolationSnapshot.qX,
            interpolationSnapshot.qY,
            interpolationSnapshot.qZ,
            interpolationSnapshot.qW
          );
        }
      }
    }
    // ON SERVER
    if (isClient) return;
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
  }
};
