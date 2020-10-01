import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { VehicleBody } from '../components/VehicleBody';

export const driveHandBrake: Behavior = (entity: Entity, args: { on:boolean }): void => {
  const vehicleComponent = getMutableComponent<VehicleBody>(entity, VehicleBody);
  const vehicle = vehicleComponent.vehiclePhysics;

  vehicle.setBrake(args.on? 1 : 0, 0);
  vehicle.setBrake(args.on? 1 : 0, 1);
  vehicle.setBrake(args.on? 1 : 0, 2);
  vehicle.setBrake(args.on? 1 : 0, 3);
};
