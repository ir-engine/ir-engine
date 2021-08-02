import type { Behavior } from '../../common/interfaces/Behavior'
import type { Entity } from '../../ecs/classes/Entity'
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { findInterpolationSnapshot } from '../../physics/behaviors/findInterpolationSnapshot'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CharacterComponent } from '../components/CharacterComponent'
import type { SnapshotData, StateInterEntity } from '../../networking/types/SnapshotDataTypes'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { ColliderComponent } from '../../physics/components/ColliderComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 * Copy the transform for other user's character avatars from the snapshot interpolation
 * @param {Entity} entity the entity belonging to the character
 * @param {SnapshotData} snapshots the snapshot data to use
 * @param {number} delta the delta of this frame
 */

export const characterInterpolationBehavior: Behavior = (
  entity: Entity,
  snapshots: SnapshotData,
  delta: number
): void => {
  const interpolation = findInterpolationSnapshot(entity, snapshots.interpolation) as StateInterEntity

  if (!interpolation || isNaN(interpolation.vX)) return

  const transform = getComponent(entity, TransformComponent)
  const velocity = getComponent(entity, VelocityComponent)
  const actor = getMutableComponent(entity, CharacterComponent)
  const collider = getMutableComponent(entity, ColliderComponent)

  collider.body.updateTransform({
    translation: {
      x: interpolation.x,
      y: interpolation.y + actor.actorHalfHeight,
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
