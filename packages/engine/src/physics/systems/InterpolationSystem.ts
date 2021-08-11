import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { Vault } from '../../networking/classes/Vault'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { calculateInterpolation, createSnapshot } from '../../networking/functions/NetworkInterpolationFunctions'
import { ColliderComponent } from '../components/ColliderComponent'
import { InterpolationComponent } from '../components/InterpolationComponent'
import { BodyType } from 'three-physx'
import { findInterpolationSnapshot } from '../behaviors/findInterpolationSnapshot'
import { Vector3 } from 'three'
import { SnapshotData } from '../../networking/types/SnapshotDataTypes'
import { characterCorrectionBehavior } from '../../avatar/behaviors/avatarCorrectionBehavior'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { avatarInterpolationBehavior } from '../../avatar/behaviors/avatarInterpolationBehavior'
import { rigidbodyInterpolationBehavior } from '../behaviors/rigidbodyInterpolationBehavior'
import { LocalInterpolationComponent } from '../components/LocalInterpolationComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { rigidbodyCorrectionBehavior } from '../behaviors/rigidbodyCorrectionBehavior'
import { VelocityComponent } from '../components/VelocityComponent'
import { defineQuery, defineSystem, Not, System } from '../../ecs/bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { ClientAuthoritativeTagComponent } from '../components/ClientAuthoritativeTagComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

const vec3 = new Vector3()

export const InterpolationSystem = async (): Promise<System> => {
  const localCharacterInterpolationQuery = defineQuery([
    AvatarControllerComponent,
    InterpolationComponent,
    NetworkObjectComponent
  ])
  const networkClientInterpolationQuery = defineQuery([
    Not(AvatarControllerComponent),
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
    Not(ClientAuthoritativeTagComponent),
    InterpolationComponent,
    ColliderComponent,
    NetworkObjectComponent
  ])
  const correctionFromServerQuery = defineQuery([
    Not(InterpolationComponent),
    Not(ClientAuthoritativeTagComponent),
    ColliderComponent,
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
      characterCorrectionBehavior(entity, snapshots, delta)
    }

    for (const entity of networkClientInterpolationQuery(world)) {
      avatarInterpolationBehavior(entity, snapshots, delta)
    }

    for (const entity of localObjectInterpolationQuery(world)) {
      rigidbodyCorrectionBehavior(entity, snapshots, delta)
    }

    for (const entity of networkObjectInterpolationQuery(world)) {
      rigidbodyInterpolationBehavior(entity, snapshots, delta)
    }

    // If a networked entity does not have an interpolation component, just copy the data
    for (const entity of correctionFromServerQuery(world)) {
      const snapshot = findInterpolationSnapshot(entity, Network.instance.snapshot)
      if (snapshot == null) continue
      const collider = getComponent(entity, ColliderComponent)
      const velocity = getComponent(entity, VelocityComponent)
      // dynamic objects should be interpolated, kinematic objects should not
      if (velocity && collider.body.type !== BodyType.KINEMATIC) {
        velocity.velocity.subVectors(collider.body.transform.translation, vec3.set(snapshot.x, snapshot.y, snapshot.z))
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
      }
    }
    return world
  })
}
