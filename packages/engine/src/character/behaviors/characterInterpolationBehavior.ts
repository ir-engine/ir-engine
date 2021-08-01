import type { Behavior } from '../../common/interfaces/Behavior'
import type { Entity } from '../../ecs/classes/Entity'
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { findInterpolationSnapshot } from '../../physics/behaviors/findInterpolationSnapshot'
import { ControllerColliderComponent } from '../components/ControllerColliderComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CharacterComponent } from '../components/CharacterComponent'
import type { SnapshotData, StateInterEntity } from '../../networking/types/SnapshotDataTypes'

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
  const transform = getComponent(entity, TransformComponent)
  const actor = getMutableComponent(entity, CharacterComponent)
  const controller = getMutableComponent(entity, ControllerColliderComponent)

  const interpolation = findInterpolationSnapshot(entity, snapshots.interpolation) as StateInterEntity

  if (!controller.controller || !interpolation || isNaN(interpolation.vX)) return

  controller.controller.updateTransform({
    translation: {
      x: interpolation.x,
      y: interpolation.y + actor.actorHalfHeight,
      z: interpolation.z
    }
  })

  transform.rotation.set(interpolation.qX, interpolation.qY, interpolation.qZ, interpolation.qW)
  actor.velocity.set(interpolation.vX, interpolation.vY, interpolation.vZ)
}
