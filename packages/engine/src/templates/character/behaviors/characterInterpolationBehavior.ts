import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { CharacterComponent } from '../components/CharacterComponent';
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

  collider.controller.velocity = { x: 0, y: 0, z: 0 };

  transform.rotation.set(
    interpolation.qX,
    interpolation.qY,
    interpolation.qZ,
    interpolation.qW
  );
};
