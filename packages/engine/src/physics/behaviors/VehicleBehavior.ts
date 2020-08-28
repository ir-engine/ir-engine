import { Quaternion, Box, Cylinder, Vec3, RaycastVehicle, Body } from 'cannon-es';

import { Behavior } from '../../common/interfaces/Behavior';
import { TransformComponent } from '../../transform/components/TransformComponent';

import { getMutableComponent, getComponent } from '../../ecs/functions/EntityFunctions';
import { PhysicsWorld } from '../../physics/components/PhysicsWorld';
import { VehicleBody } from '../../physics/components/VehicleBody';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { Entity } from '../../ecs/classes/Entity';

const quaternion = new Quaternion();

export const VehicleBehavior: Behavior = (entity: Entity, args): void => {
  if (args.phase == 'onAdded') {
    const object = getComponent<Object3DComponent>(entity, Object3DComponent).value;

    const vehicleComponent = getComponent(entity, VehicleBody) as VehicleBody;

    const [vehicle, wheelBodies] = _createVehicleBody(entity, vehicleComponent.convexMesh);
    object.userData.vehicle = vehicle;
    vehicle.addToWorld(PhysicsWorld.instance.physicsWorld);

    for (let i = 0; i < wheelBodies.length; i++) {
      PhysicsWorld.instance.physicsWorld.addBody(wheelBodies[i]);
    }
  } else if (args.phase == 'onUpdate') {



    const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
    const object = getComponent<Object3DComponent>(entity, Object3DComponent).value;

    if(object.userData){
      const vehicle = object.userData.vehicle.chassisBody;

      transform.position[0] = vehicle.position.x;
      transform.position[1] = vehicle.position.y;
      transform.position[2] = vehicle.position.z;
      // transform.position.y += 0.6

      transform.rotation[0] = vehicle.quaternion.x
      transform.rotation[1] = vehicle.quaternion.y
      transform.rotation[2] = vehicle.quaternion.z
      transform.rotation[3] = vehicle.quaternion.w
    }


  } else if (args.phase == 'onRemoved') {
    const object = getComponent<Object3DComponent>(entity, Object3DComponent).value;
    const body = object.userData.vehicle;
    delete object.userData.vehicle;
    PhysicsWorld.instance.physicsWorld.removeBody(body);
  }
};

export function _createVehicleBody (entity: Entity, mesh: any): [RaycastVehicle, Body[]] {
  const transform = getComponent<TransformComponent>(entity, TransformComponent);
  let chassisBody;
  if (mesh) {
    chassisBody = this._createConvexGeometry(entity, mesh);
  } else {
    const chassisShape = new Box(new Vec3(1, 1.2, 3));
    chassisBody = new Body({ mass: 150 });
    chassisBody.addShape(chassisShape);
  }
  //  let
  chassisBody.position.x = transform.position[0]
  chassisBody.position.y = transform.position[1]
  chassisBody.position.z = transform.position[2]
  //  chassisBody.angularVelocity.set(0, 0, 0.5);
  const options = {
    radius: 0.5,
    directionLocal: new Vec3(0, -1, 0),
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    frictionSlip: 5,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000,
    rollInfluence: 0.01,
    axleLocal: new Vec3(-1, 0, 0),
    chassisConnectionPointLocal: new Vec3(),
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true
  };

  // Create the vehicle
  const vehicle = new RaycastVehicle({
    chassisBody: chassisBody,
    indexUpAxis: 1,
    indexRightAxis: 0,
    indexForwardAxis: 2
  });

  options.chassisConnectionPointLocal.set(1.4, -0.6, 2.35);
  vehicle.addWheel(options);

  options.chassisConnectionPointLocal.set(-1.4, -0.6, 2.35);
  vehicle.addWheel(options);

  options.chassisConnectionPointLocal.set(-1.4, -0.6, -2.2);
  vehicle.addWheel(options);

  options.chassisConnectionPointLocal.set(1.4, -0.6, -2.2);
  vehicle.addWheel(options);

  const wheelBodies = [];
  for (let i = 0; i < vehicle.wheelInfos.length; i++) {
    const cylinderShape = new Cylinder(1, 1, 0.1, 20);
    const wheelBody = new Body({
      mass: 0
    });
    wheelBody.type = Body.KINEMATIC;
    wheelBody.collisionFilterGroup = 0; // turn off collisions
    wheelBody.addShape(cylinderShape);
    wheelBodies.push(wheelBody);
    // demo.addVisual(wheelBody);
    // addBody(wheelBody);
  }

  return [vehicle, wheelBodies];
}
