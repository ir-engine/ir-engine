/**
 * @author HydraFire <github.com/HydraFire>
 */

import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { Network } from "../../networking/classes/Network";
import { NetworkObject } from "../../networking/components/NetworkObject";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { ColliderComponent } from "../components/ColliderComponent";
import { findInterpolationSnapshot } from "./findInterpolationSnapshot";

export const rigidbodyCorrectionBehavior: Behavior = (entity: Entity, snapshots, delta): void => {
  const networkId = getComponent(entity, NetworkObject).networkId;
  const transform = getComponent<TransformComponent>(entity, TransformComponent);

  const correction = findInterpolationSnapshot(entity, snapshots.correction);
  const currentSnapshot = findInterpolationSnapshot(entity, Network.instance.snapshot);

  const collider = getComponent(entity, ColliderComponent);
  snapshots.new.push({
    networkId,
    x: collider.body.transform.translation.x,
    y: collider.body.transform.translation.y,
    z: collider.body.transform.translation.z,
    qX: collider.body.transform.rotation.x,
    qY: collider.body.transform.rotation.y,
    qZ: collider.body.transform.rotation.z,
    qW: collider.body.transform.rotation.w,
  })
  if (correction == null || currentSnapshot == null || Network.instance.snapshot.timeCorrection === 0) return;
  
  const offsetX = correction.x - currentSnapshot.x;
  const offsetY = correction.y - currentSnapshot.y;
  const offsetZ = correction.z - currentSnapshot.z;
  
  const offsetqX = correction.qX - currentSnapshot.qX;
  const offsetqY = correction.qY - currentSnapshot.qY;
  const offsetqZ = correction.qZ - currentSnapshot.qZ;
  const offsetqW = correction.qW - currentSnapshot.qW;
  
  const offsetvX = correction.vX - currentSnapshot.vX;
  const offsetvY = correction.vY - currentSnapshot.vY;
  const offsetvZ = correction.vZ - currentSnapshot.vZ;

  collider.body.updateTransform({
    translation: {
      x: collider.body.transform.translation.x - offsetX * delta,
      y: collider.body.transform.translation.y - offsetY * delta,
      z: collider.body.transform.translation.z - offsetZ * delta,
    },
    rotation: {
      x: collider.body.transform.rotation.x - offsetqX * delta,
      y: collider.body.transform.rotation.y - offsetqY * delta,
      z: collider.body.transform.rotation.z - offsetqZ * delta,
      w: collider.body.transform.rotation.w - offsetqW * delta,
    },
    linearVelocity: {
      x: collider.body.transform.linearVelocity.x - offsetvX * delta,
      y: collider.body.transform.linearVelocity.y - offsetvY * delta,
      z: collider.body.transform.linearVelocity.z - offsetvZ * delta,
    }
  })
  collider.velocity.copy(collider.body.transform.linearVelocity);
  transform.position.copy(collider.body.transform.translation);
  transform.rotation.copy(collider.body.transform.rotation);
};
