import { Body, Cylinder, Quaternion, RaycastVehicle, Sphere, Vec3 } from 'cannon-es';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { VehicleBody } from '../../physics/components/VehicleBody';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { NetworkObject } from '../../networking/components/NetworkObject';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { createTrimesh } from './physicalPrimitives';
import { createVehicleBody } from './createVehicleBody';
import { isClient } from "../../common/functions/isClient";
import { isServer } from "../../common/functions/isServer";

export const VehicleBehavior: Behavior = (entity: Entity, args): void => {
  if (args.phase == 'onAdded') {

    const vehicleComponent = getMutableComponent(entity, VehicleBody);
    const vehicle = createVehicleBody(entity);
    vehicleComponent.vehiclePhysics = vehicle;

  } else if (isClient && PhysicsSystem.serverOnlyRigidBodyCollides && args.phase == 'onUpdate') {

    const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
    const vehicleComponent = getComponent(entity, VehicleBody) as VehicleBody;

    if (hasComponent(entity, NetworkObject) && args.clientSnapshot.interpolationSnapshot) {
      const networkObject = getComponent<NetworkObject>(entity, NetworkObject)
      const interpolationSnapshot = args.clientSnapshot.interpolationSnapshot.state.find(v => v.networkId == networkObject.networkId);
      if (!interpolationSnapshot) return;

      transform.position.set(
        interpolationSnapshot.x,
        interpolationSnapshot.y,
        interpolationSnapshot.z
      );

      transform.rotation.set(
        interpolationSnapshot.qX,
        interpolationSnapshot.qY,
        interpolationSnapshot.qZ,
        interpolationSnapshot.qW
      );
    }

  } else if (isClient && args.phase == 'onUpdate') {

    const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
    const vehicleComponent = getComponent(entity, VehicleBody) as VehicleBody;
    const correction = args.clientSnapshot.correction;

    if (hasComponent(entity, NetworkObject) && args.clientSnapshot.interpolationSnapshot) {
      const networkObject = getComponent<NetworkObject>(entity, NetworkObject)
      const interpolationSnapshot = args.clientSnapshot.interpolationSnapshot.state.find(v => v.networkId == networkObject.networkId);

      if( vehicleComponent.vehiclePhysics != null && vehicleComponent.vehicleMesh != null){

        const vehicle = vehicleComponent.vehiclePhysics;
        const chassisBody = vehicle.chassisBody;
        const wheels = vehicleComponent.arrayWheelsMesh;
        const carSpeed = vehicle.currentVehicleSpeedKmHour;
        const forceStop = vehicleComponent.mass / 4;
/*
        if (carSpeed > 1) {
          vehicle.applyEngineForce(forceStop, 0);
          vehicle.applyEngineForce(forceStop, 1);
          vehicle.applyEngineForce(forceStop, 2);
          vehicle.applyEngineForce(forceStop, 3);
        } else if (carSpeed < -1) {
          vehicle.applyEngineForce(-forceStop, 0);
          vehicle.applyEngineForce(-forceStop, 1);
          vehicle.applyEngineForce(-forceStop, 2);
          vehicle.applyEngineForce(-forceStop, 3);
        } else if (carSpeed < 0.1 && carSpeed != 0) {
          vehicle.applyEngineForce(-carSpeed, 0);
          vehicle.applyEngineForce(-carSpeed, 1);
          vehicle.applyEngineForce(-carSpeed, 2);
          vehicle.applyEngineForce(-carSpeed, 3);
        } else if (carSpeed != 0) {
          vehicle.setBrake(carSpeed/2, 0);
          vehicle.setBrake(carSpeed/2, 1);
          vehicle.setBrake(carSpeed/2, 2);
          vehicle.setBrake(carSpeed/2, 3);
        }
        if (interpolationSnapshot) {
          let offsetX = 0, offsetY = 0, offsetZ = 0;
          const offsetqX = 0, offsetqY = 0, offsetqZ = 0, offsetqW = 0;

          offsetX = chassisBody.position.x - interpolationSnapshot.x;
          offsetY = chassisBody.position.y - interpolationSnapshot.y;
          offsetZ = chassisBody.position.z - interpolationSnapshot.z;


          if (Math.abs(offsetX) + Math.abs(offsetY) + Math.abs(offsetZ) > 3) {
            chassisBody.position.x = interpolationSnapshot.x;
            chassisBody.position.y = interpolationSnapshot.y;
            chassisBody.position.z = interpolationSnapshot.z;
          } else {
            chassisBody.position.x -= (offsetX / correction);
            chassisBody.position.y -= (offsetY / correction);
            chassisBody.position.z -= (offsetZ / correction);
          }
        }

        transform.position.set(
          chassisBody.position.x,
          chassisBody.position.y,
          chassisBody.position.z
        );

        transform.rotation.set(
          chassisBody.quaternion.x,
          chassisBody.quaternion.y,
          chassisBody.quaternion.z,
          chassisBody.quaternion.w
        );
        */

        transform.position.set(
          interpolationSnapshot.x,
          interpolationSnapshot.y,
          interpolationSnapshot.z
        );

        transform.rotation.set(
          interpolationSnapshot.qX,
          interpolationSnapshot.qY,
          interpolationSnapshot.qZ,
          interpolationSnapshot.qW
        );

        chassisBody.position.set(
          interpolationSnapshot.x,
          interpolationSnapshot.y,
          interpolationSnapshot.z
        );

        chassisBody.quaternion.set(
          interpolationSnapshot.qX,
          interpolationSnapshot.qY,
          interpolationSnapshot.qZ,
          interpolationSnapshot.qW
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

  } else if (isServer && args.phase == 'onUpdate') {

    const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
    const vehicleComponent = getComponent(entity, VehicleBody) as VehicleBody;

    if( vehicleComponent.vehiclePhysics != null && vehicleComponent.vehicleMesh != null){

      const vehicle = vehicleComponent.vehiclePhysics;
      const chassisBody = vehicle.chassisBody;
      const wheels = vehicleComponent.arrayWheelsMesh;
      const carSpeed = vehicle.currentVehicleSpeedKmHour;
      const forceStop = vehicleComponent.mass / 4;
/*
      if (carSpeed > 1) {
        vehicle.applyEngineForce(forceStop, 0);
        vehicle.applyEngineForce(forceStop, 1);
        vehicle.applyEngineForce(forceStop, 2);
        vehicle.applyEngineForce(forceStop, 3);
      } else if (carSpeed < -1) {
        vehicle.applyEngineForce(-forceStop, 0);
        vehicle.applyEngineForce(-forceStop, 1);
        vehicle.applyEngineForce(-forceStop, 2);
        vehicle.applyEngineForce(-forceStop, 3);
      } else if (carSpeed < 0.1 && carSpeed != 0) {
        vehicle.applyEngineForce(-carSpeed, 0);
        vehicle.applyEngineForce(-carSpeed, 1);
        vehicle.applyEngineForce(-carSpeed, 2);
        vehicle.applyEngineForce(-carSpeed, 3);
      } else if (carSpeed != 0) {
        vehicle.setBrake(carSpeed/2, 0);
        vehicle.setBrake(carSpeed/2, 1);
        vehicle.setBrake(carSpeed/2, 2);
        vehicle.setBrake(carSpeed/2, 3);
      }
*/
      transform.position.set(
        chassisBody.position.x,
        chassisBody.position.y,
        chassisBody.position.z
      );

      transform.rotation.set(
        chassisBody.quaternion.x,
        chassisBody.quaternion.y,
        chassisBody.quaternion.z,
        chassisBody.quaternion.w
      );

      for (let i = 0; i < wheels.length; i++) {

        vehicle.updateWheelTransform(i);
/*
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
        */
      }

  } else {
    console.warn("User data for vehicle not found");
  }


  } else if (args.phase == 'onRemoved') {
    // TO DO
    /*
    const object = getComponent<Object3DComponent>(entity, Object3DComponent, true)?.value;
    if (!object) {
      return
    }
    const body = object.userData.vehicle;
    delete object.userData.vehicle;
    PhysicsSystem.physicsWorld.removeBody(body);
    */
  }
};
