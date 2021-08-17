import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { Vault } from '../../networking/classes/Vault'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { calculateInterpolation, createSnapshot } from '../../networking/functions/NetworkInterpolationFunctions'
import { ColliderComponent } from '../components/ColliderComponent'
import { InterpolationComponent } from '../components/InterpolationComponent'
import { BodyType } from 'three-physx'
import { findInterpolationSnapshot } from '../functions/findInterpolationSnapshot'
import { Vector3 } from 'three'
import { SnapshotData } from '../../networking/types/SnapshotDataTypes'
import { avatarCorrection } from '../../avatar/functions/avatarCorrection'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { interpolateAvatar } from '../../avatar/functions/interpolateAvatar'
import { interpolateRigidBody } from '../functions/interpolateRigidBody'
import { LocalInterpolationComponent } from '../components/LocalInterpolationComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { correctRigidBody } from '../function../functions/correctRigidBody
import { VelocityComponent } from '../components/VelocityComponent'
import { defineQuery, defineSystem, Not, System } from '../../ecs/bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { ClientAuthoritativeComponent } from '../components/ClientAuthoritativeComponent'
import { updateRigidBody } from '../functions/updateRigidBody'
import { TransformComponent } from '../../transform/components/TransformComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

export const InterpolationSystem = async (): Promise<System> => {
  const localCharacterInterpolationQuery = defineQuery([
    AvatarControllerComponent,
    InterpolationComponent,
    NetworkObjectComponent
  ])
  const networkClientInterpolationQuery = defineQuery([
    Not(AvatarControllerComponent),
    ColliderComponent,
    AvatarComponent,
    InterpolationComponent,
    NetworkObjectComponent
  ])
  const localObjectInterpolationQuery = defineQuery([
    Not(AvatarComponent),
    LocalInterpolationComponent,
    InterpolationComponent,
    ColliderComponent,
    NetworkObjectComponent
  ])
  const networkObjectInterpolationQuery = defineQuery([
    Not(AvatarComponent),
    Not(LocalInterpolationComponent),
    Not(ClientAuthoritativeComponent),
    InterpolationComponent,
    ColliderComponent,
    NetworkObjectComponent
  ])
  const correctionFromServerQuery = defineQuery([
    Not(InterpolationComponent),
    Not(ClientAuthoritativeComponent),
    ColliderComponent,
    NetworkObjectComponent
  ])
  const transformUpdateFromServerQuery = defineQuery([
    Not(InterpolationComponent),
    Not(ClientAuthoritativeComponent),
    Not(AvatarControllerComponent),
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

    for (const entity of localCharacterInterpolationQuery(world)) {
      avatarCorrection(entity, snapshots, delta)
    }

    for (const entity of networkClientInterpolationQuery(world)) {
      interpolateAvatar(entity, snapshots, delta)
    }

    for (const entity of localObjectInterpolationQuery(world)) {
      correctRigidBody(entity, snapshots, delta)
    }

    for (const entity of networkObjectInterpolationQuery(world)) {
      interpolateRigidBody(entity, snapshots, delta)
    }

    for (const entity of correctionFromServerQuery(world)) {
      updateRigidBody(entity, snapshots, delta)
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
