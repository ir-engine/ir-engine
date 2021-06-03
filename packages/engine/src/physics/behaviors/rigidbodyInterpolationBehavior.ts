import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { findInterpolationSnapshot } from './findInterpolationSnapshot';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '../components/ColliderComponent';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const rigidbodyInterpolationBehavior: Behavior = (entity: Entity, snapshots): void => {
  const transform = getComponent<TransformComponent>(entity, TransformComponent);
  const collider = getMutableComponent<ColliderComponent>(entity, ColliderComponent);

  const interpolation = findInterpolationSnapshot(entity, snapshots.interpolation);

  if (!collider.body || !interpolation || isNaN(interpolation.vX)) return;

  collider.body.updateTransform({
    translation: {
      x: interpolation.x,
      y: interpolation.y,
      z: interpolation.z,
    },
    rotation: {
      x: interpolation.qX,
      y: interpolation.qY,
      z: interpolation.qZ,
      w: interpolation.qW,
    },
    linearVelocity: {
      x: interpolation.vX,
      y: interpolation.vY,
      z: interpolation.vZ,
    }
  })

  collider.velocity.copy(collider.body.transform.linearVelocity);
  transform.position.copy(collider.body.transform.translation);
  transform.rotation.copy(collider.body.transform.rotation);
};
