import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { Vector2 } from 'three';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { VehicleComponent } from '..';

export const getInCar: Behavior = (entity: Entity, args: { value: Vector2 }): void => {
  const vehicleComponent = getMutableComponent<VehicleComponent>(entity, VehicleComponent);
  const vehicle = vehicleComponent.vehicle;

  vehicle.setBrake(0, 0);
  vehicle.setBrake(0, 1);
  vehicle.setBrake(0, 2);
  vehicle.setBrake(0, 3);

  // forward
  if (args.value[1] > 0) {
    vehicle.applyEngineForce(-vehicleComponent.maxForce, 2);
    vehicle.applyEngineForce(-vehicleComponent.maxForce, 3);
  }
  // backward
  else if (args.value[1] < 0) {
    vehicle.applyEngineForce(vehicleComponent.maxForce, 2);
    vehicle.applyEngineForce(vehicleComponent.maxForce, 3);
    // left
  } else if (args.value[0] > 0) {
    vehicle.setBrake(vehicleComponent.brakeForce, 0);
    vehicle.setBrake(vehicleComponent.brakeForce, 1);
    // right
  } else if (args.value[0] < 0) {
    vehicle.setBrake(vehicleComponent.brakeForce, 2);
    vehicle.setBrake(vehicleComponent.brakeForce, 3);
  }
};
