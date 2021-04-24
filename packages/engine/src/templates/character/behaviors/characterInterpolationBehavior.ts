import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { CharacterComponent } from '../components/CharacterComponent';
import { ControllerColliderComponent } from '../../../physics/components/ControllerColliderComponent';
import { TransformComponent } from '../../../transform/components/TransformComponent';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const characterInterpolationBehavior: Behavior = (entity: Entity, args): void => {
  if (args.snapshot == null) return;
  const transform = getComponent<TransformComponent>(entity, TransformComponent);
  
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
  const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
  
  if (isNaN(args.snapshot.vX)) return;
  actor.animationVelocity.set(
    args.snapshot.vX,
    args.snapshot.vY,
    args.snapshot.vZ
  );

  const currentPosition = collider.controller.transform.translation;

  collider.controller.delta.x += currentPosition.x - args.snapshot.x;
  collider.controller.delta.y += currentPosition.y - args.snapshot.y;
  collider.controller.delta.z += currentPosition.z - args.snapshot.z;

  collider.controller.velocity = { x: 0, y: 0, z: 0 };

  transform.rotation.set(
    args.snapshot.qX,
    args.snapshot.qY,
    args.snapshot.qZ,
    args.snapshot.qW
  )
};
