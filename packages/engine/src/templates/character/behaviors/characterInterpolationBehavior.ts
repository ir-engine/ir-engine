import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { CharacterComponent, MULT_SPEED } from '../components/CharacterComponent';
import { ControllerColliderComponent } from '../../../physics/components/ControllerColliderComponent';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { findInterpolationSnapshot } from '../../../physics/behaviors/findInterpolationSnapshot';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const characterInterpolationBehavior: Behavior = (entity: Entity, snapshots): void => {

  const interpolation = findInterpolationSnapshot(entity, snapshots.interpolation);

  const transform = getComponent<TransformComponent>(entity, TransformComponent);
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
  const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
  if (!actor.initialized || !collider.controller || !interpolation) return;

  if (isNaN(interpolation.vX)) return;
  actor.animationVelocity.set(
    interpolation.vX,
    interpolation.vY,
    interpolation.vZ
  );

  collider.controller.updateTransform({
    translation: interpolation
  })
/*
  collider.controller.delta.x += ( args.snapshot.x - currentPosition.x) / MULT_SPEED;
  collider.controller.delta.y += ( args.snapshot.y - currentPosition.y) / MULT_SPEED;
  collider.controller.delta.z += ( args.snapshot.z - currentPosition.z) / MULT_SPEED;
  //collider.controller.delta.y -= 0.01
  collider.controller.delta.y -= 0.2 * deltaTime;
*/
  transform.rotation.set(
    interpolation.qX,
    interpolation.qY,
    interpolation.qZ,
    interpolation.qW
  );
};
