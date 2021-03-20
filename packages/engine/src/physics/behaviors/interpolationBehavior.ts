import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { Network } from '../../networking/classes/Network';
import { NetworkObject } from '../../networking/components/NetworkObject';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { CapsuleCollider } from '../components/CapsuleCollider';
import { ColliderComponent } from '../components/ColliderComponent';
import { InterpolationComponent } from '../components/InterpolationComponent';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { VehicleBody } from '../components/VehicleBody';

export const findOne = (entity, snapshot) => {
  const networkId = getComponent(entity, NetworkObject).networkId;
  if (snapshot != null) {
    return snapshot.state.find(v => v.networkId == networkId);
  } else {
    return networkId;
  }
}

export const interpolationBehavior: Behavior = (entity: Entity, args): void => {
  if ( args.snapshot == null ) return;
  const transform = getComponent<TransformComponent>(entity, TransformComponent);
  // FOR CHARACTERS
  if (hasComponent(entity, CharacterComponent)) {
    const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
    const capsule = getMutableComponent<CapsuleCollider>(entity, CapsuleCollider);
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
    if(isNaN(args.snapshot.vX)) return;
    actor.animationVelocity.set(
      args.snapshot.vX,
      args.snapshot.vY,
      args.snapshot.vZ
    );

    capsule.body.velocity.set(0, 0, 0);

    capsule.body.position.set(
      args.snapshot.x,
      args.snapshot.y,
      args.snapshot.z
    )

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
  // FOR RIGIDBODY
  } else if (hasComponent(entity, ColliderComponent)) {
    const colliderComponent = getComponent(entity, ColliderComponent);
    const inter = getMutableComponent(entity, InterpolationComponent);

      if (inter.lastUpdate + inter.updateDaley < Date.now() && args.snapshot.qX != undefined) {

        colliderComponent.collider.position.set(
          args.snapshot.x,
          args.snapshot.y,
          args.snapshot.z
        );
        colliderComponent.collider.quaternion.set(
          args.snapshot.qX,
          args.snapshot.qY,
          args.snapshot.qZ,
          args.snapshot.qW
        );

        inter.lastUpdate = Date.now();
      }
    } else if (hasComponent(entity, VehicleBody)) {
      const vehicleComponent = getComponent(entity, VehicleBody) as VehicleBody;
      const vehicle = vehicleComponent.vehiclePhysics;
      const chassisBody = vehicle.chassisBody;
      const wheels = vehicleComponent.arrayWheelsMesh;
      const isDriver = vehicleComponent.driver == Network.instance.localAvatarNetworkId;

      if (!isDriver && args.snapshot.qX != undefined) {

        chassisBody.position.set(
          args.snapshot.x,
          args.snapshot.y,
          args.snapshot.z
        );

        chassisBody.quaternion.set(
          args.snapshot.qX,
          args.snapshot.qY,
          args.snapshot.qZ,
          args.snapshot.qW
        );

        for (let i = 0; i < wheels.length; i++) {
          vehicle.updateWheelTransform(i);
          wheels[i].position.set(
            vehicle.wheelInfos[i].worldTransform.position.x,
            vehicle.wheelInfos[i].worldTransform.position.y,
            vehicle.wheelInfos[i].worldTransform.position.z
          );
          wheels[i].quaternion.set(
            vehicle.wheelInfos[i].worldTransform.quaternion.x,
            vehicle.wheelInfos[i].worldTransform.quaternion.y,
            vehicle.wheelInfos[i].worldTransform.quaternion.z,
            vehicle.wheelInfos[i].worldTransform.quaternion.w
          );
        }

      }
    }
};
