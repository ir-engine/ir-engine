import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { InteractionCheckHandler } from "../../../interaction/types";
import { VehicleBody } from "../../../physics/components/VehicleBody";

export const getInCarPossible: InteractionCheckHandler = (possibleDriverEntity, carEntity) => {
  const vehicleBodyComponent = getMutableComponent(carEntity, VehicleBody);
  // TODO: add some sort of seats system and check available empty seats
  return vehicleBodyComponent && !vehicleBodyComponent.currentDriver;
};