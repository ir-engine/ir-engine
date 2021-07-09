import { Behavior } from '../../common/interfaces/Behavior'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { NetworkObject } from '../../networking/components/NetworkObject'
import { SnapshotData, StateInterEntity } from '../../networking/types/SnapshotDataTypes'
import { ColliderComponent } from '../components/ColliderComponent'
import { LocalInterpolationComponent } from '../components/LocalInterpolationComponent'
import { findInterpolationSnapshot } from './findInterpolationSnapshot'

/**
 * @author HydraFire <github.com/HydraFire>
 * Interpolates the rigidbody's transform with the interpolated snapshots
 * @param {Entity} entity the entity belonging to the rigidbody
 * @param {SnapshotData} snapshots the snapshot data to use
 * @param {number} delta the delta of this frame
 */

export const experementalRigidbodyCorrectionBehavior: Behavior = (entity: Entity, snapshots: SnapshotData, delta): void => {
  const networkId = getComponent(entity, NetworkObject).networkId
  const collider = getMutableComponent(entity, ColliderComponent)
  const localInterpolation = getMutableComponent(entity, LocalInterpolationComponent)

  const level0 = localInterpolation.level0
  const level5 = localInterpolation.level5 * (delta * 60)

  if (localInterpolation.correctionStart) {
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
  }

  const correction = findInterpolationSnapshot(entity, snapshots.correction)
  const currentSnapshot = findInterpolationSnapshot(entity, Network.instance.snapshot)
  const interpolationSnapshot = findInterpolationSnapshot(entity, snapshots.interpolation)

  if (currentSnapshot == null || interpolationSnapshot == null || Network.instance.snapshot.timeCorrection === 0) return
  if (correction == null && localInterpolation.correctionStart === true) return

  let offsetX = localInterpolation.correctionStart ? correction.x - currentSnapshot.x : localInterpolation.positionDiff.x
  let offsetY = localInterpolation.correctionStart ? correction.y - currentSnapshot.y : localInterpolation.positionDiff.y
  let offsetZ = localInterpolation.correctionStart ? correction.z - currentSnapshot.z : localInterpolation.positionDiff.z

  // console.log(offsetX.toFixed(4), offsetY.toFixed(4), offsetZ.toFixed(4), localInterpolation.positionDiff.y)

  if (localInterpolation.correctionStart && Math.abs(offsetX) + Math.abs(offsetY) + Math.abs(offsetZ) > level0) {
    localInterpolation.positionDiff.set(
      offsetX,
      offsetY,
      offsetZ
    )

    localInterpolation.correctionStart = false
  } else if (!localInterpolation.correctionStart && Math.abs(offsetX) + Math.abs(offsetY) + Math.abs(offsetZ) < level0 * 10) {
    localInterpolation.correctionStart = true
  }

  if (Math.abs(offsetX) >= level0) {
    if (Math.abs(offsetX) < level5) {
      offsetX = offsetX / 2
      localInterpolation.correctionStart ? localInterpolation.positionDiff.setX(0) : localInterpolation.positionDiff.setX(localInterpolation.positionDiff.x - offsetX)
    } else {
      if (offsetX > 0) {
        offsetX = (level5 / 2)
        localInterpolation.correctionStart ? localInterpolation.positionDiff.setX(0) : localInterpolation.positionDiff.setX(localInterpolation.positionDiff.x - level5 / 2)
      } else {
        offsetX = (level5 / 2) * -1
        localInterpolation.correctionStart ? localInterpolation.positionDiff.setX(0) : localInterpolation.positionDiff.setX(localInterpolation.positionDiff.x + level5 / 2)
      }
    }
  } else {
    offsetX = 0
    localInterpolation.positionDiff.setX(0)
  }

  if (Math.abs(offsetY) >= level0) {
    if (Math.abs(offsetY) < level5) {
      // offsetY = offsetY ;
      localInterpolation.correctionStart ? localInterpolation.positionDiff.setY(0) : localInterpolation.positionDiff.setY(localInterpolation.positionDiff.y - offsetY)
    } else {
      if (offsetY > 0) {
        offsetY = (level5)
        localInterpolation.correctionStart ? localInterpolation.positionDiff.setY(0) : localInterpolation.positionDiff.setY(localInterpolation.positionDiff.y - level5)
      } else {
        offsetY = (level5) * -1
        localInterpolation.correctionStart ? localInterpolation.positionDiff.setY(0) : localInterpolation.positionDiff.setY(localInterpolation.positionDiff.y + level5)
      }
    }
  } else {
    offsetY = 0
    localInterpolation.positionDiff.setY(0)
  }
  /*
  if (Math.abs(offsetY) >= level0) {
    if (offsetY > 0) {
      offsetY =   level0;
      localInterpolation.correctionStart ? localInterpolation.positionDiff.setY(0) : localInterpolation.positionDiff.setZ(localInterpolation.positionDiff.y - level0);
    } else {
      offsetY = - level0;
      localInterpolation.correctionStart ? localInterpolation.positionDiff.setY(0) : localInterpolation.positionDiff.setZ(localInterpolation.positionDiff.y + level0);
    }
  } else {
    offsetY = 0
    localInterpolation.positionDiff.setY(0)
  }
*/

  if (Math.abs(offsetZ) >= level0) {
    if (Math.abs(offsetZ) < level5) {
      offsetZ = offsetZ / 2
      localInterpolation.correctionStart ? localInterpolation.positionDiff.setZ(0) : localInterpolation.positionDiff.setZ(localInterpolation.positionDiff.z - offsetZ)
    } else {
      if (offsetZ > 0) {
        offsetZ = (level5 / 2)
        localInterpolation.correctionStart ? localInterpolation.positionDiff.setZ(0) : localInterpolation.positionDiff.setZ(localInterpolation.positionDiff.z - level5 / 2)
      } else {
        offsetZ = (level5 / 2) * -1
        localInterpolation.correctionStart ? localInterpolation.positionDiff.setZ(0) : localInterpolation.positionDiff.setZ(localInterpolation.positionDiff.z + level5 / 2)
      }
    }
  } else {
    offsetZ = 0
    localInterpolation.positionDiff.setZ(0)
  }

  if (Math.abs(offsetX) >= level0 || Math.abs(offsetY) >= level5 || Math.abs(offsetZ) >= level0) {
    collider.body.updateTransform({
      translation: {
        x: collider.body.transform.translation.x - offsetX,
        y: collider.body.transform.translation.y - offsetY,
        z: collider.body.transform.translation.z - offsetZ
      },
      rotation: {}
    /*
      linearVelocity: {
        x: 0,
        y: 0,
        z: 0,
      }
      */
    })
  } else {
    localInterpolation.correctionStart = true
  }

  collider.velocity.set(
    (interpolationSnapshot as StateInterEntity).vX,
    (interpolationSnapshot as StateInterEntity).vY,
    (interpolationSnapshot as StateInterEntity).vZ
  )
}
