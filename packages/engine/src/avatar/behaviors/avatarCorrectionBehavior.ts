/**
 * @author HydraFire <github.com/HydraFire>
 */

import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { findInterpolationSnapshot } from '../../physics/behaviors/findInterpolationSnapshot'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { SnapshotData } from '../../networking/types/SnapshotDataTypes'
import { Vector3 } from 'three'
import { AvatarComponent } from '../components/AvatarComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 * Interpolates the local client's character transform with the interpolated snapshots
 * @param {Entity} entity the entity belonging to the character
 * @param {SnapshotData} snapshots the snapshot data to use
 * @param {number} delta the delta of this frame
 */

const vec3 = new Vector3()

export const characterCorrectionBehavior = (entity: Entity, snapshots: SnapshotData, delta: number): void => {
  const controller = getComponent(entity, AvatarControllerComponent)
  const avatar = getComponent(entity, AvatarComponent)
  const networkId = getComponent(entity, NetworkObjectComponent).networkId

  snapshots.new.push({
    networkId,
    x: controller.controller.transform.translation.x,
    y: controller.controller.transform.translation.y - avatar.avatarHalfHeight,
    z: controller.controller.transform.translation.z,
    qX: 0, // physx controllers dont have rotation
    qY: 0,
    qZ: 0,
    qW: 1
  })

  const correction = findInterpolationSnapshot(entity, snapshots.correction)
  const currentSnapshot = findInterpolationSnapshot(entity, Network.instance.snapshot)

  if (correction == null || currentSnapshot == null || Network.instance.snapshot.timeCorrection === 0) return

  const offsetX = correction.x - currentSnapshot.x
  const offsetY = correction.y - currentSnapshot.y
  const offsetZ = correction.z - currentSnapshot.z

  // user is too far away, such as falling through the world, reset them to where the server says they are
  if (vec3.set(offsetX, offsetY, offsetZ).lengthSq() > 5) {
    controller.controller.updateTransform({
      translation: {
        x: currentSnapshot.x,
        y: currentSnapshot.y + avatar.avatarHalfHeight,
        z: currentSnapshot.z
      }
    })
  } else {
    // otherwise move them slowly towards their true position
    controller.controller.delta.x -= offsetX * delta
    controller.controller.delta.y -= offsetY * delta
    controller.controller.delta.z -= offsetZ * delta
  }
}
