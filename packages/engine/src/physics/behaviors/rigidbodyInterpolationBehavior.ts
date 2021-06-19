import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Network } from "../../networking/classes/Network";
import { NetworkObject } from "../../networking/components/NetworkObject";
import { SnapshotData, StateEntity, StateInterEntity } from "../../networking/types/SnapshotDataTypes";
import { ColliderComponent } from "../components/ColliderComponent";
import { findInterpolationSnapshot } from "./findInterpolationSnapshot";

/**
 * @author HydraFire <github.com/HydraFire>
 * Interpolates the rigidbody's transform with the interpolated snapshots
 * @param {Entity} entity the entity belonging to the rigidbody
 * @param {SnapshotData} snapshots the snapshot data to use
 * @param {number} delta the delta of this frame
 */

export const rigidbodyInterpolationBehavior: Behavior = (entity: Entity, snapshots: SnapshotData, delta): void => {

  const networkId = getComponent(entity, NetworkObject).networkId;
  const collider = getComponent(entity, ColliderComponent);

  snapshots.new.push({
    networkId,
    x: collider.body.transform.translation.x,
    y: collider.body.transform.translation.y,
    z: collider.body.transform.translation.z,
    qX: collider.body.transform.rotation.x,
    qY: collider.body.transform.rotation.y,
    qZ: collider.body.transform.rotation.z,
    qW: collider.body.transform.rotation.w
  });

  const interpolationSnapshot = findInterpolationSnapshot(entity, snapshots.interpolation) as StateInterEntity;

  // 
  if (typeof interpolationSnapshot?.vX === 'undefined') return;
  
  const offsetX = interpolationSnapshot.x - collider.body.transform.translation.x;
  const offsetY = interpolationSnapshot.y - collider.body.transform.translation.y;
  const offsetZ = interpolationSnapshot.z - collider.body.transform.translation.z;

  const x = collider.body.transform.translation.x + (offsetX * delta);
  const y = collider.body.transform.translation.y + (offsetY * delta);
  const z = collider.body.transform.translation.z + (offsetZ * delta);

  collider.body.updateTransform({
    translation: { x, y, z },
    rotation: {
      x: interpolationSnapshot.qX,
      y: interpolationSnapshot.qY,
      z: interpolationSnapshot.qZ,
      w: interpolationSnapshot.qW,
    },
  });

  collider.body.setLinearVelocity({ 
    x: interpolationSnapshot.vX,
    y: interpolationSnapshot.vY,
    z: interpolationSnapshot.vZ
  }, true);

  //transform.position.copy(collider.body.transform.translation);
  //transform.rotation.copy(collider.body.transform.rotation);
  //collider.velocity.copy(collider.body.transform.linearVelocity);

  collider.velocity.set(
    interpolationSnapshot.vX,
    interpolationSnapshot.vY,
    interpolationSnapshot.vZ
  );
};
