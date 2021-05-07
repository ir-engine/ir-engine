import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { findInterpolationSnapshot } from '../../../physics/behaviors/findInterpolationSnapshot';
import { ControllerColliderComponent } from '../../../physics/components/ControllerColliderComponent';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { CharacterComponent } from '../components/CharacterComponent';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const characterInterpolationBehavior: Behavior = (entity: Entity, snapshots): void => {
  const transform = getComponent<TransformComponent>(entity, TransformComponent);
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
  const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);

  const interpolation = findInterpolationSnapshot(entity, snapshots.interpolation);

  if (!actor.initialized || !collider.controller || !interpolation || isNaN(interpolation.vX)) return;

  actor.animationVelocity.set(
    interpolation.vX,
    interpolation.vY,
    interpolation.vZ
  );

  collider.controller.updateTransform({
    translation: {
      x: interpolation.x,
      y: interpolation.y,
      z: interpolation.z,
    }
  })

  collider.controller.velocity = { x: 0, y: 0, z: 0 };

  transform.rotation.set(
    interpolation.qX,
    interpolation.qY,
    interpolation.qZ,
    interpolation.qW
  );

};
