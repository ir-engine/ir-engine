import { getComponent } from "../../../ecs/functions/EntityFunctions";
import { InteractionCheckHandler } from "../../../interaction/types/InteractionTypes";
import { VehicleBody } from "../../../physics/components/VehicleBody";
import { isClient } from "../../../common/functions/isClient";

export const getInCarPossible: InteractionCheckHandler = (possibleDriverEntity, carEntity, focusedPart = 0) => {
  const vehicle = getComponent(carEntity, VehicleBody);
  //console.warn('vehicle.driver '+vehicle.driver);
  //console.warn('vehicle.passenger '+vehicle.passenger);
  return vehicle && !vehicle[vehicle.seatPlane[focusedPart]];
};
