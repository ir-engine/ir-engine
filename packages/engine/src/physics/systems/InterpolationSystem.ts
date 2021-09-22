import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { Not } from 'bitecs'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
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
import { NetworkObjectOwnedTag } from '../../networking/components/NetworkObjectOwnedTag'
import { isEntityLocalClientOwnerOf } from '../../networking/functions/isEntityLocalClientOwnerOf'
import { World } from '../../ecs/classes/World'
import { System } from '../../ecs/classes/System'
import { teleportRigidbody } from '../functions/teleportRigidbody'
import { Quaternion, Vector3 } from 'three'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

export default async function InterpolationSystem(world: World): Promise<System> {
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
    Not(NetworkObjectOwnedTag),
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
    Not(NetworkObjectOwnedTag),
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

      teleportRigidbody(
        collider.body,
        new Vector3(interpolation.x, interpolation.y + avatar.avatarHalfHeight, interpolation.z),
        new Quaternion(interpolation.qX, interpolation.qY, interpolation.qZ, interpolation.qW)
      )

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

      teleportRigidbody(
        collider.body,
        new Vector3(interpolationSnapshot.x, interpolationSnapshot.y, interpolationSnapshot.z),
        new Quaternion(
          interpolationSnapshot.qX,
          interpolationSnapshot.qY,
          interpolationSnapshot.qZ,
          interpolationSnapshot.qW
        )
      )
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
      teleportRigidbody(
        collider.body,
        new Vector3(snapshot.x, snapshot.y, snapshot.z),
        new Quaternion(snapshot.qX, snapshot.qY, snapshot.qZ, snapshot.qW)
      )
      transform.position.set(snapshot.x, snapshot.y, snapshot.z)
      transform.rotation.set(snapshot.qX, snapshot.qY, snapshot.qZ, snapshot.qW)
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
