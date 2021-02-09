import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { CharacterStateTypes } from "@xr3ngine/engine/src/templates/character/CharacterStateTypes";
import { Entity } from '../../../ecs/classes/Entity';
import { getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { VehicleBody } from '../../../physics/components/VehicleBody';
import { addState } from "../../../state/behaviors/addState";


export const getOutCar: Behavior = (entity: Entity): void => {
  console.warn("Getting out of car");
  const vehicleComponent = getMutableComponent(entity, VehicleBody);
  const entityDriver = vehicleComponent.currentDriver;

  addState(entityDriver, {state: CharacterStateTypes.EXITING_CAR});

  const event = new CustomEvent('player-in-car', { detail:{inCar:false} });
  document.dispatchEvent(event);

};
