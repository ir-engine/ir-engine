import { getComponent } from "../../../ecs/functions/EntityFunctions";
import { InteractionCheckHandler } from "../../../interaction/types/InteractionTypes";
import { VehicleBody } from "../../../physics/components/VehicleBody";
import { isClient } from "../../../common/functions/isClient";

export const getInCarPossible: InteractionCheckHandler = (possibleDriverEntity, carEntity, focusedPart = 0) => {
  if (isClient) return false;
  const vehicle = getComponent(carEntity, VehicleBody);
  //interactable.currentFocusedPart
  // TODO: add some sort of seats system and check available empty seats

  return vehicle && !vehicle[vehicle.seatPlane[focusedPart]];
};
