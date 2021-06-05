/**
 * @author HydraFire <github.com/HydraFire>
 */

import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Network } from "../../networking/classes/Network";
import { NetworkObject } from "../../networking/components/NetworkObject";
import { SnapshotData } from "../../networking/types/SnapshotDataTypes";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { ColliderComponent } from "../components/ColliderComponent";
import { findInterpolationSnapshot } from "./findInterpolationSnapshot";

/**
 * @author HydraFire <github.com/HydraFire>
 * Interpolates the rigidbody's transform with the interpolated snapshots
 * @param {Entity} entity the entity belonging to the rigidbody
 * @param {SnapshotData} snapshots the snapshot data to use
 * @param {number} delta the delta of this frame
 */

const offsetMaxDistanceSq = 1;

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
  })

  const correction = findInterpolationSnapshot(entity, snapshots.correction);
  const currentSnapshot = findInterpolationSnapshot(entity, Network.instance.snapshot);

  if (correction == null || currentSnapshot == null || Network.instance.snapshot.timeCorrection === 0) return;

  const distX = collider.body.transform.translation.x - currentSnapshot.x;
  const distY = collider.body.transform.translation.y - currentSnapshot.y;
  const distZ = collider.body.transform.translation.z - currentSnapshot.z;

  const offsetX = correction.x - currentSnapshot.x;
  const offsetY = correction.y - currentSnapshot.y;
  const offsetZ = correction.z - currentSnapshot.z;

  // if the object is too far away, just snap it back (might be stuck, we should find a better solution for this)
  // if(distX * distX + distY * distY + distZ * distZ > offsetMaxDistanceSq) {
  //   if(offsetX * offsetX + offsetY * offsetY + offsetZ * offsetZ > offsetMaxDistanceSq) {
  //   collider.body.updateTransform({
  //     translation: {
  //       x: currentSnapshot.x,
  //       y: currentSnapshot.y,
  //       z: currentSnapshot.z,
  //     },
  //     rotation: {
  //       x: currentSnapshot.qX,
  //       y: currentSnapshot.qY,
  //       z: currentSnapshot.qZ,
  //       w: currentSnapshot.qW
  //     },
  //     linearVelocity: {
  //       x: currentSnapshot.vX,
  //       y: currentSnapshot.vY,
  //       z: currentSnapshot.vZ,
  //     }
  //   })
  //   collider.body.setLinearVelocity({ 
  //     x: currentSnapshot.vX,
  //     y: currentSnapshot.vY,
  //     z: currentSnapshot.vZ
  //   }, true)
  // } else {

    const offsetqX = correction.qX - currentSnapshot.qX;
    const offsetqY = correction.qY - currentSnapshot.qY;
    const offsetqZ = correction.qZ - currentSnapshot.qZ;
    const offsetqW = correction.qW - currentSnapshot.qW;

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
      }
    })
    // console.log(collider.body.transform.linearVelocity, offsetvX, offsetvY, offsetvZ)
  // }
};
