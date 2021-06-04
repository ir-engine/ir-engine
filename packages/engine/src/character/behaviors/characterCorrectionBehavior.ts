/**
 * @author HydraFire <github.com/HydraFire>
 */

import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { Network } from "../../networking/classes/Network";
import { NetworkObject } from "../../networking/components/NetworkObject";
import { findInterpolationSnapshot } from "../../physics/behaviors/findInterpolationSnapshot";
import { ControllerColliderComponent } from "../components/ControllerColliderComponent";
import { CharacterComponent } from "../components/CharacterComponent";
import { SnapshotData } from "../../networking/types/SnapshotDataTypes";

/**
 * @author HydraFire <github.com/HydraFire>
 * Interpolates the local client's character transform with the server's state
 * @param {Entity} entity the entity belonging to the character
 * @param {SnapshotData} snapshots the snapshot data to use
 * @param {number} delta the delta of this frame
 */

export const characterCorrectionBehavior: Behavior = (entity: Entity, snapshots: SnapshotData, delta: number): void => {
  const networkId = getComponent(entity, NetworkObject).networkId;

  const correction = findInterpolationSnapshot(entity, snapshots.correction);
  const currentSnapshot = findInterpolationSnapshot(entity, Network.instance.snapshot);

  const collider = getComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
  snapshots.new.push({
    networkId,
    x: collider.controller.transform.translation.x,
    y: collider.controller.transform.translation.y,
    z: collider.controller.transform.translation.z,
    qX: 0, // physx controllers dont have rotation
    qY: 0,
    qZ: 0,
    qW: 1
  })
  if (correction == null || currentSnapshot == null || Network.instance.snapshot.timeCorrection === 0) return;

  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
  if (!actor.initialized || !collider.controller) return;

  const offsetX = correction.x - currentSnapshot.x;
  const offsetY = correction.y - currentSnapshot.y;
  const offsetZ = correction.z - currentSnapshot.z;

  collider.controller.delta.x -= offsetX * delta;
  collider.controller.delta.y -= offsetY * delta;
  collider.controller.delta.z -= offsetZ * delta;

};
