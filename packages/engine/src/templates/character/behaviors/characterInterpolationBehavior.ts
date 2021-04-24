import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { Engine } from "../../../ecs/classes/Engine";
import { getComponent, getMutableComponent, hasComponent } from '../../../ecs/functions/EntityFunctions';
import { Network } from '../../../networking/classes/Network';
import { NetworkObject } from '../../../networking/components/NetworkObject';
import { CharacterComponent } from '../components/CharacterComponent';
import { ControllerColliderComponent } from '../../../physics/components/ControllerColliderComponent';
import { ColliderComponent } from '../../../physics/components/ColliderComponent';
import { InterpolationComponent } from '../../../physics/components/InterpolationComponent';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { VehicleComponent } from '../../vehicle/components/VehicleComponent';
import { Object3DComponent } from '../../../scene/components/Object3DComponent';
import { PhysicsSystem } from '../../../physics/systems/PhysicsSystem';

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const characterInterpolationBehavior: Behavior = (entity: Entity, args): void => {
  if (args.snapshot == null) return;
  const transform = getComponent<TransformComponent>(entity, TransformComponent);
  
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
  const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
  /*
  if (actor.actorCapsule.body.mass > 0) {
    actor.actorCapsule.body.mass = 0;
  }
  */

  // for animations
  /*
  actor.velocity.set(
    args.snapshot.vX,
    args.snapshot.vY,
    args.snapshot.vZ
  );
*/
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

  // actor.actorCapsule.body.rotation.qX = snapshot.qX;
  // actor.actorCapsule.body.rotation.qY = snapshot.qY;
  // actor.actorCapsule.body.rotation.qZ = snapshot.qZ;
  // actor.actorCapsule.body.rotation.qW = snapshot.qW;

  //    actorTransform.position.x = snapshot.x;
  //    actorTransform.position.y = snapshot.y;
  //    actorTransform.position.z = snapshot.z;

  transform.rotation.set(
    args.snapshot.qX,
    args.snapshot.qY,
    args.snapshot.qZ,
    args.snapshot.qW
  )
};
