import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { Not } from 'bitecs'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { Vault } from '../../networking/classes/Vault'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { calculateInterpolation, createSnapshot } from '../../networking/functions/NetworkInterpolationFunctions'
import { SnapshotData, StateInterEntity } from '../../networking/types/SnapshotDataTypes'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ColliderComponent } from '../components/ColliderComponent'
import { InterpolationComponent } from '../components/InterpolationComponent'
import { findInterpolationSnapshot } from '../functions/findInterpolationSnapshot'
import { VelocityComponent } from '../components/VelocityComponent'
import { BodyType } from 'three-physx'
import { NetworkObjectOwnerComponent } from '../../networking/components/NetworkObjectOwnerComponent'
import { isEntityLocalClientOwnerOf } from '../../networking/functions/isEntityLocalClientOwnerOf'
import { NameComponent } from '../../scene/components/NameComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

export const InterpolationSystem = async () => {
  /**
   * Remote avatars
   */
  const networkClientInterpolationQuery = defineQuery([
    Not(AvatarControllerComponent),
    ColliderComponent,
    AvatarComponent,
    InterpolationComponent,
    NetworkObjectComponent
  ])

  /**
   * Server controlled rigidbody with interpolation
   */
  const networkObjectInterpolationQuery = defineQuery([
    Not(AvatarComponent),
    Not(NetworkObjectOwnerComponent),
    InterpolationComponent,
    ColliderComponent,
    NetworkObjectComponent
  ])

  /**
   * Server controlled rigidbody without interpolation
   */
  const correctionFromServerQuery = defineQuery([
    Not(AvatarComponent),
    Not(InterpolationComponent),
    ColliderComponent,
    NetworkObjectComponent
  ])

  /**
   * Server controlled object with interpolation but no collider
   */
  const transformInterpolationQuery = defineQuery([
    Not(NetworkObjectOwnerComponent),
    Not(AvatarComponent),
    Not(ColliderComponent),
    InterpolationComponent,
    TransformComponent,
    NetworkObjectComponent
  ])

  /**
   * Server controlled object with no collider or interpolation
   */
  const transformUpdateFromServerQuery = defineQuery([
    Not(InterpolationComponent),
    Not(AvatarComponent),
    Not(ColliderComponent),
    TransformComponent,
    NetworkObjectComponent
  ])

  return () => {
    if (!Network.instance?.snapshot) return

    const snapshots: SnapshotData = {
      interpolation: calculateInterpolation('x y z quat velocity'),
      new: []
    }

    // Create new snapshot position for next frame server correction
    Vault.instance.add(createSnapshot(snapshots.new))

    for (const entity of networkClientInterpolationQuery()) {
      const interpolation = findInterpolationSnapshot(entity, snapshots.interpolation) as StateInterEntity

      if (!interpolation || Number.isNaN(interpolation.vX)) continue

      const transform = getComponent(entity, TransformComponent)
      const velocity = getComponent(entity, VelocityComponent)
      const avatar = getComponent(entity, AvatarComponent)
      const collider = getComponent(entity, ColliderComponent)

      collider.body.updateTransform({
        translation: {
          x: interpolation.x,
          y: interpolation.y + avatar.avatarHalfHeight,
          z: interpolation.z
        },
        rotation: {
          x: interpolation.qX,
          y: interpolation.qY,
          z: interpolation.qZ,
          w: interpolation.qW
        }
      })

      transform.position.set(interpolation.x, interpolation.y, interpolation.z)
      transform.rotation.set(interpolation.qX, interpolation.qY, interpolation.qZ, interpolation.qW)

      velocity.velocity.set(interpolation.vX, interpolation.vY, interpolation.vZ)
    }

    for (const entity of networkObjectInterpolationQuery()) {
      const collider = getComponent(entity, ColliderComponent)
      const interpolationSnapshot =
        findInterpolationSnapshot(entity, snapshots.interpolation) ??
        findInterpolationSnapshot(entity, Network.instance.snapshot)

      if (interpolationSnapshot == null) continue

      collider.body.updateTransform({
        translation: {
          x: interpolationSnapshot.x,
          y: interpolationSnapshot.y,
          z: interpolationSnapshot.z
        },
        rotation: {
          x: interpolationSnapshot.qX,
          y: interpolationSnapshot.qY,
          z: interpolationSnapshot.qZ,
          w: interpolationSnapshot.qW
        }
      })
    }

    for (const entity of transformInterpolationQuery()) {
      const transform = getComponent(entity, TransformComponent)
      const interpolationSnapshot =
        findInterpolationSnapshot(entity, snapshots.interpolation) ??
        findInterpolationSnapshot(entity, Network.instance.snapshot)

      if (interpolationSnapshot == null) continue

      transform.position.set(interpolationSnapshot.x, interpolationSnapshot.y, interpolationSnapshot.z)
      transform.rotation.set(
        interpolationSnapshot.qX,
        interpolationSnapshot.qY,
        interpolationSnapshot.qZ,
        interpolationSnapshot.qW
      )
    }

    for (const entity of correctionFromServerQuery()) {
      if (isEntityLocalClientOwnerOf(entity)) continue

      const snapshot = findInterpolationSnapshot(entity, Network.instance.snapshot)
      if (snapshot == null) return

      const collider = getComponent(entity, ColliderComponent)
      const transform = getComponent(entity, TransformComponent)
      if (collider.body.type === BodyType.DYNAMIC) {
        collider.body.updateTransform({
          translation: {
            x: snapshot.x,
            y: snapshot.y,
            z: snapshot.z
          },
          rotation: {
            x: snapshot.qX,
            y: snapshot.qY,
            z: snapshot.qZ,
            w: snapshot.qW
          }
        })
      } else {
        transform.position.set(snapshot.x, snapshot.y, snapshot.z)
        transform.rotation.set(snapshot.qX, snapshot.qY, snapshot.qZ, snapshot.qW)
      }
    }

    for (const entity of transformUpdateFromServerQuery()) {
      // we don't want to accept updates from the server if the local client is in control of this entity
      if (isEntityLocalClientOwnerOf(entity)) continue

      const snapshot = findInterpolationSnapshot(entity, Network.instance.snapshot)
      if (snapshot == null) return
      const transform = getComponent(entity, TransformComponent)
      transform.position.set(snapshot.x, snapshot.y, snapshot.z)
      transform.rotation.set(snapshot.qX, snapshot.qY, snapshot.qZ, snapshot.qW)
    }
  }
}
