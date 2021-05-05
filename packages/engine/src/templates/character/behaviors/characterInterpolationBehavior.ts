import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { CharacterComponent, MULT_SPEED } from '../components/CharacterComponent';
import { ControllerColliderComponent } from '../../../physics/components/ControllerColliderComponent';
import { TransformComponent } from '../../../transform/components/TransformComponent';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const characterInterpolationBehavior: Behavior = (entity: Entity, args, deltaTime: number): void => {

  if (args.snapshot == null) return;
  const transform = getComponent<TransformComponent>(entity, TransformComponent);
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
  const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);



  const currentPosition = collider.controller.transform.translation;


  collider.controller.delta.x += ( args.snapshot.x - currentPosition.x) / MULT_SPEED;
  collider.controller.delta.y += ( args.snapshot.y - currentPosition.y) / MULT_SPEED;
  collider.controller.delta.z += ( args.snapshot.z - currentPosition.z) / MULT_SPEED;
  //collider.controller.delta.y -= 0.01
  collider.controller.delta.y -= 0.2 * deltaTime;

  transform.rotation.set(
    args.snapshot.qX,
    args.snapshot.qY,
    args.snapshot.qZ,
    args.snapshot.qW
  );

};
