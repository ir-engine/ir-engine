import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { avatarCorrection } from '../../avatar/functions/avatarCorrection'
import { interpolateAvatar } from '../../avatar/functions/interpolateAvatar'
import { defineQuery, defineSystem, Not, System } from 'bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { Vault } from '../../networking/classes/Vault'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { calculateInterpolation, createSnapshot } from '../../networking/functions/NetworkInterpolationFunctions'
import { SnapshotData } from '../../networking/types/SnapshotDataTypes'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ClientAuthoritativeComponent } from '../components/ClientAuthoritativeComponent'
import { ColliderComponent } from '../components/ColliderComponent'
import { InterpolationComponent } from '../components/InterpolationComponent'
import { findInterpolationSnapshot } from '../functions/findInterpolationSnapshot'
import { interpolateRigidBody } from '../functions/interpolateRigidBody'
import { updateRigidBody } from '../functions/updateRigidBody'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

export const InterpolationSystem = async (): Promise<System> => {
  /**
   * Local avatar
   */
  const localAvatarCorrectionQuery = defineQuery([
    AvatarControllerComponent,
    InterpolationComponent,
    NetworkObjectComponent
  ])

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
    Not(ClientAuthoritativeComponent),
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
    Not(ClientAuthoritativeComponent),
    ColliderComponent,
    NetworkObjectComponent
  ])

  /**
   * Server controlled object with interpolation but no collider
   */
  const transformInterpolationQuery = defineQuery([
    Not(ClientAuthoritativeComponent),
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
    Not(ClientAuthoritativeComponent),
    Not(AvatarComponent),
    Not(ColliderComponent),
    TransformComponent,
    NetworkObjectComponent
  ])

  return defineSystem((world: ECSWorld) => {
    const { delta } = world

    if (!Network.instance?.snapshot) return

    const snapshots: SnapshotData = {
      interpolation: calculateInterpolation('x y z quat velocity'),
      correction: Vault.instance?.get(Network.instance.snapshot.timeCorrection, true),
      new: []
    }

    // Create new snapshot position for next frame server correction
    Vault.instance.add(createSnapshot(snapshots.new))

    for (const entity of localAvatarCorrectionQuery(world)) {
      avatarCorrection(entity, snapshots, delta)
    }

    for (const entity of networkClientInterpolationQuery(world)) {
      interpolateAvatar(entity, snapshots, delta)
    }

    for (const entity of networkObjectInterpolationQuery(world)) {
      interpolateRigidBody(entity, snapshots, delta)
    }

    for (const entity of correctionFromServerQuery(world)) {
      updateRigidBody(entity, snapshots, delta)
    }

    for (const entity of transformInterpolationQuery(world)) {
      const transform = getComponent(entity, TransformComponent)
      const interpolationSnapshot =
        findInterpolationSnapshot(entity, snapshots.interpolation) ??
        findInterpolationSnapshot(entity, Network.instance.snapshot)

      if (interpolationSnapshot == null) return

      transform.position.set(interpolationSnapshot.x, interpolationSnapshot.y, interpolationSnapshot.z)
      transform.rotation.set(
        interpolationSnapshot.qX,
        interpolationSnapshot.qY,
        interpolationSnapshot.qZ,
        interpolationSnapshot.qW
      )
    }

    for (const entity of transformUpdateFromServerQuery(world)) {
      const snapshot = findInterpolationSnapshot(entity, Network.instance.snapshot)
      if (snapshot == null) return
      const transform = getComponent(entity, TransformComponent)
      transform.position.set(snapshot.x, snapshot.y, snapshot.z)
      transform.rotation.set(snapshot.qX, snapshot.qY, snapshot.qZ, snapshot.qW)
    }

    return world
  })
}
