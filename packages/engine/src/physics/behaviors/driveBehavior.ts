import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getMutableComponent, getComponent } from '../../ecs/functions/EntityFunctions';
import { Object3DComponent } from '../../common/components/Object3DComponent';
//import { VehicleComponent } from '../components/VehicleComponent';
import { VehicleBody } from '../components/VehicleBody';
import { Vector2Type } from '../../common/types/NumericalTypes';
import { InputAlias } from "../../input/types/InputAlias";
import { InputType } from "../../input/enums/InputType";
import { Input } from "../../input/components/Input";

export const drive: Behavior = (entity: Entity, args: { direction: number }): void => {
  const vehicleComponent = getMutableComponent<VehicleBody>(entity, VehicleBody);
  const object = getComponent<Object3DComponent>(entity, Object3DComponent).value;
  const vehicle = vehicleComponent.vehiclePhysics;
  //const vehicle = vehicleComponent.vehicle;

  vehicle.setBrake(0, 0);
  vehicle.setBrake(0, 1);
  vehicle.setBrake(0, 2);
  vehicle.setBrake(0, 3);

  // direction is reversed to match 1 to be forward
  vehicle.applyEngineForce(vehicleComponent.maxForce * args.direction * -1, 2);
  vehicle.applyEngineForce(vehicleComponent.maxForce * args.direction * -1, 3);
};

export const driveByInputAxis: Behavior = (entity: Entity, args: { input: InputAlias, inputType: InputType }): void => {
  const input =  getComponent<Input>(entity, Input as any);
  const data = input.data.get(args.input);

  const vehicleComponent = getMutableComponent<VehicleBody>(entity, VehicleBody);
  const vehicle = vehicleComponent.vehiclePhysics;

  vehicle.setBrake(0, 0);
  vehicle.setBrake(0, 1);
  vehicle.setBrake(0, 2);
  vehicle.setBrake(0, 3);

  if (data.type === InputType.TWODIM) {
    // direction is reversed to match 1 to be forward
    vehicle.applyEngineForce(vehicleComponent.maxForce * data.value[0] * -1, 2);
    vehicle.applyEngineForce(vehicleComponent.maxForce * data.value[0] * -1, 3);

    vehicle.setSteeringValue( vehicleComponent.maxSteerVal * data.value[1], 0);
    vehicle.setSteeringValue( vehicleComponent.maxSteerVal * data.value[1], 1);
  }
};