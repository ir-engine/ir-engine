import { Quaternion } from 'three';
import { Behavior } from '../../common/interfaces/Behavior';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '../components/ColliderComponent';
import { RigidBody } from '../components/RigidBody';
import { hasComponent, getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { Entity } from '../../ecs/classes/Entity';
import { isClient } from "../../common/functions/isClient";
import { Network } from '../../networking/classes/Network';
import { NetworkObject } from '../../networking/components/NetworkObject';
import { PhysicsSystem } from '../systems/PhysicsSystem';

const quaternion = new Quaternion();

export const RigidBodyBehavior: Behavior = (entity: Entity, args): void => {

  // ON CLIENT
  if (args.phase == 'onAdded' && isClient) {
    const colliderComponent = getComponent<ColliderComponent>(entity, ColliderComponent);
    if (colliderComponent && PhysicsSystem.serverOnlyRigidBodyCollides) {
      PhysicsSystem.physicsWorld.removeBody(colliderComponent.collider);
    }
  }

  if (args.phase == 'onUpdate') {
    const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);

    // ON CLIENT
    if (isClient && hasComponent(entity, NetworkObject) && args.clientSnapshot.interpolationSnapshot) {
        const networkObject = getComponent<NetworkObject>(entity, NetworkObject)
        const interpolationSnapshot = args.clientSnapshot.interpolationSnapshot.state.find(v => v.networkId == networkObject.networkId);
        if ( !interpolationSnapshot ) return;
      //  const serverSnapshotPos = Network.instance.snapshot.state.find(v => v.networkId == networkObject.networkId);

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

        if (!PhysicsSystem.serverOnlyRigidBodyCollides) {
          const colliderComponent = getComponent<ColliderComponent>(entity, ColliderComponent);
          if (colliderComponent.collider) {
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
    if (!isClient) {
      const colliderComponent = getMutableComponent<ColliderComponent>(entity, ColliderComponent);

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

  }
};
