import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { VehicleComponent } from '../components/VehicleComponent';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { CollisionGroups } from "../../physics/enums/CollisionGroups";
import { PhysicsLifecycleState } from "../../physics/enums/PhysicsStates";
import { Vector3 } from "three";
import { isClient } from '../../common/functions/isClient';

/**
 * @author HydraFire <github.com/HydraFire>
 */

function createVehicleComponent (entity: Entity ) {
  const vehicleComponent = getMutableComponent<VehicleComponent>(entity, VehicleComponent);
  // @ts-ignore
  const colliderTrimOffset = new Vector3().set(...vehicleComponent.colliderTrimOffset);
  // @ts-ignore
  const collidersSphereOffset = new Vector3().set(...vehicleComponent.collidersSphereOffset);
  const wheelsPositions = vehicleComponent.arrayWheelsPosition;
  const wheelRadius = vehicleComponent.wheelRadius;
  const chassisBody = vehicleComponent.vehicleCollider;

  chassisBody.collisionFilterGroup = CollisionGroups.Car;
  chassisBody.position.set( ...vehicleComponent.startPosition );
  chassisBody.quaternion.set( ...vehicleComponent.startQuaternion );
  //chassisBody.angularVelocity.set(0, 0, 0.5);

  const options = {
    radius: wheelRadius,
    directionLocal: new Vector3(0, -1, 0),
    suspensionStiffness: 30,
    suspensionRestLength: vehicleComponent.suspensionRestLength,
    frictionSlip: 5,
    dampingRelaxation: 2.3,
    dampingCompression: 1.4,
    maxSuspensionForce: 100000,
    rollInfluence: 0.01,
    axleLocal: new Vector3(-1, 0, 0),
    chassisConnectionPointLocal: new Vector3(),
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true
  };

  // TODO: implement vehicles in physx

  // // Create the vehicle
  // const vehicle = new RaycastVehicle({
  //   chassisBody: chassisBody,
  //   indexUpAxis: 1,
  //   indexRightAxis: 0,
  //   indexForwardAxis: 2
  // });

  // for (let i = 0; i < wheelsPositions.length; i++) {
  //   options.chassisConnectionPointLocal.set( wheelsPositions[i][0], wheelsPositions[i][1], wheelsPositions[i][2]);
  //   vehicle.addWheel(options);
  // }


  /*
    const wheelBodies = [];
    for (let i = 0; i < vehicle.wheelInfos.length; i++) {
      const cylinderShape = new Cylinder(wheelRadius, wheelRadius, 0.1, 20);
      const wheelBody = new Body({
        mass: 0
      });
      wheelBody.type = Body.KINEMATIC;
      wheelBody.collisionFilterGroup = 0; // turn off collisions
      wheelBody.addShape(cylinderShape);
      wheelBodies.push(wheelBody);

    }
  */

  // vehicle.addToWorld(PhysicsSystem.instance);

/*
  for (let i = 0; i < wheelBodies.length; i++) {
    PhysicsSystem.instance.addBody(wheelBodies[i]);
  }
  */
  // return vehicle;
  return null;
}

export const VehicleBehavior: Behavior = (entity: Entity, args): void => {
  if (args.phase == PhysicsLifecycleState.onAdded) {
    const vehicleComponent = getMutableComponent(entity, VehicleComponent);
    const vehicle = createVehicleComponent(entity);
    vehicleComponent.vehiclePhysics = vehicle;
  } else if ( args.phase == PhysicsLifecycleState.onUpdate) {

    const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
    const vehicleComponent = getComponent(entity, VehicleComponent) as VehicleComponent;

    if( vehicleComponent.vehiclePhysics != null ) {

      const vehicle = vehicleComponent.vehiclePhysics;
      const isMoved = vehicleComponent.isMoved;
      const chassisBody = vehicle.chassisBody;
      const wheels = vehicleComponent.arrayWheelsMesh;
      const carSpeed = vehicle.currentVehicleSpeedKmHour;


        // STOP FORCE
        if (!isMoved && (carSpeed > 1 || carSpeed < -1) ) {
          vehicle.applyEngineForce(carSpeed * 2, 2);
          vehicle.applyEngineForce(carSpeed * 2, 3);
        } else if (!isMoved && (carSpeed < 0.1 && carSpeed > -0.1)) {
          vehicle.setBrake(0.3, 0);
          vehicle.setBrake(0.3, 1);
          vehicle.applyEngineForce(-1, 2);
          vehicle.applyEngineForce(-1, 3);
        } else if (!isMoved && (carSpeed < 1 && carSpeed > -1)) {
          vehicle.setBrake(2, 0);
          vehicle.setBrake(2, 1);
          vehicle.applyEngineForce(-3, 2);
          vehicle.applyEngineForce(-3, 3);
        }


      // APPLY PHYSICS TO TRANSFORM
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
      if(!isClient) {
        for (let i = 0; i < wheels.length; i++) {
          vehicle.updateWheelTransform(i);
        }
      }

    } else {
      console.warn("User data for vehicle not found");
    }

  } else if (args.phase == PhysicsLifecycleState.onRemoved) {
    // TO DO
    /*
    const object = getComponent<Object3DComponent>(entity, Object3DComponent, true)?.value;
    if (!object) {
      return
    }
    const body = object.userData.vehicle;
    delete object.userData.vehicle;
    PhysicsSystem.instance.removeBody(body);
    */
  }
};
