import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getMutableComponent, getComponent } from '../../ecs/functions/EntityFunctions';
import { VehicleBody } from '../components/VehicleBody';

export const driveSteering: Behavior = (entity: Entity, args: { direction:number }): void => {
  const vehicleComponent = getMutableComponent<VehicleBody>(entity, VehicleBody);
  //const object = getComponent<Object3DComponent>(entity, Object3DComponent).value;
  const vehicle = vehicleComponent.vehiclePhysics;
  //const vehicle = vehicleComponent.vehicle;

  vehicle.setSteeringValue( vehicleComponent.maxSteerVal * args.direction, 0);
  vehicle.setSteeringValue( vehicleComponent.maxSteerVal * args.direction, 1);
};
