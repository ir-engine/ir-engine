import { Behavior } from '../../common/interfaces/Behavior';
import { Euler, Matrix4, Vector3, Quaternion } from 'three';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { ControllerColliderComponent } from '../components/ControllerColliderComponent';
import { Engine } from '../../ecs/classes/Engine';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { VehicleComponent } from '../../templates/vehicle/components/VehicleComponent';
import { interpolationBehavior, findOne } from './interpolationBehavior';
import { Network } from '../../networking/classes/Network';
import { ColliderComponent } from '../components/ColliderComponent';

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const serverCorrectionBehavior: Behavior = (entity: Entity, args): void => {
  if (args.snapshot == null) return;
  const collider = getMutableComponent(entity, ColliderComponent)
  if(collider) {
    collider.collider.position.set(args.snapshot.x, args.snapshot.y, args.snapshot.z);
    collider.collider.quaternion.set(args.snapshot.qX, args.snapshot.qY, args.snapshot.qZ, args.snapshot.qW);
  }
}

let correctionSpeed = 180;
export const serverCorrectionInterpolationBehavior: Behavior = (entity: Entity, args): void => {
  if (args.correction == null || args.snapshot == null) return;

  if (hasComponent(entity, ControllerColliderComponent)) {
    const capsule = getComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
    const transform = getComponent<TransformComponent>(entity, TransformComponent);
    const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
    if (!actor.initialized) return;

      correctionSpeed = 180 / (actor.animationVelocity.length() + 1);

      const offsetX = args.correction.x - args.snapshot.x;
      const offsetY = args.correction.y - args.snapshot.y;
      const offsetZ = args.correction.z - args.snapshot.z;

      if (Math.abs(offsetX) + Math.abs(offsetY) + Math.abs(offsetZ) > 3) {
        capsule.body.position.set(
          args.snapshot.x,
          args.snapshot.y,
          args.snapshot.z
        );
      } else {
        capsule.body.position.set(
          capsule.body.position.x - (offsetX / correctionSpeed),
          capsule.body.position.y - (offsetY / correctionSpeed),
          capsule.body.position.z - (offsetZ / correctionSpeed)
        );
      }
  } else if (hasComponent(entity, VehicleComponent)) {

    const vehicleComponent = getComponent(entity, VehicleComponent) as VehicleComponent;
    const isPassenger = vehicleComponent.passenger == Network.instance.localAvatarNetworkId;
    // for passager
    if (isPassenger) {
      if (args.interpolation == null ) return;
      interpolationBehavior(entity, { snapshot: args.interpolation });
      return;
    }

    const vehicle = vehicleComponent.vehiclePhysics;
    const chassisBody = vehicle.chassisBody;
    const isMoved = vehicleComponent.isMoved;
    const wheels = vehicleComponent.arrayWheelsMesh;


    const carSpeed = vehicle.currentVehicleSpeedKmHour;
    const correction = 180 - (carSpeed/4);

    let offsetX = 0, offsetY = 0, offsetZ = 0;
    offsetX = args.correction.x - args.snapshot.x;
    offsetY = args.correction.y - args.snapshot.y;
    offsetZ = args.correction.z - args.snapshot.z;

    const sumOffset = Math.abs(offsetX) + Math.abs(offsetY) + Math.abs(offsetZ);
    if (sumOffset > 15) {
      chassisBody.position.x = args.snapshot.x;
      chassisBody.position.y = args.snapshot.y;
      chassisBody.position.z = args.snapshot.z;
      chassisBody.quaternion.x = args.snapshot.qX;
      chassisBody.quaternion.y = args.snapshot.qY;
      chassisBody.quaternion.z = args.snapshot.qZ;
      chassisBody.quaternion.w = args.snapshot.qW;
    } else if (sumOffset > 0.01) {
      chassisBody.position.x -= (offsetX / correction);
      chassisBody.position.y -= (offsetY / correction);
      chassisBody.position.z -= (offsetZ / correction);
    }

    let offsetqX = 0, offsetqY = 0, offsetqZ = 0;
    let clientSnapshotEuler = null, interpolationSnapshotEuler = null, chassisBodyEuler = null, correctionQuaternion = null;

    clientSnapshotEuler = new Euler().setFromQuaternion(new Quaternion().set(
      args.correction.qX,
      args.correction.qY,
      args.correction.qZ,
      args.correction.qW
    ));

    interpolationSnapshotEuler = new Euler().setFromQuaternion(new Quaternion().set(
      args.snapshot.qX,
      args.snapshot.qY,
      args.snapshot.qZ,
      args.snapshot.qW
    ));

    offsetqX = clientSnapshotEuler.x - interpolationSnapshotEuler.x;
    offsetqY = clientSnapshotEuler.y - interpolationSnapshotEuler.y;
    offsetqZ = clientSnapshotEuler.z - interpolationSnapshotEuler.z;

    if (Math.abs(offsetqY) > 0.001) {
      // TO DO rotation quaternion with out Euler transforms
      chassisBodyEuler = new Euler().setFromQuaternion(new Quaternion().set(
        chassisBody.quaternion.x,
        chassisBody.quaternion.y,
        chassisBody.quaternion.z,
        chassisBody.quaternion.w
      ));

      correctionQuaternion = new Quaternion().setFromEuler(new Euler().set(
         chassisBodyEuler.x,
         chassisBodyEuler.y - (offsetqY / correction),
         chassisBodyEuler.z
      ));

      chassisBody.quaternion.set(
        correctionQuaternion.x,
        correctionQuaternion.y,
        correctionQuaternion.z,
        correctionQuaternion.w
      )

    }



    for (let i = 0; i < wheels.length; i++) {
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
};

export const createNewCorrection: Behavior = (entity: Entity, args): void => {
  //
  if (hasComponent(entity, ControllerColliderComponent)) {
    const capsule = getComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
    args.state.push({
       networkId: args.networkId,
       x: capsule.body.position.x,
       y: capsule.body.position.y,
       z: capsule.body.position.z,
       qX: capsule.body.quaternion.x,
       qY: capsule.body.quaternion.y,
       qZ: capsule.body.quaternion.z,
       qW: capsule.body.quaternion.w
     })
   } else if (hasComponent(entity, VehicleComponent)) {
     const vehicleComponent = getComponent(entity, VehicleComponent) as VehicleComponent;
     const vehicle = vehicleComponent.vehiclePhysics;
     const chassisBody = vehicle.chassisBody;
     const isDriver = vehicleComponent.driver == Network.instance.localAvatarNetworkId;

     if (isDriver) {
       args.state.push({
            networkId: args.networkId,
            x: chassisBody.position.x,
            y: chassisBody.position.y,
            z: chassisBody.position.z,
            qX: chassisBody.quaternion.x,
            qY: chassisBody.quaternion.y,
            qZ: chassisBody.quaternion.z,
            qW: chassisBody.quaternion.w
          })

     }
   }
 //
};
