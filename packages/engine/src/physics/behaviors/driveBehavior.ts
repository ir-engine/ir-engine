import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getMutableComponent, getComponent } from '../../ecs/functions/EntityFunctions';
import { Object3DComponent } from '../../common/components/Object3DComponent';
//import { VehicleComponent } from '../components/VehicleComponent';
import { VehicleBody } from '../components/VehicleBody';
import { Vector2Type } from '../../common/types/NumericalTypes';

export const drive: Behavior = (entity: Entity, args: { value: Vector2Type }): void => {
  const vehicleComponent = getMutableComponent<VehicleBody>(entity, VehicleBody);
  const object = getComponent<Object3DComponent>(entity, Object3DComponent).value;
  const vehicle = vehicleComponent.vehiclePhysics
  //const vehicle = vehicleComponent.vehicle;

  vehicle.setBrake(0, 0);
  vehicle.setBrake(0, 1);
  vehicle.setBrake(0, 2);
  vehicle.setBrake(0, 3);

  // forward
  if (args.value[1] > 0) {
    vehicle.applyEngineForce(vehicleComponent.maxForce, 2);
    vehicle.applyEngineForce(vehicleComponent.maxForce, 3);
  }
  // backward
  else if (args.value[1] < 0) {
    vehicle.applyEngineForce(-vehicleComponent.maxForce, 2);
    vehicle.applyEngineForce(-vehicleComponent.maxForce, 3);
    // left
  } else if (args.value[0] > 0) {
    vehicle.setSteeringValue( -vehicleComponent.maxSteerVal, 0);
    vehicle.setSteeringValue( -vehicleComponent.maxSteerVal, 1);
    // right
  } else if (args.value[0] < 0) {
    vehicle.setSteeringValue( vehicleComponent.maxSteerVal, 0);
    vehicle.setSteeringValue( vehicleComponent.maxSteerVal, 1);
  }
};
