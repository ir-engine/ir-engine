import { Vector3 } from 'three'
import { BodyType } from 'three-physx'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { SnapshotData } from '../../networking/types/SnapshotDataTypes'
import { ColliderComponent } from '../components/ColliderComponent'
import { VelocityComponent } from '../components/VelocityComponent'
import { findInterpolationSnapshot } from './findInterpolationSnapshot'

/**
 * @author Josh Field <github.com/HexaField>
 * Copies the rigidbody's transform from the latest
 * If a networked entity does not have an interpolation component, just copy the data
 * @param {Entity} entity the entity belonging to the rigidbody
 * @param {SnapshotData} snapshots the snapshot data to use
 * @param {number} delta the delta of this frame
 */
//

const vec3 = new Vector3()

export const rigidbodyUpdateBehavior = (entity: Entity, snapshots: SnapshotData, delta): void => {
  const snapshot = findInterpolationSnapshot(entity, Network.instance.snapshot)
  if (snapshot == null) return

  const collider = getComponent(entity, ColliderComponent)
  const velocity = getComponent(entity, VelocityComponent)
  // dynamic objects should be interpolated, kinematic objects should not
  if (velocity) {
    velocity.velocity.subVectors(collider.body.transform.translation, vec3.set(snapshot.x, snapshot.y, snapshot.z))
  }
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
