import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { VehicleBody } from '../components/VehicleBody';

export const driveSteering: Behavior = (entity: Entity, args: { direction: number }): void => {

  const vehicleComponent = getMutableComponent<VehicleBody>(entity, VehicleBody);
  const vehicle = vehicleComponent.vehiclePhysics;

  vehicle.setSteeringValue( vehicleComponent.maxSteerVal * args.direction, 0);
  vehicle.setSteeringValue( vehicleComponent.maxSteerVal * args.direction, 1);

};
